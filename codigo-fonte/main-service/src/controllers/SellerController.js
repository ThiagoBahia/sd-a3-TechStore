const sellerService = require('../services/SellerService');

class SellerController {
  async list(req, res, next) {
    try { res.json(await sellerService.listAll()); }
    catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try { res.json(await sellerService.getById(req.params.id)); }
    catch (err) { next(err); }
  }

  async create(req, res, next) {
    try { res.status(201).json(await sellerService.create(req.body)); }
    catch (err) { next(err); }
  }

  async update(req, res, next) {
    try { res.json(await sellerService.update(req.params.id, req.body)); }
    catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await sellerService.delete(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
}

module.exports = new SellerController();
