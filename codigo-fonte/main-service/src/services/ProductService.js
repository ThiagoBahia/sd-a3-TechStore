const db = require('../config/database');
const ProductRepository = require('../repositories/ProductRepository');

const repo = new ProductRepository(db);

class ProductService {
  async listAll() {
    return repo.findAll();
  }

  async getById(id) {
    const product = await repo.findById(id);
    if (!product) throw Object.assign(new Error('Produto nao encontrado'), { statusCode: 404 });
    return product;
  }

  async create(data) {
    if (!data.name || data.price == null) {
      throw Object.assign(new Error('name e price sao obrigatorios'), { statusCode: 400 });
    }
    return repo.create(data);
  }

  async update(id, data) {
    if (!data.name || data.price == null) {
      throw Object.assign(new Error('name e price sao obrigatorios'), { statusCode: 400 });
    }
    const updated = await repo.update(id, data);
    if (!updated) throw Object.assign(new Error('Produto nao encontrado'), { statusCode: 404 });
    return updated;
  }

  async delete(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw Object.assign(new Error('Produto nao encontrado'), { statusCode: 404 });
  }
}

module.exports = new ProductService();
