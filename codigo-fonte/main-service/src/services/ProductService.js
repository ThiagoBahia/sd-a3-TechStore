const db = require('../config/database');
const ProductRepository = require('../repositories/ProductRepository');
const observer = require('../patterns/EventObserver');

const repo = new ProductRepository(db);

class ProductService {
  async getAll() {
    return repo.findAll();
  }

  async getById(id) {
    const product = await repo.findById(id);
    if (!product) throw Object.assign(new Error(`Produto com ID ${id} nao encontrado`), { statusCode: 404 });
    return product;
  }

  async create({ name, description, price, stockQuantity, category, brand, lowStockThreshold }) {
    if (!name || price === undefined || price === null) {
      throw Object.assign(new Error('Nome e preco sao obrigatorios'), { statusCode: 400 });
    }
    if (Number(price) < 0) {
      throw Object.assign(new Error('Preco nao pode ser negativo'), { statusCode: 400 });
    }
    return repo.create({ name, description, price, stockQuantity, category, brand, lowStockThreshold });
  }

  async update(id, data) {
    await this.getById(id);
    const updated = await repo.update(id, data);
    if (!updated) throw Object.assign(new Error(`Produto com ID ${id} nao encontrado`), { statusCode: 404 });

    if (updated.stock_quantity <= updated.low_stock_threshold) {
      observer.notify('product:low_stock', {
        productId: updated.id,
        productName: updated.name,
        quantity: updated.stock_quantity,
      });
    }

    return updated;
  }

  async delete(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw Object.assign(new Error(`Produto com ID ${id} nao encontrado`), { statusCode: 404 });
    return deleted;
  }

  async getLowStock() {
    return repo.findLowStock();
  }
}

module.exports = new ProductService();
