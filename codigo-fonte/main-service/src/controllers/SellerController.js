const sellerService = require('../services/SellerService');

class SellerController {
  async getAll(req, res, next) {
    try {
      const data = await sellerService.getAll();
      res.json({ data, total: data.length });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const data = await sellerService.getById(req.params.id);
      res.json({ data });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const data = await sellerService.create(req.body);
      res.status(201).json({ data, message: 'Vendedor criado com sucesso' });
    } catch (err) { next(err); }
  }

  async update(req, res, next) {
    try {
      const data = await sellerService.update(req.params.id, req.body);
      res.json({ data, message: 'Vendedor atualizado com sucesso' });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await sellerService.delete(req.params.id);
      res.json({ message: 'Vendedor removido com sucesso' });
    } catch (err) { next(err); }
  }
}

module.exports = new SellerController();
