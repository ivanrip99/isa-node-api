const request = require('supertest');
const app = require('../src/index');
const store = require('../src/store');

beforeEach(() => {
  store.clearAll();
});

const validItem = {
  name: 'Widget',
  sku: 'ABC-12345',
  quantity: 10,
  price: 19.99
};

describe('GET /api/items', () => {
  test('returns empty array when no items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all items', async () => {
    store.items.create({ ...validItem });
    store.items.create({ ...validItem, name: 'Gadget', sku: 'DEF-67890' });
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /api/items/:id', () => {
  test('returns item by ID', async () => {
    const item = store.items.create({ ...validItem });
    const res = await request(app).get(`/api/items/${item.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Widget');
    expect(res.body.created_at).toBeDefined();
  });

  test('returns 404 for non-existent item', async () => {
    const res = await request(app).get('/api/items/999');
    expect(res.status).toBe(404);
  });

  test('returns 400 for invalid ID', async () => {
    const res = await request(app).get('/api/items/abc');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/items', () => {
  test('creates an item', async () => {
    const res = await request(app)
      .post('/api/items')
      .send(validItem);
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Widget');
    expect(res.body.sku).toBe('ABC-12345');
    expect(res.body.quantity).toBe(10);
    expect(res.body.price).toBe(19.99);
    expect(res.body.created_at).toBeDefined();
  });

  test('creates item with category', async () => {
    const cat = store.categories.create({ name: 'Electronics' });
    const res = await request(app)
      .post('/api/items')
      .send({ ...validItem, category_id: cat.id });
    expect(res.status).toBe(201);
    expect(res.body.category_id).toBe(cat.id);
  });

  test('rejects item with non-existent category', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ ...validItem, category_id: 999 });
    expect(res.status).toBe(400);
  });

  test('rejects item without name', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ ...validItem, name: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('rejects item with invalid SKU', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ ...validItem, sku: 'bad-sku' });
    expect(res.status).toBe(400);
  });

  test('rejects item with negative quantity', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ ...validItem, quantity: -1 });
    expect(res.status).toBe(400);
  });

  test('accepts item with zero quantity', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ ...validItem, quantity: 0 });
    expect(res.status).toBe(201);
  });

  test('rejects item with zero price', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ ...validItem, price: 0 });
    expect(res.status).toBe(400);
  });

  test('rejects item with negative price', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ ...validItem, price: -5 });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/items/:id', () => {
  test('updates an item', async () => {
    const item = store.items.create({ ...validItem });
    const res = await request(app)
      .put(`/api/items/${item.id}`)
      .send({ name: 'Updated Widget', quantity: 20 });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Widget');
    expect(res.body.quantity).toBe(20);
    expect(res.body.sku).toBe('ABC-12345'); // unchanged
    expect(res.body.created_at).toBe(item.created_at); // preserved
  });

  test('returns 404 for non-existent item', async () => {
    const res = await request(app)
      .put('/api/items/999')
      .send({ name: 'Nope' });
    expect(res.status).toBe(404);
  });

  test('rejects invalid update', async () => {
    const item = store.items.create({ ...validItem });
    const res = await request(app)
      .put(`/api/items/${item.id}`)
      .send({ price: -10 });
    expect(res.status).toBe(400);
  });

  test('rejects update with non-existent category', async () => {
    const item = store.items.create({ ...validItem });
    const res = await request(app)
      .put(`/api/items/${item.id}`)
      .send({ category_id: 999 });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/items/:id', () => {
  test('deletes an item', async () => {
    const item = store.items.create({ ...validItem });
    const res = await request(app).delete(`/api/items/${item.id}`);
    expect(res.status).toBe(204);
    expect(store.items.getById(item.id)).toBeNull();
  });

  test('returns 404 for non-existent item', async () => {
    const res = await request(app).delete('/api/items/999');
    expect(res.status).toBe(404);
  });
});

describe('Health check', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
