const db = require('../config/database');
const SaleRepository = require('../repositories/SaleRepository');
const ProductRepository = require('../repositories/ProductRepository');

const saleRepo = new SaleRepository(db);
const productRepo = new ProductRepository(db);

class SaleService {
  async listAll() {
    return saleRepo.findAll();
  }

  async getById(id) {
    const sale = await saleRepo.findById(id);
    if (!sale) throw Object.assign(new Error('Venda nao encontrada'), { statusCode: 404 });
    return sale;
  }

  async create({ customer_id, seller_id, notes, items }) {
    if (!customer_id || !seller_id || !Array.isArray(items) || items.length === 0) {
      throw Object.assign(
        new Error('customer_id, seller_id e ao menos um item sao obrigatorios'),
        { statusCode: 400 }
      );
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      for (const item of items) {
        if (!item.product_id || !item.quantity || !item.unit_price) {
          throw Object.assign(
            new Error('Cada item precisa de product_id, quantity e unit_price'),
            { statusCode: 400 }
          );
        }
        const ok = await productRepo.decrementStock(client, item.product_id, item.quantity);
        if (!ok) {
          throw Object.assign(
            new Error(`Estoque insuficiente para o produto ${item.product_id}`),
            { statusCode: 422 }
          );
        }
      }

      const sale = await saleRepo.createWithItems(client, { customer_id, seller_id, notes, items });
      await client.query('COMMIT');
      return sale;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async cancel(id) {
    const sale = await saleRepo.cancel(id);
    if (!sale) {
      throw Object.assign(
        new Error('Venda nao encontrada ou ja cancelada'),
        { statusCode: 404 }
      );
    }
    return sale;
  }

  async delete(id) {
    const deleted = await saleRepo.delete(id);
    if (!deleted) throw Object.assign(new Error('Venda nao encontrada'), { statusCode: 404 });
  }
}

module.exports = new SaleService();
