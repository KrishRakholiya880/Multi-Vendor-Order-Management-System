# Multi-Vendor-Order-Management-System

Node.js | Express | MySQL | Redis — Backend API for a multi-vendor platform with role-based access, order lifecycle management, stock control, caching, and structured logging.

# Setup steps & environment variables

- Add in .env:
  - I add .env.example file for sample keys:
    <!-- SERVER -->
    - PORT= (random number between 0 & 65536 / random 4 digit number(preffered))
    - NODE_ENV=development for development mode only
    <!-- DB_CONFIG -->
    - DB_NAME= database name
    - DB_PASSWORD= database password
    - DB_USERNAME= database username
    - DB_HOST= database host url
    <!-- EXPRESS_SESSION -->
    - HTTPONLY= (true/false)
    - SECURE= (true/false)
    - MAX_AGE_ACCESS= (in milliseconds for short terms, for instace: 15 mins: 900000 = 15 \* 60 \* 1000)
    - MAX_AGE_REFRESH= (in milliseconds for long terms, for instace: 15 mins: 604800000 = 7 \* 24 \* 60 \* 60 \* 1000)
    <!-- TOKEN_KEYS -->
    - ACCESS_TOKEN_SECRET= (random string by yourself)
    - ACCESS_TOKEN_EXPIRY= (15m or etc. for short term)
    - REFRESH_TOKEN_EXPIRY= (7d or etc. for long term)

- Run commands in terminal:
  - npm i (for install all dependencies)
  - npm run dev (for start server in development)

# System design overview

### Architecture:

- REST API built with Node.js + Express
- MVC pattern (Controller -> Service -> DB layer)
- MySQL database with Sequelize ORM
- Redis for caching

### Database design:

- Tables: users, vendor_details, products, categories, orders, order_items, carts, cart_items, refresh_tokens
- Soft delete on products, users & vendorDetails via deleted_at
- Indexed columns for faster queries

### API Modules:

- Auth — register, login, logout, refresh token
- Users — CRUD
- Vendor Details — company info management
- Products — CRUD with vendor ownership check
- Cart — add, update, remove items
- Orders — place, cancel, status update
- Analytics — sales summary, purchase summary, revenue trends, product performance, dead stock report

# Caching Strategy (Redis)

- Used versioning based caching system:
  - for instance: products:version:role:${role}
- Caching on:
  - list of all products
  - product details with productId
  - list of users (admin)
  - list of vendorDetails (admin)
  - vendor details by id (admin)
  - list of every analytics data etc.
- Supported query based caching also for:
  - pagination for list API
  - searching & filtering
  - on ids like product/vendorDetails ids etc.

# Invalidation approach

- Cache invalidation via INCREMENT_VERSION on mutations
- TTL based auto expiry for stale keys
- Mutation like:
  - create/update/remove for every API where redis cache used.
  - except: users (cause admin wants fresh data every time)

# Access control rules

### Auth

- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/renew-access-token
- POST /auth/changePassword
- GET /auth/profile (vendor with vendorDetails)

### Users (Admin only)

- GET /users
- GET /users/:id
- POST /users
- PATCH /users/:id
- PATCH /users/changeStatus/:id
- DELETE /users/:id

### Products

- GET /products (guest/customer: active only | vendor: own | admin: all)
- GET /products/:id (guest/customer: active only | vendor: own | admin: all)
- POST /products (vendor, admin)
- PATCH /products/:id (vendor: own | admin: all)
- DELETE /products/:id (vendor: own | admin: all)
- PATCH /products/changeStatus/:id (vendor: own | admin: all)

### Categories

- GET /categories
- GET /categories/:id
- POST /categories (admin only)
- PATCH /categories/:id (admin only)
- DELETE /categories/:id (admin only)

### Vendor Details

- GET /vendor-details (admin only)
- GET /vendor-details/:id (admin only)
- POST /vendor-details/:id (vendor, admin for any vendor)
- PATCH /vendor-details/:id (vendor: own | admin: all)

### Cart

- GET /cart (customer: own | admin: all)
- POST /cart (customer only)
- POST /clear (customer: own | admin: all)
- PATCH /cart/:product_id (customer: own)
- DELETE /cart/:product_id (customer: own)

### Orders

- GET /orders (customer: own | admin: all)
- GET /orders/:id (customer: own | admin: all)
- GET /orders/vendor-orders (vendor: own | admin: all)
- POST /orders (customer only)
- PATCH /orders/vendor-orders/:id (vendor: own | admin: all)
- DELETE /orders/:id (customer: own | admin: all)

### Analytics

- GET /analytics/vendors-sales-summary (vendor: own | admin: all)
- GET /analytics/customers-purchase-summary (customer: own | admin: all)
- GET /analytics/revenue-trends (vendor: own | admin: all)
- GET /analytics/product-metrics (vendor: own | admin: all)
- GET /analytics/product-metrics/:id (vendor: own | admin: all)
- GET /analytics/product-sales-stock-summary (vendor: own | admin: all)
- GET /analytics/product-sales-stock-summary/:id (vendor: own | admin: all)

# Sample credentials

- One password for all: Test1@123

## Admin:

- admin@gmail.com

## Vendors:

- amelia@gmail.com
- olivia@gmail.com
- sarah@gmail.com

## Customers:

- jhon@gmail.com
- jane@gmail.com
- emily@gmail.com
