/**
 * Request Validation Middleware
 * Validates request data against a provided schema object.
 *
 * Usage:
 *   router.post('/user', validate({ body: { name: 'required', email: 'required' } }), handler);
 *
 * Schema format:
 *   { body: { fieldName: 'required'|'optional' }, query: {...}, params: {...} }
 */

const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    if (schema.body) {
      for (const [field, rule] of Object.entries(schema.body)) {
        if (rule === 'required' && (req.body[field] === undefined || req.body[field] === null || req.body[field] === '')) {
          errors.push(`Body field '${field}' is required`);
        }
      }
    }

    if (schema.query) {
      for (const [field, rule] of Object.entries(schema.query)) {
        if (rule === 'required' && (req.query[field] === undefined || req.query[field] === '')) {
          errors.push(`Query parameter '${field}' is required`);
        }
      }
    }

    if (schema.params) {
      for (const [field, rule] of Object.entries(schema.params)) {
        if (rule === 'required' && (req.params[field] === undefined || req.params[field] === '')) {
          errors.push(`Path parameter '${field}' is required`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
};

module.exports = validate;
