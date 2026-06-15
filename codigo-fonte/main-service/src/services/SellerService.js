const db = require('../config/database');
const SellerRepository = require('../repositories/SellerRepository');

const repo = new SellerRepository(db);

class SellerService {
  async listAll() {
    return repo.findAll();
  }

  async getById(id) {
    const seller = await repo.findById(id);
    if (!seller) throw Object.assign(new Error('Vendedor nao encontrado'), { statusCode: 404 });
    return seller;
  }

  async create(data) {
    if (!data.name || !data.email) {
      throw Object.assign(new Error('name e email sao obrigatorios'), { statusCode: 400 });
    }
    return repo.create(data);
  }

  async update(id, data) {
    if (!data.name || !data.email) {
      throw Object.assign(new Error('name e email sao obrigatorios'), { statusCode: 400 });
    }
    const updated = await repo.update(id, data);
    if (!updated) throw Object.assign(new Error('Vendedor nao encontrado'), { statusCode: 404 });
    return updated;
  }

  async delete(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw Object.assign(new Error('Vendedor nao encontrado'), { statusCode: 404 });
  }
}

module.exports = new SellerService();
