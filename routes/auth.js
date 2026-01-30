// Authentication routes
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { body } = require('express-validator');

// Validation rules
const registerValidation = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
];

// GET /auth/register - Show registration form
router.get('/register', AuthController.showRegister);

// POST /auth/register - Handle registration
router.post('/register', registerValidation, AuthController.register);

// GET /auth/login - Show login form
router.get('/login', AuthController.showLogin);

// POST /auth/login - Handle login
router.post('/login', AuthController.login);

// GET /auth/logout - Handle logout
router.get('/logout', AuthController.logout);

module.exports = router;