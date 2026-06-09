/**
 * Padrao Factory — centraliza a criacao e validacao de objetos de venda,
 * garantindo que nenhuma venda invalida seja processada pelo sistema.
 */
class SaleFactory {
  static create({ customerId, sellerId, items, notes }) {
    SaleFactory._requirePositiveInt('customerId', customerId);
    SaleFactory._requirePositiveInt('sellerId', sellerId);

    if (!Array.isArray(items) || items.length === 0) {
      throw Object.assign(
        new Error('A venda deve conter pelo menos um item'),
        { statusCode: 400 }
      );
    }

    const validatedItems = items.map((item, index) => {
      SaleFactory._requirePositiveInt(`items[${index}].productId`, item.productId);

      const qty = parseInt(item.quantity);
      if (!qty || qty <= 0) {
        throw Object.assign(
          new Error(`items[${index}].quantity deve ser um inteiro positivo`),
          { statusCode: 400 }
        );
      }

      return {
        productId: parseInt(item.productId),
        quantity: qty,
      };
    });

    return {
      customerId: parseInt(customerId),
      sellerId: parseInt(sellerId),
      items: validatedItems,
      notes: notes || null,
      status: 'confirmed',
    };
  }

  static _requirePositiveInt(field, value) {
    const parsed = parseInt(value);
    if (!value || isNaN(parsed) || parsed <= 0) {
      throw Object.assign(
        new Error(`Campo "${field}" deve ser um numero inteiro positivo`),
        { statusCode: 400 }
      );
    }
  }
}

module.exports = SaleFactory;
