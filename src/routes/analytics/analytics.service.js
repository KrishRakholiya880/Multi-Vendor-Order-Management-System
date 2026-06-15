const analyticsDb = require("../../dbUtils/analyticsDb");
const redisClient = require("../../helper/redis");

const getVendorsSalesSummary = async (userData, page, limit) => {
  let cacheKey = `analytics:vendors-sales-summary:${userData?.role}`;

  if (userData?.role === "vendor") cacheKey += `:${userData?.id}`;
  if (userData?.role === "admin" && page) cacheKey += `:page:${page}`;
  if (userData?.role === "admin" && limit) cacheKey += `:limit:${limit}`;

  const cachedData = await redisClient.GET(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await analyticsDb.vendorsSalesSummary(userData, page, limit);

  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }

  await redisClient.SET(cacheKey, result, 2 * 60);

  return result;
};

const getCustomersPurchaseSummary = async (userData, page, limit) => {
  let cacheKey = `analytics:customers-purchase-summary:${userData?.role}`;

  if (userData?.role === "customer") cacheKey += `:${userData?.id}`;
  if (page) cacheKey += `:page:${page}`;
  if (limit) cacheKey += `:limit:${limit}`;

  const cachedData = await redisClient.GET(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await analyticsDb.customersPurchaseSummary(
    userData,
    page,
    limit,
  );

  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }

  await redisClient.SET(cacheKey, result, 2 * 60);

  return result;
};

const getRevenue = async (
  userData,
  page,
  limit,
  month,
  year,
  startDate,
  endDate,
) => {
  let cacheKey = `analytics:revenue:${userData?.role}`;

  if (userData?.role === "vendor") cacheKey += `:${userData?.id}`;
  if (userData?.role === "admin" && page) cacheKey += `:page:${page}`;
  if (userData?.role === "admin" && limit) cacheKey += `:limit:${limit}`;
  if (year) cacheKey += `:year:${year}`;
  if (month) cacheKey += `:month:${month}`;
  if (startDate) cacheKey += `:startDate:${startDate}`;
  if (endDate) cacheKey += `:endDate:${endDate}`;

  const cachedData = await redisClient.GET(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await analyticsDb.revenue(
    userData,
    page,
    limit,
    month,
    year,
    startDate,
    endDate,
  );

  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }

  await redisClient.SET(cacheKey, result, 2 * 60);

  return result;
};

const getProductPerformanceMetrics = async (userData, page, limit) => {
  let cacheKey = `analytics:product-metrics:${userData?.role}`;

  if (userData?.role === "vendor") cacheKey += `:${userData?.id}`;
  if (page) cacheKey += `:page:${page}`;
  if (limit) cacheKey += `:limit:${limit}`;

  const cachedData = await redisClient.GET(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await analyticsDb.productPerformanceMetrics(
    userData,
    null,
    page,
    limit,
  );

  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }

  await redisClient.SET(cacheKey, result, 2 * 60);

  return result;
};

const getProductPerformanceMetricsById = async (userData, id) => {
  let cacheKey = `analytics:product-metrics:${userData?.role}${userData?.role === "vendor" ? `:${userData?.id}` : ""}${id ? `:id:${id}` : ""}`;

  const cachedData = await redisClient.GET(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await analyticsDb.productPerformanceMetrics(userData, id);

  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }

  await redisClient.SET(cacheKey, result, 2 * 60);

  return result;
};

const getProductSalesStockSummary = async (
  userData,
  days,
  minStock,
  page,
  limit,
) => {
  let cacheKey = `analytics:product-sales-stock-summary:${userData?.role}`;

  if (userData?.role === "vendor") cacheKey += `:${userData?.id}`;
  if (minStock) cacheKey += `:minStock:${minStock}`;
  if (days) cacheKey += `:days:${days}`;
  if (page) cacheKey += `:page:${page}`;
  if (limit) cacheKey += `:limit:${limit}`;

  const cachedData = await redisClient.GET(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await analyticsDb.productSalesStockSummary(
    userData,
    null,
    minStock,
    days,
    page,
    limit,
  );

  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }

  await redisClient.SET(cacheKey, result, 2 * 60);

  return result;
};

const getProductSalesStockSummaryById = async (
  userData,
  productId,
  days,
  minStock,
) => {
  let cacheKey = `analytics:product-sales-stock-summary:${userData?.role}${userData?.role === "vendor" ? `:${userData?.id}` : ""}${productId ? `:id:${productId}` : ""}`;

  const cachedData = await redisClient.GET(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const result = await analyticsDb.productSalesStockSummary(
    userData,
    productId,
    minStock,
    days,
  );

  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }

  await redisClient.SET(cacheKey, result, 2 * 60);

  return result;
};

module.exports = {
  getVendorsSalesSummary,
  getCustomersPurchaseSummary,
  getRevenue,
  getProductPerformanceMetrics,
  getProductPerformanceMetricsById,
  getProductSalesStockSummary,
  getProductSalesStockSummaryById,
};
