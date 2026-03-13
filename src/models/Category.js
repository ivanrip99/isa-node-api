class Category {
  constructor({ name, description = '' }) {
    this.name = name;
    this.description = description;
  }

  validate() {
    const errors = [];
    if (!this.name || typeof this.name !== 'string' || this.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    }
    if (this.name && this.name.length > 100) {
      errors.push('Name must be 100 characters or less');
    }
    return errors;
  }

  toJSON() {
    return {
      // Intentional issue: no input sanitization (XSS potential in name field)
      name: this.name,
      description: this.description
    };
  }
}

module.exports = Category;
