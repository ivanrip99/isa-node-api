const request = require('supertest');
const app = require('../src/index');
const store = require('../src/store');

beforeEach(() => {
  store.clearAll();
});

describe('GET /api/categories', () => {
  test('returns empty array when no categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns all categories', async () => {
    store.categories.create({ name: 'Electronics', description: 'Electronic items' });
    store.categories.create({ name: 'Tools', description: 'Hand tools' });
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /api/categories/:id', () => {
  test('returns category by ID', async () => {
    const cat = store.categories.create({ name: 'Electronics', description: 'Gadgets' });
    const res = await request(app).get(`/api/categories/${cat.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Electronics');
  });

  test('returns 404 for non-existent category', async () => {
    const res = await request(app).get('/api/categories/999');
    expect(res.status).toBe(404);
  });

  test('returns 400 for invalid ID', async () => {
    const res = await request(app).get('/api/categories/abc');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/categories', () => {
  test('creates a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Electronics', description: 'Electronic items' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Electronics');
  });

  test('rejects category without name', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ description: 'No name' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('creates category with default empty description', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Misc' });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe('');
  });
});

describe('PUT /api/categories/:id', () => {
  test('updates a category', async () => {
    const cat = store.categories.create({ name: 'Old', description: 'Old desc' });
    const res = await request(app)
      .put(`/api/categories/${cat.id}`)
      .send({ name: 'New', description: 'New desc' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New');
    expect(res.body.description).toBe('New desc');
  });

  test('returns 404 for non-existent category', async () => {
    const res = await request(app)
      .put('/api/categories/999')
      .send({ name: 'Nope' });
    expect(res.status).toBe(404);
  });

  test('rejects invalid update', async () => {
    const cat = store.categories.create({ name: 'Valid' });
    const res = await request(app)
      .put(`/api/categories/${cat.id}`)
      .send({ name: '' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/categories/:id', () => {
  test('deletes a category', async () => {
    const cat = store.categories.create({ name: 'ToDelete' });
    const res = await request(app).delete(`/api/categories/${cat.id}`);
    expect(res.status).toBe(204);
    expect(store.categories.getById(cat.id)).toBeNull();
  });

  test('returns 404 for non-existent category', async () => {
    const res = await request(app).delete('/api/categories/999');
    expect(res.status).toBe(404);
  });

  // Intentional issue: category deletion doesn't check for referencing items
  test('allows deleting category even when items reference it', async () => {
    const cat = store.categories.create({ name: 'Referenced' });
    store.items.create({
      name: 'Widget',
      sku: 'ABC-12345',
      quantity: 5,
      price: 9.99,
      category_id: cat.id
    });
    const res = await request(app).delete(`/api/categories/${cat.id}`);
    expect(res.status).toBe(204);
    // Item still references deleted category — this is the intentional bug
    const items = store.items.getAll();
    expect(items[0].category_id).toBe(cat.id);
  });
});
