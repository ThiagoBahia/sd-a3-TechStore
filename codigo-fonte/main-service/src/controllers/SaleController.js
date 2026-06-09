const saleService = require('../services/SaleService');

class SaleController {
  async getAll(req, res, next) {
    try {
      const data = await saleService.getAll();
      res.json({ data, total: data.length });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const data = await saleService.getById(req.params.id);
      res.json({ data });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const data = await saleService.create(req.body);
      res.status(201).json({ data, message: 'Venda realizada com sucesso' });
    } catch (err) { next(err); }
  }

  async cancel(req, res, next) {
    try {
      const data = await saleService.cancel(req.params.id);
      res.json({ data, message: 'Venda cancelada com sucesso' });
    } catch (err) { next(err); }
  }
}

module.exports = new SaleController();
