const productService = require('../services/ProductService');

class ProductController {
  async list(req, res, next) {
    try { res.json(await productService.listAll()); }
    catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try { res.json(await productService.getById(req.params.id)); }
    catch (err) { next(err); }
  }

  async create(req, res, next) {
    try { res.status(201).json(await productService.create(req.body)); }
    catch (err) { next(err); }
  }

  async update(req, res, next) {
    try { res.json(await productService.update(req.params.id, req.body)); }
    catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await productService.delete(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
}

module.exports = new ProductController();
