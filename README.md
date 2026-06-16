# Multi-Vendor Order Management System

A production-ready backend REST API built with **Node.js**, **Express**, **MySQL**, and **Redis** — designed for a multi-vendor e-commerce platform. It supports role-based access control, a full order lifecycle, real-time stock management, version-based Redis caching, and structured analytics.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Database Design](#database-design)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation & Running](#installation--running)
- [Caching Strategy](#caching-strategy)
- [Cache Invalidation](#cache-invalidation)
- [API Modules & Access Control](#api-modules--access-control)
  - [Auth](#auth)
  - [Users](#users-admin-only)
  - [Products](#products)
  - [Categories](#categories)
  - [Vendor Details](#vendor-details)
  - [Cart](#cart)
  - [Orders](#orders)
  - [Analytics](#analytics)
- [Sample Credentials](#sample-credentials)

---

## Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Runtime    | Node.js                       |
| Framework  | Express.js                    |
| Database   | MySQL with Sequelize ORM      |
| Cache      | Redis (version-based)         |
| Auth       | JWT (Access + Refresh Tokens) |
| Migrations | Sequelize CLI                 |

---

## Architecture Overview

The system follows a clean **MVC pattern** with a strict separation of concerns across three layers:

```
Controller  →  Service  →  DB Layer (Sequelize Models)
```

- **Controllers** handle HTTP request/response.
- **Services** contain all business logic, cache reads/writes, and coordination.
- **DB Layer** manages all database interactions via Sequelize ORM.

Redis is used as a read-through cache sitting in front of MySQL for frequently accessed, read-heavy resources. JWT-based authentication secures every route, with role-based guards enforced at the middleware level.

---

## Database Design

### Tables

| Table            | Purpose                                            |
| ---------------- | -------------------------------------------------- |
| `users`          | Stores all user accounts (admin, vendor, customer) |
| `vendor_details` | Company profile linked to vendor users             |
| `products`       | Vendor-owned product listings with stock           |
| `categories`     | Product categorization (admin-managed)             |
| `orders`         | Customer orders with lifecycle status tracking     |
| `order_items`    | Individual line items within each order            |
| `carts`          | Active shopping carts per customer                 |
| `cart_items`     | Products added to a cart with quantities           |
| `refresh_tokens` | Persisted refresh tokens for session management    |

### Design Notes

- **Soft deletes** via `deleted_at` on `users`, `vendor_details`, and `products` — records are never permanently removed.
- **Indexed columns** on foreign keys and frequently filtered fields (e.g. `status`, `vendor_id`, `product_id`) to optimize query performance.
- All relationships are enforced at both the database level (foreign keys) and application level (Sequelize associations).

### Database Constraints

Constraints are applied via Sequelize migrations to enforce data integrity directly at the database level — independent of application logic.

#### Foreign Key Constraints

All foreign keys use `ON DELETE CASCADE` and `ON UPDATE CASCADE` — meaning if a parent record is deleted or its ID changes, all related child records are automatically removed or updated.

| Table            | Constraint Name                 | Column        | References       | Meaning                                                      |
| ---------------- | ------------------------------- | ------------- | ---------------- | ------------------------------------------------------------ |
| `refresh_tokens` | `frk_user_id_in_rt`             | `user_id`     | `users(id)`      | Tokens are deleted when their owner account is removed       |
| `vendor_details` | `frk_user_id_in_vd`             | `user_id`     | `users(id)`      | Vendor profile is removed if the vendor user is deleted      |
| `products`       | `frk_cat_in_prods`              | `category_id` | `categories(id)` | Products are removed if their category is deleted            |
| `products`       | `frk_vendor_id_in_prods`        | `vendor_id`   | `users(id)`      | Products are removed if the owning vendor is deleted         |
| `carts`          | `frk_customer_id_in_carts`      | `customer_id` | `users(id)`      | Cart is removed when the customer account is deleted         |
| `cart_items`     | `frk_cart_id_in_cart_items`     | `cart_id`     | `carts(id)`      | Cart items are cleared when their parent cart is removed     |
| `cart_items`     | `frk_product_id_in_cart_items`  | `product_id`  | `products(id)`   | Cart items are removed if the referenced product is deleted  |
| `orders`         | `frk_customer_id_in_orders`     | `customer_id` | `users(id)`      | Orders are removed when the customer account is deleted      |
| `order_items`    | `frk_order_id_in_order_items`   | `order_id`    | `orders(id)`     | Order items are removed when their parent order is deleted   |
| `order_items`    | `frk_product_id_in_order_items` | `product_id`  | `products(id)`   | Order items are removed if the referenced product is deleted |

#### Check Constraints

| Table         | Constraint Name                   | Rule                               | Reason                                                         |
| ------------- | --------------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| `products`    | `chk_min_stock`                   | `stock >= 0 AND stock <= 500`      | Prevents negative stock and caps maximum inventory per product |
| `cart_items`  | `chk_min_quantity_to_cart_items`  | `quantity >= 0 AND quantity <= 15` | Limits how many units of a product a customer can add to cart  |
| `order_items` | `chk_min_quantity_to_order_items` | `quantity >= 0 AND quantity <= 15` | Same limit enforced at the order level to stay consistent      |

#### Unique Constraints

| Table         | Constraint Name        | Columns                  | Reason                                                                       |
| ------------- | ---------------------- | ------------------------ | ---------------------------------------------------------------------------- |
| `cart_items`  | `unique_cart_product`  | `(cart_id, product_id)`  | A product can only appear once per cart — duplicates update quantity instead |
| `order_items` | `unique_order_product` | `(order_id, product_id)` | A product can only appear once per order line item                           |

---

## Getting Started

### Prerequisites

- Node.js >= 16.x
- MySQL >= 8.x
- Redis >= 6.x
- npm

### Environment Variables

Create a `.env` file in the project root. A `.env.example` is included for reference.

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DB_NAME=your_database_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=localhost

# JWT Tokens
ACCESS_TOKEN_SECRET=your_random_access_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cookie / Session
HTTPONLY=true
SECURE=false
MAX_AGE_ACCESS=900000       # 15 minutes in ms  (15 * 60 * 1000)
MAX_AGE_REFRESH=604800000   # 7 days in ms      (7 * 24 * 60 * 60 * 1000)
```

### Installation & Running

```bash
# 1. Install all dependencies
npm install

# 2. Run database migrations
npx sequelize-cli db:migrate

# 3. Start the server in development mode
npm run dev
```

---

## Caching Strategy

Redis is used with a **version-based caching system** to serve consistent, role-aware responses without hitting the database on every request.

### Cache Key Pattern

```
<resource>:version:<version_number>:role:<role>[:<qualifier>]
```

**Example:** `products:version:4:role:vendor:vendorId:12:page:1`

### What Is Cached

- All products list (role-aware: guest/customer/vendor/admin views differ)
- Single product detail by `productId`
- All vendor details list (admin)
- Single vendor detail by `vendorId` (admin)
- All users list (admin — TTL-only, no versioning; admin always gets near-fresh data)
- All analytics endpoints (sales summaries, revenue trends, product metrics, dead stock report)

### Query-Aware Caching

The cache key is extended to include query parameters, making pagination, search, and filter combinations independently cacheable:

- Pagination: `page`, `limit`
- Filtering: `status`, `categoryId`, `vendorId`
- Search: keyword/name-based searches

---

## Cache Invalidation

Cache is invalidated by **incrementing the version number** for the affected resource. Old version keys become unreachable and expire via TTL.

### When Invalidation Triggers

- `CREATE` — a new resource is added
- `UPDATE` — any field of a resource is modified
- `DELETE` (soft) — a resource is removed

### Exceptions

- **Users** — no version-based invalidation; admin reads always serve near-fresh data via TTL expiry only.

### TTL

Every cache key has an explicit TTL. This acts as a safety net to prevent stale data from persisting indefinitely if invalidation is ever missed.

---

## API Modules & Access Control

All routes are prefixed with `/api`. Role-based access is enforced per route. Roles: `admin`, `vendor`, `customer`, `guest`.

---

### Auth

| Method | Endpoint               | Access        | Description                                      |
| ------ | ---------------------- | ------------- | ------------------------------------------------ |
| POST   | `/auth/register`       | Public        | Register a new user account                      |
| POST   | `/auth/login`          | Public        | Login and receive access + refresh tokens        |
| POST   | `/auth/logout`         | Authenticated | Invalidate the current session                   |
| POST   | `/auth/refresh`        | Authenticated | Get a new access token via refresh token         |
| POST   | `/auth/changePassword` | Authenticated | Update account password                          |
| GET    | `/auth/profile`        | Authenticated | Get own profile (vendors include vendor details) |

---

### Users (Admin Only)

Full CRUD on user accounts. Admins can create, view, update, change status, and soft-delete any user.

| Method | Endpoint                  | Description                   |
| ------ | ------------------------- | ----------------------------- |
| GET    | `/users/`                 | List all users                |
| GET    | `/users/:id`              | Get a user by ID              |
| POST   | `/users/`                 | Create a new user             |
| PATCH  | `/users/:id`              | Update user details           |
| PATCH  | `/users/changeStatus/:id` | Activate or deactivate a user |
| DELETE | `/users/:id`              | Soft delete a user            |

---

### Products

Access to product data is role-aware at the data level — the same endpoint returns different data depending on who is calling.

| Method | Endpoint                     | Access                                               | Description                    |
| ------ | ---------------------------- | ---------------------------------------------------- | ------------------------------ |
| GET    | `/products/`                 | Guest/Customer: active only; Vendor: own; Admin: all | List products                  |
| GET    | `/products/:id`              | Guest/Customer: active only; Vendor: own; Admin: all | Get product by ID              |
| POST   | `/products/`                 | Vendor, Admin                                        | Create a new product           |
| PATCH  | `/products/:id`              | Vendor: own products; Admin: all                     | Update product details         |
| PATCH  | `/products/changeStatus/:id` | Vendor: own products; Admin: all                     | Toggle product active/inactive |
| DELETE | `/products/:id`              | Vendor: own products; Admin: all                     | Soft delete a product          |

---

### Categories

Product categories are managed exclusively by admins but are readable by all authenticated users.

| Method | Endpoint          | Access                  | Description           |
| ------ | ----------------- | ----------------------- | --------------------- |
| GET    | `/categories/`    | Customer, Vendor, Admin | List all categories   |
| GET    | `/categories/:id` | Customer, Vendor, Admin | Get a category by ID  |
| POST   | `/categories/`    | Admin only              | Create a new category |
| PATCH  | `/categories/:id` | Admin only              | Update a category     |
| DELETE | `/categories/:id` | Admin only              | Delete a category     |

---

### Vendor Details

Vendor company profiles. Vendors can manage their own; admins can manage all.

| Method | Endpoint              | Access                    | Description                |
| ------ | --------------------- | ------------------------- | -------------------------- |
| GET    | `/vendor-details/`    | Admin only                | List all vendor profiles   |
| GET    | `/vendor-details/:id` | Admin only                | Get a vendor profile by ID |
| POST   | `/vendor-details/:id` | Vendor (own), Admin (any) | Create a vendor profile    |
| PATCH  | `/vendor-details/:id` | Vendor: own; Admin: all   | Update a vendor profile    |
| DELETE | `/vendor-details/:id` | Vendor: own; Admin: all   | Delete a vendor profile    |

---

### Cart

Customers manage their own carts. Admins can view and clear every cart.

| Method | Endpoint            | Access                    | Description                      |
| ------ | ------------------- | ------------------------- | -------------------------------- |
| GET    | `/cart/`            | Customer: own; Admin: all | Get cart contents                |
| POST   | `/cart/`            | Customer only             | Add a product to the cart        |
| POST   | `/cart/clear`       | Customer: own; Admin: all | Remove all items from cart       |
| PATCH  | `/cart/:product_id` | Customer: own             | Update quantity of a cart item   |
| DELETE | `/cart/:product_id` | Customer: own             | Remove a specific item from cart |

---

### Orders

Full order lifecycle from placement to cancellation. Vendors manage fulfillment status on their own orders.

| Method | Endpoint                    | Access                    | Description                              |
| ------ | --------------------------- | ------------------------- | ---------------------------------------- |
| GET    | `/orders/`                  | Customer: own; Admin: all | List orders                              |
| GET    | `/orders/:id`               | Customer: own; Admin: all | Get order details by ID                  |
| GET    | `/orders/vendor-orders`     | Vendor: own; Admin: all   | List orders containing vendor's products |
| POST   | `/orders/`                  | Customer only             | Place a new order from active cart       |
| PATCH  | `/orders/vendor-orders/:id` | Vendor: own; Admin: all   | Update fulfillment/shipping status       |
| DELETE | `/orders/:id`               | Customer: own; Admin: all | Cancel an order                          |

---

### Analytics

Business intelligence endpoints. Each endpoint is scoped by role — vendors see their own data, admins see everything.

| Method | Endpoint                                     | Access                       | Description                                       |
| ------ | -------------------------------------------- | ---------------------------- | ------------------------------------------------- |
| GET    | `/analytics/vendors-sales-summary`           | Vendor: own; Admin: all      | Aggregate sales metrics per vendor                |
| GET    | `/analytics/customers-purchase-summary`      | Customer: own; Admin: all    | Spending and order history per customer           |
| GET    | `/analytics/revenue-trends`                  | Vendor: own; Admin: all      | Revenue over time (daily/weekly/monthly)          |
| GET    | `/analytics/product-metrics`                 | Vendor: own; Admin: all      | Views, conversions, and sales per product         |
| GET    | `/analytics/product-metrics/:id`             | Vendor: own; Admin: specific | Product-level metrics for a specific product      |
| GET    | `/analytics/product-sales-stock-summary`     | Vendor: own; Admin: all      | Sales volume vs. remaining stock for all products |
| GET    | `/analytics/product-sales-stock-summary/:id` | Vendor: own; Admin: specific | Sales vs. stock summary for a specific product    |

---

## Sample Credentials

All sample accounts share the same password: `Test1@123`

### Admin

| Email           |
| --------------- |
| admin@gmail.com |

### Vendors

| Email            |
| ---------------- |
| amelia@gmail.com |
| olivia@gmail.com |
| sarah@gmail.com  |

### Customers

| Email           |
| --------------- |
| jhon@gmail.com  |
| jane@gmail.com  |
| emily@gmail.com |
