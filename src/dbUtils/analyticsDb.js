const { sequelize } = require("../db/models");

const vendorsSalesSummary = async (userData, page, limit) => {
  let result;
  const offset = (page - 1) * limit;

  result = await sequelize.query(
    `SELECT u.id as vendor_id, u.full_name as vendor_name, COUNT(DISTINCT o.id) as total_orders, SUM(oi.quantity) as total_products_sold, SUM(oi.price_at_purchase * oi.quantity) as total_revenue FROM users u JOIN products p ON p.vendor_id = u.id JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id WHERE u.role = 'vendor' ${userData?.role === "vendor" ? "AND u.id = :vendorId" : ""} AND oi.status = "delivered" GROUP BY u.id, u.full_name LIMIT :limit OFFSET :offset`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        ...(userData?.role === "vendor" && { vendorId: userData?.id }),
        limit,
        offset,
      },
    },
  );

  return result;
};

const customersPurchaseSummary = async (userData, page, limit) => {
  let result;
  const offset = (page - 1) * limit;

  result = await sequelize.query(
    `SELECT u.id as customer_id, u.full_name as customer_name, SUM(oi.quantity) as total_purchased_products, SUM(oi.price_at_purchase * oi.quantity) as total_spent FROM users u JOIN orders o ON o.customer_id = u.id JOIN order_items oi ON oi.order_id = o.id WHERE u.role = 'customer' ${userData?.role === "customer" ? "AND u.id = :customerId" : ""} AND oi.status = 'delivered' GROUP BY u.id, u.full_name LIMIT :limit OFFSET :offset`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        ...(userData?.role === "customer" && { customerId: userData?.id }),
        limit,
        offset,
      },
    },
  );

  return result;
};

const revenue = async (
  userData,
  page,
  limit,
  month,
  year,
  startDate,
  endDate,
) => {
  let result;
  const offset = (page - 1) * limit;

  result = await sequelize.query(
    `SELECT p.vendor_id, DATE_FORMAT(o.created_at, '%Y-%m') as date, SUM(oi.price_at_purchase * oi.quantity) as total_revenue, COUNT(DISTINCT o.id) as total_orders, SUM(oi.quantity) as total_products_sold FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE oi.status = 'delivered' ${userData?.role === "vendor" ? "AND p.vendor_id = :vendorId" : ""} ${startDate && endDate ? "AND o.created_at BETWEEN :startDate AND :endDate" : ""} ${year && !month ? "AND YEAR(o.created_at) = :year" : ""} ${year && month ? "AND YEAR(o.created_at) = :year AND MONTH(o.created_at) = :month" : ""} GROUP BY p.vendor_id, DATE_FORMAT(o.created_at, '%Y-%m') ORDER BY date ASC LIMIT :limit OFFSET :offset`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        ...(userData?.role === "vendor" && { vendorId: userData?.id }),
        ...(startDate && endDate && { startDate, endDate }),
        ...(year && !month && { year }),
        ...(year && month && { year, month }),
        limit,
        offset,
      },
    },
  );

  return result;
};

const productPerformanceMetrics = async (userData, productId, page, limit) => {
  let result;
  const offset = (page - 1) * limit;

  result = await sequelize.query(
    `SELECT p.id as product_id, p.name as product_name, COUNT(DISTINCT o.id) as total_orders, SUM(oi.quantity) as total_sold, SUM(oi.price_at_purchase * oi.quantity) as total_revenue FROM products p JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id WHERE oi.status = 'delivered' ${userData?.role === "vendor" ? "AND p.vendor_id = :vendorId" : ""} ${productId ? "AND p.id = :productId" : ""} GROUP BY p.id, p.name ORDER BY total_revenue DESC ${limit ? "LIMIT :limit" : ""} ${offset ? "OFFSET :offset" : ""}`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        ...(userData?.role === "vendor" && { vendorId: userData?.id }),
        ...(productId && { productId }),
        limit,
        offset,
      },
    },
  );

  return result;
};

const productSalesStockSummary = async (
  userData,
  productId,
  minStock,
  days,
  page,
  limit,
) => {
  let result;
  const offset = (page - 1) * limit;

  result = await sequelize.query(
    `SELECT p.id as product_id, p.name as product_name, p.stock as current_stock, MAX(o.created_at) as last_sold_at, SUM(oi.quantity) as total_sold_ever FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id LEFT JOIN orders o ON o.id = oi.order_id WHERE p.stock > :minStock ${userData?.role === "vendor" ? "AND p.vendor_id = :vendorId" : ""} ${productId ? "AND p.id = :productId" : ""} GROUP BY p.id, p.name, p.stock HAVING (MAX(o.created_at) IS NULL OR MAX(o.created_at) < DATE_SUB(NOW(), INTERVAL ${days ? ":days" : "30"} DAY)) ORDER BY p.stock DESC ${limit ? "LIMIT :limit" : ""} ${offset ? "OFFSET :offset" : ""}`,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: {
        ...(userData?.role === "vendor" && { vendorId: userData?.id }),
        ...(productId && { productId }),
        ...(minStock && { minStock }),
        ...(days && { days }),
        limit,
        offset,
      },
    },
  );

  return result;
};

module.exports = {
  vendorsSalesSummary,
  customersPurchaseSummary,
  revenue,
  productPerformanceMetrics,
  productSalesStockSummary,
};
