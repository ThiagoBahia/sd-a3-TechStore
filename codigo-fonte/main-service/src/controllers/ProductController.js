const productService = require('../services/ProductService');

class ProductController {
  async getAll(req, res, next) {
    try {
      const data = await productService.getAll();
      res.json({ data, total: data.length });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const data = await productService.getById(req.params.id);
      res.json({ data });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const data = await productService.create(req.body);
      res.status(201).json({ data, message: 'Produto criado com sucesso' });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const data = await productService.update(req.params.id, req.body);
      res.json({ data, message: 'Produto atualizado com sucesso' });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await productService.delete(req.params.id);
      res.json({ message: 'Produto removido com sucesso' });
    } catch (err) { next(err); }
  }

  async getLowStock(req, res, next) {
    try {
      const data = await productService.getLowStock();
      res.json({ data, total: data.length });
    } catch (err) { next(err); }
  }
}

module.exports = new ProductController();
