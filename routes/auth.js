const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

// GET

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.get('/reset/:token', authController.getNewPassowrd);

// POST

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 3 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email :)')
      .custom((value, { req }) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address is forbidden >:(');
        // }
        // return true;
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              'Email exists already. Please pick a different one :)'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters'
    )
      .isLength({ min: 3 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('passwords have to match!');
        }
        return true;
      })
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.post('/reset', authController.postReset);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
