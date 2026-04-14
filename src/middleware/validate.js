const validate = (schema) => {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        await schema.body.validateAsync(req.body, { abortEarly: false });
      }
      if (schema.query) {
        await schema.query.validateAsync(req.query, { abortEarly: false });
      }
      if (schema.params) {
        await schema.params.validateAsync(req.params, { abortEarly: false });
      }
      return next();
    } catch (error) {
      const errorMessage = error.details?.map((detail) => detail.message) || [
        error.message,
      ];
      return res.status(400).json({ error: errorMessage });
    }
  };
};

module.exports = validate;
