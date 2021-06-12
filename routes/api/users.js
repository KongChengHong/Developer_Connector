const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');

const User = require('../../modals/User');

/**
 * @route   POST api/users
 * @desc    Register user
 * @access  Public
 */

router.post(
    '/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more charactors'
        ).isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }); //bad request
        }

        const { name, email, password } = req.body;

        try {
            //See if user exist
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({
                    errors: [{ msg: 'User already exists' }],
                });
            }

            //Get user's gravatar
            const avatar = gravatar.url(email, {
                s: '200', //size
                r: 'pg', //rating
                d: 'mm', //default icon given by gravatar
            });

            user = new User({ name, email, avatar, password });
            console.log('user instance', user);

            //Encript password
            const salt = await bcrypt.genSalt(10); //salt hashing, 10 by recommendation, the more you have the more secure but slower
            user.password = await bcrypt.hash(password, salt);

            //save to database
            await user.save();

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
