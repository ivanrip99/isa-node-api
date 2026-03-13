const express = require('express');
const router = express.Router();
const store = require('../store');
const Category = require('../models/Category');

// GET /api/categories - List all categories
router.get('/', (req, res) => {
  const categories = store.categories.getAll();
  res.json(categories);
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }
  const category = store.categories.getById(id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.json(category);
});

// POST /api/categories - Create category
router.post('/', (req, res) => {
  const category = new Category(req.body);
  const errors = category.validate();
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const created = store.categories.create(category.toJSON());
  res.status(201).json(created);
});

// PUT /api/categories/:id - Update category
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }
  const existing = store.categories.getById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Category not found' });
  }
  const category = new Category({ ...existing, ...req.body });
  const errors = category.validate();
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const updated = store.categories.update(id, category.toJSON());
  res.json(updated);
});

// DELETE /api/categories/:id - Delete category
// Intentional issue: doesn't check for items referencing this category
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }
  const deleted = store.categories.delete(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Category not found' });
  }
  res.status(204).send();
});

module.exports = router;
