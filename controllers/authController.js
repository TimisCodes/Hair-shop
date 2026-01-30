// Authentication controller - handles login and registration
const User = require('../models/User');
const { validationResult } = require('express-validator');

class AuthController {
    // Show registration page
    static showRegister(req, res) {
        res.render('register', {
            title: 'Register',
            errors: [],
            formData: {}
        });
    }
    
    // Handle registration
    static async register(req, res) {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('register', {
                    title: 'Register',
                    errors: errors.array(),
                    formData: req.body
                });
            }
            
            const { firstName, lastName, email, password, phone, address } = req.body;
            
            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.render('register', {
                    title: 'Register',
                    errors: [{ msg: 'Email already registered' }],
                    formData: req.body
                });
            }
            
            // Create new user
            const user = await User.create({
                firstName,
                lastName,
                email,
                password,
                phone,
                address
            });
            
            // Log user in
            req.session.userId = user.id;
            req.session.isAdmin = user.is_admin;
            
            req.flash('success', 'Registration successful! Welcome to our store.');
            res.redirect('/');
            
        } catch (error) {
            console.error('Registration error:', error);
            res.render('register', {
                title: 'Register',
                errors: [{ msg: 'An error occurred. Please try again.' }],
                formData: req.body
            });
        }
    }
    
    // Show login page
    static showLogin(req, res) {
        res.render('login', {
            title: 'Login',
            errors: []
        });
    }
    
    // Handle login
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return res.render('login', {
                    title: 'Login',
                    errors: [{ msg: 'Invalid email or password' }]
                });
            }
            
            // Verify password
            const isValidPassword = await User.verifyPassword(password, user.password);
            if (!isValidPassword) {
                return res.render('login', {
                    title: 'Login',
                    errors: [{ msg: 'Invalid email or password' }]
                });
            }
            
            // Set session
            req.session.userId = user.id;
            req.session.isAdmin = user.is_admin;
            
            req.flash('success', 'Login successful!');
            
            // Redirect to admin dashboard if admin, otherwise home
            if (user.is_admin) {
                res.redirect('/admin/dashboard');
            } else {
                res.redirect('/');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            res.render('login', {
                title: 'Login',
                errors: [{ msg: 'An error occurred. Please try again.' }]
            });
        }
    }
    
    // Handle logout
    static logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/');
        });
    }
}

module.exports = AuthController;