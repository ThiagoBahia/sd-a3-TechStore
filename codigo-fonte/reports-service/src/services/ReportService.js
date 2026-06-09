const db = require('../config/database');
const ReportRepository = require('../repositories/ReportRepository');
const {
  ReportContext,
  TopProductsStrategy,
  ProductsByCustomerStrategy,
  CustomerAvgConsumptionStrategy,
  LowStockStrategy,
} = require('../patterns/ReportStrategy');

const reportRepo = new ReportRepository(db);

class ReportService {
  async getTopProducts(limit) {
    const context = new ReportContext(new TopProductsStrategy());
    const data = await context.generate(reportRepo, { limit: parseInt(limit) || 10 });
    return {
      title: 'Relatorio de Produtos Mais Vendidos',
      generatedAt: new Date().toISOString(),
      total: data.length,
      data,
    };
  }

  async getProductsByCustomer(customerId) {
    const context = new ReportContext(new ProductsByCustomerStrategy());
    const data = await context.generate(reportRepo, { customerId });
    return {
      title: 'Relatorio de Produtos por Cliente',
      customerId,
      generatedAt: new Date().toISOString(),
      total: data.length,
      data,
    };
  }

  async getCustomerAvgConsumption() {
    const context = new ReportContext(new CustomerAvgConsumptionStrategy());
    const data = await context.generate(reportRepo);
    return {
      title: 'Relatorio de Consumo Medio por Cliente',
      generatedAt: new Date().toISOString(),
      total: data.length,
      data,
    };
  }

  async getLowStock() {
    const context = new ReportContext(new LowStockStrategy());
    const data = await context.generate(reportRepo);
    return {
      title: 'Relatorio de Produtos com Baixo Estoque',
      generatedAt: new Date().toISOString(),
      total: data.length,
      data,
    };
  }
}

module.exports = new ReportService();
