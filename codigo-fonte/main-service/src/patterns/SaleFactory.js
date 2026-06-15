/**
 * Padrao Factory — centraliza a criacao e validacao de objetos de venda.
 * Garante que nenhuma venda malformada chegue ao servico ou ao banco.
 */
class SaleFactory {
  static create({ customer_id, seller_id, items, notes }) {
    if (!customer_id || isNaN(parseInt(customer_id))) {
      throw Object.assign(new Error('customer_id e obrigatorio e deve ser um numero'), { statusCode: 400 });
    }
    if (!seller_id || isNaN(parseInt(seller_id))) {
      throw Object.assign(new Error('seller_id e obrigatorio e deve ser um numero'), { statusCode: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw Object.assign(new Error('A venda precisa de ao menos um item'), { statusCode: 400 });
    }

    const validatedItems = items.map((item, i) => {
      if (!item.product_id) {
        throw Object.assign(new Error(`Item [${i}]: product_id e obrigatorio`), { statusCode: 400 });
      }
      if (!item.quantity || parseInt(item.quantity) <= 0) {
        throw Object.assign(new Error(`Item [${i}]: quantity deve ser um inteiro positivo`), { statusCode: 400 });
      }
      if (!item.unit_price || parseFloat(item.unit_price) <= 0) {
        throw Object.assign(new Error(`Item [${i}]: unit_price deve ser um valor positivo`), { statusCode: 400 });
      }

      return {
        product_id: parseInt(item.product_id),
        quantity:   parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
      };
    });

    return {
      customer_id: parseInt(customer_id),
      seller_id:   parseInt(seller_id),
      items:        validatedItems,
      notes:        notes || null,
    };
  }
}

module.exports = SaleFactory;
