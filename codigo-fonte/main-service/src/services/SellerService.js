const db = require('../config/database');
const SellerRepository = require('../repositories/SellerRepository');

const repo = new SellerRepository(db);

class SellerService {
  async getAll() {
    return repo.findAll();
  }

  async getById(id) {
    const seller = await repo.findById(id);
    if (!seller) throw Object.assign(new Error(`Vendedor com ID ${id} nao encontrado`), { statusCode: 404 });
    return seller;
  }

  async create({ name, email, phone, commissionRate }) {
    if (!name || !email) throw Object.assign(new Error('Nome e email sao obrigatorios'), { statusCode: 400 });

    const existing = await repo.findByEmail(email);
    if (existing) throw Object.assign(new Error(`Email "${email}" ja esta em uso`), { statusCode: 409 });

    return repo.create({ name, email, phone, commissionRate });
  }

  async update(id, data) {
    await this.getById(id);

    if (data.email) {
      const existing = await repo.findByEmail(data.email);
      if (existing && existing.id !== parseInt(id)) {
        throw Object.assign(new Error(`Email "${data.email}" ja esta em uso`), { statusCode: 409 });
      }
    }

    const updated = await repo.update(id, data);
    if (!updated) throw Object.assign(new Error(`Vendedor com ID ${id} nao encontrado`), { statusCode: 404 });
    return updated;
  }

  async delete(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw Object.assign(new Error(`Vendedor com ID ${id} nao encontrado`), { statusCode: 404 });
    return deleted;
  }
}

module.exports = new SellerService();
