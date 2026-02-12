const { validationResult } = require('express-validator');

// this is like a security guard at the door. 
// it checks if the input follows the rules we set in the routes.
// helps keep controllers skinny so we dont copy paste error checks everywhere.
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { validateRequest };
