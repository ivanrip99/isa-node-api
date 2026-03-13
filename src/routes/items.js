const express = require('express');
const router = express.Router();
const store = require('../store');
const Item = require('../models/Item');

// GET /api/items - List all items
router.get('/', (req, res) => {
  const items = store.items.getAll();
  res.json(items);
});

// GET /api/items/:id - Get item by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid item ID' });
  }
  const item = store.items.getById(id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

// POST /api/items - Create item
router.post('/', (req, res) => {
  const item = new Item(req.body);
  const errors = item.validate();
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Check category exists if provided
  if (item.category_id !== null && item.category_id !== undefined) {
    const category = store.categories.getById(item.category_id);
    if (!category) {
      return res.status(400).json({ errors: ['Category not found'] });
    }
  }

  const created = store.items.create(item.toJSON());
  res.status(201).json(created);
});

// PUT /api/items/:id - Update item
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid item ID' });
  }
  const existing = store.items.getById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Item not found' });
  }
  const item = new Item({ ...existing, ...req.body });
  const errors = item.validate();
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Check category exists if provided
  if (item.category_id !== null && item.category_id !== undefined) {
    const category = store.categories.getById(item.category_id);
    if (!category) {
      return res.status(400).json({ errors: ['Category not found'] });
    }
  }

  const updated = store.items.update(id, item.toJSON());
  res.json(updated);
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid item ID' });
  }
  const deleted = store.items.delete(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.status(204).send();
});

module.exports = router;
