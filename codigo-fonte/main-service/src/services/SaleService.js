const db = require('../config/database');
const SaleRepository = require('../repositories/SaleRepository');
const ProductRepository = require('../repositories/ProductRepository');
const CustomerRepository = require('../repositories/CustomerRepository');
const SellerRepository = require('../repositories/SellerRepository');
const SaleFactory = require('../patterns/SaleFactory');
const observer = require('../patterns/EventObserver');

const saleRepo    = new SaleRepository(db);
const productRepo = new ProductRepository(db);
const customerRepo = new CustomerRepository(db);
const sellerRepo  = new SellerRepository(db);

class SaleService {
  async getAll() {
    return saleRepo.findAll();
  }

  async getById(id) {
    const sale = await saleRepo.findById(id);
    if (!sale) throw Object.assign(new Error(`Venda com ID ${id} nao encontrada`), { statusCode: 404 });
    return sale;
  }

  async create(data) {
    // Factory valida e estrutura o objeto de venda
    const saleData = SaleFactory.create(data);

    const customer = await customerRepo.findById(saleData.customerId);
    if (!customer) throw Object.assign(new Error(`Cliente com ID ${saleData.customerId} nao encontrado`), { statusCode: 404 });

    const seller = await sellerRepo.findById(saleData.sellerId);
    if (!seller) throw Object.assign(new Error(`Vendedor com ID ${saleData.sellerId} nao encontrado`), { statusCode: 404 });

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const sale = await saleRepo.create(client, {
        customerId: saleData.customerId,
        sellerId: saleData.sellerId,
        notes: saleData.notes,
      });

      let totalAmount = 0;
      const processedItems = [];
      const lowStockItems = [];

      for (const item of saleData.items) {
        const product = await productRepo.findById(item.productId);
        if (!product) {
          throw Object.assign(new Error(`Produto com ID ${item.productId} nao encontrado`), { statusCode: 404 });
        }
        if (product.stock_quantity < item.quantity) {
          throw Object.assign(
            new Error(`Estoque insuficiente para "${product.name}". Disponivel: ${product.stock_quantity}, Solicitado: ${item.quantity}`),
            { statusCode: 409 }
          );
        }

        const updatedProduct = await productRepo.decreaseStock(client, item.productId, item.quantity);
        if (!updatedProduct) {
          throw Object.assign(new Error(`Falha ao atualizar estoque do produto ID ${item.productId}`), { statusCode: 409 });
        }

        await saleRepo.addItem(client, {
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
        });

        totalAmount += Number(product.price) * item.quantity;
        processedItems.push({ ...item, name: product.name, unitPrice: product.price });

        if (updatedProduct.stock_quantity <= updatedProduct.low_stock_threshold) {
          lowStockItems.push(updatedProduct);
        }
      }

      const finalSale = await saleRepo.updateTotal(client, sale.id, totalAmount);
      await client.query('COMMIT');

      // Observer notifica apos a transacao ser confirmada
      observer.notify('sale:created', {
        saleId: finalSale.id,
        items: processedItems,
        lowStockItems,
        customerId: saleData.customerId,
        sellerId: saleData.sellerId,
        totalAmount,
      });

      return saleRepo.findById(finalSale.id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async cancel(id) {
    const sale = await saleRepo.findById(id);
    if (!sale) throw Object.assign(new Error(`Venda com ID ${id} nao encontrada`), { statusCode: 404 });
    if (sale.status === 'cancelled') {
      throw Object.assign(new Error(`Venda com ID ${id} ja esta cancelada`), { statusCode: 409 });
    }

    const items = await saleRepo.getSaleItems(id);
    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      const cancelled = await saleRepo.cancelWithClient(client, id);
      if (!cancelled) throw Object.assign(new Error('Nao foi possivel cancelar a venda'), { statusCode: 409 });

      for (const item of items) {
        await productRepo.increaseStock(client, item.product_id, item.quantity);
      }

      await client.query('COMMIT');

      observer.notify('sale:cancelled', { saleId: id, items });

      return saleRepo.findById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new SaleService();
