/**
 * Padrao Strategy — cada tipo de relatorio e encapsulado em uma estrategia separada.
 * O ReportContext recebe qualquer estrategia e delega a execucao sem conhecer os detalhes.
 */

class ReportStrategy {
  async execute(repository, params) {
    throw new Error('execute() deve ser implementado pela subclasse');
  }
}

class TopProductsStrategy extends ReportStrategy {
  async execute(repository, { limit = 10 } = {}) {
    return repository.getTopProducts(limit);
  }
}

class ProductsByCustomerStrategy extends ReportStrategy {
  async execute(repository, { customerId } = {}) {
    if (!customerId) {
      throw Object.assign(new Error('customerId e obrigatorio para este relatorio'), { statusCode: 400 });
    }
    return repository.getProductsByCustomer(customerId);
  }
}

class CustomerAvgConsumptionStrategy extends ReportStrategy {
  async execute(repository) {
    return repository.getCustomerAvgConsumption();
  }
}

class LowStockStrategy extends ReportStrategy {
  async execute(repository) {
    return repository.getLowStockProducts();
  }
}

class ReportContext {
  constructor(strategy) {
    this._strategy = strategy;
  }

  setStrategy(strategy) {
    this._strategy = strategy;
  }

  async generate(repository, params) {
    return this._strategy.execute(repository, params);
  }
}

module.exports = {
  ReportContext,
  TopProductsStrategy,
  ProductsByCustomerStrategy,
  CustomerAvgConsumptionStrategy,
  LowStockStrategy,
};
