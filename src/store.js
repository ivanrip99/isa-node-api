// In-memory data store using Maps
const items = new Map();
const categories = new Map();

let nextItemId = 1;
let nextCategoryId = 1;

const store = {
  items: {
    getAll() {
      return Array.from(items.values());
    },
    getById(id) {
      return items.get(id) || null;
    },
    /**
     * Returns all items where quantity <= reorderLevel.
     * Items with no reorderLevel (null/undefined) are excluded.
     * @returns {Array} Array of low-stock inventory items
     */
    getLowStock() {
      return Array.from(items.values()).filter(
        (item) =>
          item.reorderLevel !== null &&
          item.reorderLevel !== undefined &&
          item.quantity <= item.reorderLevel
      );
    },
    create(data) {
      const id = nextItemId++;
      const item = { id, ...data, created_at: new Date().toISOString() };
      items.set(id, item);
      return item;
    },
    update(id, data) {
      const existing = items.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...data, id, created_at: existing.created_at };
      items.set(id, updated);
      return updated;
    },
    delete(id) {
      const existing = items.get(id);
      if (!existing) return false;
      items.delete(id);
      return true;
    },
    clear() {
      items.clear();
      nextItemId = 1;
    }
  },
  categories: {
    getAll() {
      return Array.from(categories.values());
    },
    getById(id) {
      return categories.get(id) || null;
    },
    create(data) {
      const id = nextCategoryId++;
      const category = { id, ...data };
      categories.set(id, category);
      return category;
    },
    update(id, data) {
      const existing = categories.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...data, id };
      categories.set(id, updated);
      return updated;
    },
    // Intentional issue: deletion doesn't check for items referencing this category
    delete(id) {
      const existing = categories.get(id);
      if (!existing) return false;
      categories.delete(id);
      return true;
    },
    clear() {
      categories.clear();
      nextCategoryId = 1;
    }
  },
  clearAll() {
    store.items.clear();
    store.categories.clear();
  }
};

module.exports = store;
