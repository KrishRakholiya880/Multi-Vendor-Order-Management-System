const analyticsService = require("./analytics.service");

const getVendorsSalesSummary = async (req, res, next) => {
  const userData = req.user;
  const { page, limit } = req.query;

  try {
    const result = await analyticsService.getVendorsSalesSummary(
      userData,
      Number(page) || 1,
      Number(limit) || 20,
    );
    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

const getCustomersPurchaseSummary = async (req, res, next) => {
  const userData = req.user;
  const { page, limit } = req.query;

  try {
    const result = await analyticsService.getCustomersPurchaseSummary(
      userData,
      Number(page) || 1,
      Number(limit) || 20,
    );
    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

const getRevenue = async (req, res, next) => {
  const userData = req.user;
  const { page, limit, month, year, startDate, endDate } = req.query;

  try {
    const result = await analyticsService.getRevenue(
      userData,
      Number(page) || 1,
      Number(limit) || 20,
      month,
      year,
      startDate,
      endDate,
    );
    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

const getProductPerformanceMetrics = async (req, res, next) => {
  const userData = req.user;
  const { page, limit } = req.query;

  try {
    const result = await analyticsService.getProductPerformanceMetrics(
      userData,
      Number(page) || 1,
      Number(limit) || 20,
    );
    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

const getProductPerformanceMetricsById = async (req, res, next) => {
  const userData = req.user;
  const { id } = req.params;

  try {
    const result = await analyticsService.getProductPerformanceMetricsById(
      userData,
      Number(id),
    );
    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

const getProductSalesStockSummary = async (req, res, next) => {
  const userData = req.user;
  const { minStock, days, page, limit } = req.query;

  try {
    const result = await analyticsService.getProductSalesStockSummary(
      userData,
      Number(days),
      Number(minStock),
      Number(page) || 1,
      Number(limit) || 20,
    );
    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
};

const getProductSalesStockSummaryById = async (req, res, next) => {
  const userData = req.user;
  const { minStock, days } = req.query;
  const { id } = req.params;

  try {
    const result = await analyticsService.getProductSalesStockSummaryById(
      userData,
      id,
      Number(days),
      Number(minStock),
    );
    return res.status(200).json({ status: true, result });
  } catch (error) {
    next(error);
  }
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
