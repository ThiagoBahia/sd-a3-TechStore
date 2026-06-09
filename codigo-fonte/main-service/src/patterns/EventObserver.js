/**
 * Padrao Observer — barramento de eventos desacoplado.
 * Permite que servicos reajam a eventos sem conhecer a fonte.
 */
class EventObserver {
  constructor() {
    this._events = {};
  }

  subscribe(event, handler) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(handler);
  }

  unsubscribe(event, handler) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter((h) => h !== handler);
    }
  }

  notify(event, data) {
    if (this._events[event]) {
      this._events[event].forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[Observer] Erro no handler do evento "${event}":`, err.message);
        }
      });
    }
  }
}

const observer = new EventObserver();

// Observador: loga criacao de venda e alerta estoque baixo
observer.subscribe('sale:created', ({ saleId, items, lowStockItems, totalAmount }) => {
  console.log(`[Observer] Venda #${saleId} confirmada | ${items.length} item(s) | Total: R$ ${Number(totalAmount).toFixed(2)}`);
  if (lowStockItems && lowStockItems.length > 0) {
    lowStockItems.forEach((p) => {
      console.warn(`[Observer] ALERTA DE ESTOQUE BAIXO: "${p.name}" (ID ${p.id}) — restam apenas ${p.stock_quantity} unidade(s)!`);
    });
  }
});

// Observador: loga cancelamento de venda
observer.subscribe('sale:cancelled', ({ saleId }) => {
  console.log(`[Observer] Venda #${saleId} cancelada. Estoque restaurado.`);
});

// Observador: alerta de produto com estoque abaixo do threshold
observer.subscribe('product:low_stock', ({ productId, productName, quantity }) => {
  console.warn(`[Observer] ALERTA: Produto "${productName}" (ID ${productId}) com estoque critico: ${quantity} unidade(s)`);
});

module.exports = observer;
