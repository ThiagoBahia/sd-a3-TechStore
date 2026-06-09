const reportService = require('../services/ReportService');

class ReportController {
  async getTopProducts(req, res, next) {
    try {
      const report = await reportService.getTopProducts(req.query.limit);
      res.json(report);
    } catch (err) { next(err); }
  }

  async getProductsByCustomer(req, res, next) {
    try {
      const report = await reportService.getProductsByCustomer(req.params.customerId);
      res.json(report);
    } catch (err) { next(err); }
  }

  async getCustomerAvgConsumption(req, res, next) {
    try {
      const report = await reportService.getCustomerAvgConsumption();
      res.json(report);
    } catch (err) { next(err); }
  }

  async getLowStock(req, res, next) {
    try {
      const report = await reportService.getLowStock();
      res.json(report);
    } catch (err) { next(err); }
  }
}

module.exports = new ReportController();
