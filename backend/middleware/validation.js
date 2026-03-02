const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const farmerValidation = [
  body('name').notEmpty().trim().escape(),
  body('phone').isMobilePhone('any'),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  validateRequest
];

const productValidation = [
  body('name').notEmpty().trim().escape(),
  body('category').isIn(['livestock', 'grains', 'vegetables', 'fruits', 'others']),
  body('price_per_unit').isFloat({ min: 0 }),
  body('quantity').optional().isInt({ min: 1 }),
  validateRequest
];

module.exports = {
  farmerValidation,
  productValidation,
  validateRequest
};