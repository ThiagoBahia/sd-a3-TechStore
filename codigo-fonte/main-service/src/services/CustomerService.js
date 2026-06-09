const db = require('../config/database');
const CustomerRepository = require('../repositories/CustomerRepository');

const repo = new CustomerRepository(db);

class CustomerService {
  async listAll() {
    return repo.findAll();
  }

  async getById(id) {
    const customer = await repo.findById(id);
    if (!customer) throw Object.assign(new Error('Cliente nao encontrado'), { statusCode: 404 });
    return customer;
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
    if (!updated) throw Object.assign(new Error('Cliente nao encontrado'), { statusCode: 404 });
    return updated;
  }

  async delete(id) {
    const deleted = await repo.delete(id);
    if (!deleted) throw Object.assign(new Error('Cliente nao encontrado'), { statusCode: 404 });
  }
}

module.exports = new CustomerService();
