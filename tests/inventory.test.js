const request = require('supertest');
const app = require('../src/index');
const store = require('../src/store');

beforeEach(() => {
  store.clearAll();
});

// Helper to create an item with optional reorderLevel
const createItem = (overrides = {}) =>
  store.items.create({
    name: 'Widget',
    sku: 'ABC-12345',
    quantity: 10,
    price: 19.99,
    ...overrides
  });

describe('GET /api/inventory/low-stock', () => {
  test('returns empty array when there are no items', async () => {
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns empty array when no items have a reorderLevel set', async () => {
    createItem({ quantity: 2 }); // no reorderLevel
    createItem({ quantity: 0, sku: 'DEF-67890' }); // no reorderLevel
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns empty array when all items are above their reorderLevel', async () => {
    createItem({ quantity: 50, reorderLevel: 10 });
    createItem({ quantity: 20, reorderLevel: 5, sku: 'DEF-67890' });
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns item whose quantity is below reorderLevel', async () => {
    const item = createItem({ quantity: 3, reorderLevel: 10 });
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(item.id);
    expect(res.body[0].quantity).toBe(3);
    expect(res.body[0].reorderLevel).toBe(10);
  });

  test('returns item whose quantity equals reorderLevel (boundary condition)', async () => {
    const item = createItem({ quantity: 5, reorderLevel: 5 });
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(item.id);
  });

  test('excludes item whose quantity is one above reorderLevel', async () => {
    createItem({ quantity: 6, reorderLevel: 5 });
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns only items at or below their reorderLevel from a mixed set', async () => {
    const low1 = createItem({ quantity: 2, reorderLevel: 10, sku: 'AAA-11111' });
    const low2 = createItem({ quantity: 5, reorderLevel: 5, sku: 'BBB-22222' }); // at threshold
    createItem({ quantity: 11, reorderLevel: 10, sku: 'CCC-33333' }); // above threshold
    createItem({ quantity: 0, sku: 'DDD-44444' }); // no reorderLevel — excluded

    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const ids = res.body.map((i) => i.id);
    expect(ids).toContain(low1.id);
    expect(ids).toContain(low2.id);
  });

  test('excludes items whose reorderLevel is null', async () => {
    createItem({ quantity: 1, reorderLevel: null });
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('item with zero quantity and a reorderLevel is included', async () => {
    const item = createItem({ quantity: 0, reorderLevel: 1 });
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(item.id);
    expect(res.body[0].quantity).toBe(0);
  });

  test('returned items include all expected fields', async () => {
    createItem({ quantity: 2, reorderLevel: 10 });
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    const item = res.body[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('sku');
    expect(item).toHaveProperty('quantity');
    expect(item).toHaveProperty('price');
    expect(item).toHaveProperty('reorderLevel');
    expect(item).toHaveProperty('created_at');
  });

  test('returns multiple low-stock items when all qualify', async () => {
    createItem({ quantity: 1, reorderLevel: 5, sku: 'AAA-11111' });
    createItem({ quantity: 0, reorderLevel: 5, sku: 'BBB-22222' });
    createItem({ quantity: 5, reorderLevel: 5, sku: 'CCC-33333' });
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });
});
