const customerService = require('../services/CustomerService');

class CustomerController {
  async getAll(req, res, next) {
    try {
      const data = await customerService.getAll();
      res.json({ data, total: data.length });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const data = await customerService.getById(req.params.id);
      res.json({ data });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const data = await customerService.create(req.body);
      res.status(201).json({ data, message: 'Cliente criado com sucesso' });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const data = await customerService.update(req.params.id, req.body);
      res.json({ data, message: 'Cliente atualizado com sucesso' });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await customerService.delete(req.params.id);
      res.json({ message: 'Cliente removido com sucesso' });
    } catch (err) { next(err); }
  }
}

module.exports = new CustomerController();
