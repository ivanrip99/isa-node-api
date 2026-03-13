# isa-node-api

Express inventory management API with in-memory storage.

## Setup

```bash
npm install
npm start
```

## API Endpoints

### Items (`/api/items`)
- `GET /api/items` - List all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Categories (`/api/categories`)
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
```
