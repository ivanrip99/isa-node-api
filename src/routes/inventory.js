const express = require('express');
const router = express.Router();
const store = require('../store');

/**
 * GET /api/inventory/low-stock
 *
 * Returns all inventory items where quantity is less than or equal to
 * reorderLevel. Items that have no reorderLevel set are excluded.
 *
 * @returns {200} JSON array of matching inventory items (empty array if none)
 */
router.get('/low-stock', (req, res) => {
  const lowStockItems = store.items.getLowStock();
  res.json(lowStockItems);
});

module.exports = router;
