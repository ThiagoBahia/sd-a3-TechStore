const customerService = require('../services/CustomerService');

class CustomerController {
  async list(req, res, next) {
    try { res.json(await customerService.listAll()); }
    catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try { res.json(await customerService.getById(req.params.id)); }
    catch (err) { next(err); }
  }

  async create(req, res, next) {
    try { res.status(201).json(await customerService.create(req.body)); }
    catch (err) { next(err); }
  }

  async update(req, res, next) {
    try { res.json(await customerService.update(req.params.id, req.body)); }
    catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await customerService.delete(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
}

module.exports = new CustomerController();
