const express = require('express');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');

const auth = require('../../middleware/auth');
const User = require('../../modals/User');

/**
 * @route   GET api/auth
 * @desc    TEST route
 * @access  Public
 */

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST api/auth
 * @desc    Authenticate user & get token
 * @access  Public
 */

router.post(
    '/',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }); //bad request
        }

        const { email, password } = req.body;

        try {
            //See if user exist
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    errors: [{ msg: 'Invalid Credentials' }],
                });
            }

            //check if password is correct

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({
                    errors: [{ msg: 'Invalid Credentials' }],
                });
            }

            //Return jsonwebtoken
            const payload = { user: { id: user.id } };
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error'); //server related error
        }
    }
);

module.exports = router;
