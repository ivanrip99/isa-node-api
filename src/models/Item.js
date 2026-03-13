const SKU_PATTERN = /^[A-Z]{3}-\d{5}$/;

class Item {
  constructor({ name, sku, quantity, price, category_id = null }) {
    // Intentional issue: no input sanitization (XSS potential in name field)
    this.name = name;
    this.sku = sku;
    this.quantity = quantity;
    // Intentional issue: price stored as float (should use integer cents)
    this.price = price;
    this.category_id = category_id;
  }

  validate() {
    const errors = [];

    if (!this.name || typeof this.name !== 'string' || this.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }
    if (this.name && this.name.length > 200) {
      errors.push('Name must be 200 characters or less');
    }

    if (!this.sku || !SKU_PATTERN.test(this.sku)) {
      errors.push('SKU must match format ABC-12345 (3 uppercase letters, dash, 5 digits)');
    }

    if (this.quantity === undefined || this.quantity === null || typeof this.quantity !== 'number' || this.quantity < 0) {
      errors.push('Quantity must be a non-negative number');
    }

    if (this.price === undefined || this.price === null || typeof this.price !== 'number' || this.price <= 0) {
      errors.push('Price must be a positive number');
    }

    return errors;
  }

  toJSON() {
    return {
      name: this.name,
      sku: this.sku,
      quantity: this.quantity,
      price: this.price,
      category_id: this.category_id
    };
  }
}

module.exports = Item;
