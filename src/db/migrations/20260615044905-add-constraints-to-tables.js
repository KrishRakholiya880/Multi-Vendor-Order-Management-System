"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // add foreign key constraints
    // await queryInterface.sequelize.query(`
    // ALTER TABLE refresh_tokens
    // ADD CONSTRAINT frk_user_id_in_rt
    // FOREIGN KEY (user_id)
    // REFERENCES users (id)
    // ON DELETE CASCADE
    // ON UPDATE CASCADE;
    // `);
    // await queryInterface.sequelize.query(`
    // ALTER TABLE vendor_details
    // ADD CONSTRAINT frk_user_id_in_vd
    // FOREIGN KEY (user_id)
    // REFERENCES users (id)
    // ON DELETE CASCADE
    // ON UPDATE CASCADE;
    // `);
    // await queryInterface.sequelize.query(`
    // ALTER TABLE products
    // ADD CONSTRAINT frk_cat_in_prods
    // FOREIGN KEY (category_id)
    // REFERENCES categories (id)
    // ON DELETE CASCADE
    // ON UPDATE CASCADE;
    // `);
    // await queryInterface.sequelize.query(`
    // ALTER TABLE products
    // ADD CONSTRAINT frk_vendor_id_in_prods
    // FOREIGN KEY (vendor_id)
    // REFERENCES users (id)
    // ON DELETE CASCADE
    // ON UPDATE CASCADE;
    // `);
    // await queryInterface.sequelize.query(`
    // ALTER TABLE carts
    // ADD CONSTRAINT frk_customer_id_in_carts
    // FOREIGN KEY (customer_id)
    // REFERENCES users (id)
    // ON DELETE CASCADE
    // ON UPDATE CASCADE;
    // `);
    // await queryInterface.sequelize.query(`
    // ALTER TABLE cart_items
    // ADD CONSTRAINT frk_cart_id_in_cart_items
    // FOREIGN KEY (cart_id)
    // REFERENCES carts (id)
    // ON DELETE CASCADE
    // ON UPDATE CASCADE;
    // `);
    // await queryInterface.sequelize.query(`
    // ALTER TABLE cart_items
    // ADD CONSTRAINT frk_product_id_in_cart_items
    // FOREIGN KEY (product_id)
    // REFERENCES products (id)
    // ON DELETE CASCADE
    // ON UPDATE CASCADE;
    // `);
    // await queryInterface.sequelize.query(`
    // ALTER TABLE orders
    // ADD CONSTRAINT frk_customer_id_in_orders
    // FOREIGN KEY (customer_id)
    // REFERENCES users (id)
    // ON DELETE CASCADE
    // ON UPDATE CASCADE;
    // `);
    // await queryInterface.sequelize.query(`
    // ALTER TABLE order_items
    // ADD CONSTRAINT frk_order_id_in_order_items
    // FOREIGN KEY (order_id)
    // REFERENCES orders (id)
    // ON DELETE CASCADE
    // ON UPDATE CASCADE;
    // `);
    // await queryInterface.sequelize.query(`
    // ALTER TABLE order_items
    // ADD CONSTRAINT frk_product_id_in_order_items
    // FOREIGN KEY (product_id)
    // REFERENCES products (id)
    // ON DELETE CASCADE
    // ON UPDATE CASCADE;
    // `);

    // add check constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE products
      ADD CONSTRAINT chk_min_stock
      CHECK (stock >= 0 AND stock <= 500)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE cart_items
      ADD CONSTRAINT chk_min_quantity_to_cart_items
      CHECK (quantity >= 0 AND quantity <= 15)
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE order_items
      ADD CONSTRAINT chk_min_quantity_to_order_items
      CHECK (quantity >= 0 AND quantity <= 15)
    `);

    // add other constraints
    await queryInterface.sequelize.query(
      `ALTER TABLE cart_items ADD CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE order_items ADD CONSTRAINT unique_order_product UNIQUE (order_id, product_id)`,
    );
  },

  async down(queryInterface, Sequelize) {
    // remove check constraints
    await queryInterface.sequelize.query(
      `ALTER TABLE products DROP CHECK chk_min_stock`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE cart_items DROP CHECK chk_min_quantity_to_cart_items`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE order_items DROP CHECK chk_min_quantity_to_order_items`,
    );

    // remove other constraints
    await queryInterface.sequelize.query(
      `ALTER TABLE cart_items DROP CONSTRAINT unique_cart_product;`,
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE order_items DROP CONSTRAINT unique_order_product;`,
    );
  },
};
