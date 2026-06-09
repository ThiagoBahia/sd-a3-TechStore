const saleService = require('../services/SaleService');

class SaleController {
  async list(req, res, next) {
    try { res.json(await saleService.listAll()); }
    catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try { res.json(await saleService.getById(req.params.id)); }
    catch (err) { next(err); }
  }

  async create(req, res, next) {
    try { res.status(201).json(await saleService.create(req.body)); }
    catch (err) { next(err); }
  }

  async cancel(req, res, next) {
    try { res.json(await saleService.cancel(req.params.id)); }
    catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await saleService.delete(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
}

module.exports = new SaleController();
