const Item = require('../src/models/Item');
const Category = require('../src/models/Category');

describe('Item model', () => {
  const validData = {
    name: 'Widget',
    sku: 'ABC-12345',
    quantity: 10,
    price: 19.99,
    category_id: null
  };

  test('validates a correct item', () => {
    const item = new Item(validData);
    expect(item.validate()).toEqual([]);
  });

  test('rejects missing name', () => {
    const item = new Item({ ...validData, name: '' });
    const errors = item.validate();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/Name/i);
  });

  test('rejects name that is too long', () => {
    const item = new Item({ ...validData, name: 'x'.repeat(201) });
    const errors = item.validate();
    expect(errors).toContainEqual(expect.stringMatching(/200/));
  });

  test('rejects invalid SKU format', () => {
    const cases = ['abc-12345', 'ABC12345', 'AB-12345', 'ABC-1234', 'ABC-123456', ''];
    cases.forEach(sku => {
      const item = new Item({ ...validData, sku });
      expect(item.validate().length).toBeGreaterThan(0);
    });
  });

  test('accepts valid SKU formats', () => {
    const item = new Item({ ...validData, sku: 'XYZ-99999' });
    expect(item.validate()).toEqual([]);
  });

  test('rejects negative quantity', () => {
    const item = new Item({ ...validData, quantity: -1 });
    const errors = item.validate();
    expect(errors).toContainEqual(expect.stringMatching(/Quantity/i));
  });

  test('accepts zero quantity', () => {
    const item = new Item({ ...validData, quantity: 0 });
    expect(item.validate()).toEqual([]);
  });

  test('rejects zero price', () => {
    const item = new Item({ ...validData, price: 0 });
    const errors = item.validate();
    expect(errors).toContainEqual(expect.stringMatching(/Price/i));
  });

  test('rejects negative price', () => {
    const item = new Item({ ...validData, price: -5 });
    const errors = item.validate();
    expect(errors).toContainEqual(expect.stringMatching(/Price/i));
  });

  test('toJSON returns correct shape', () => {
    const item = new Item(validData);
    const json = item.toJSON();
    expect(json).toEqual({
      name: 'Widget',
      sku: 'ABC-12345',
      quantity: 10,
      price: 19.99,
      category_id: null
    });
  });
});

describe('Category model', () => {
  test('validates a correct category', () => {
    const cat = new Category({ name: 'Electronics', description: 'Electronic items' });
    expect(cat.validate()).toEqual([]);
  });

  test('rejects missing name', () => {
    const cat = new Category({ name: '' });
    expect(cat.validate().length).toBeGreaterThan(0);
  });

  test('rejects name that is too long', () => {
    const cat = new Category({ name: 'x'.repeat(101) });
    expect(cat.validate()).toContainEqual(expect.stringMatching(/100/));
  });

  test('defaults description to empty string', () => {
    const cat = new Category({ name: 'Test' });
    expect(cat.description).toBe('');
  });

  test('toJSON returns correct shape', () => {
    const cat = new Category({ name: 'Tools', description: 'Hand tools' });
    expect(cat.toJSON()).toEqual({ name: 'Tools', description: 'Hand tools' });
  });
});
