const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

const Profile = require('../../modals/Profile');
const User = require('../../modals/User');

/**
 * @route   GET api/profile/me
 * @desc    Get current users profile
 * @access  Private
 */

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate(
            'user',
            ['name', 'avatar']
        );

        if (!profile) {
            return res
                .status(400)
                .json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST api/profile
 * @desc    Create or update user profile
 * @access  Private
 */
router.post(
    '/',
    [
        auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // destructure the request

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook,
            // spread the rest of the fields we don't need to check
            ...rest
        } = req.body;

        //Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills
                .split(',')
                .map((skill) => skill.trim());
        }

        //Build social objext
        profileFields.socail = {};

        if (youtube) profileFields.socail.youtube = youtube;
        if (twitter) profileFields.socail.twitter = twitter;
        if (facebook) profileFields.socail.facebook = facebook;
        if (instagram) profileFields.socail.instagram = instagram;
        if (linkedin) profileFields.socail.linkedin = linkedin;

        try {
            let profile = await Profile.findOne({ user: req.user.id }); //user is id and req.user.id comes from JWT
            if (profile) {
                //Update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }

            //Create
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
    }
);

/**
 * @route   GET api/profile
 * @desc    Get all profiles
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', [
            'name',
            'avatar',
        ]);
        res.json(profiles);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET api/profile/user/:user_id
 * @desc    Get profile by user ID
 * @access  Public
 */
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id,
        }).populate('user', ['name', 'avatar']);

        if (!profile) return res.status(400).json({ msg: 'Profile not found' });

        res.json(profile);
    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   DELETE api/profile
 * @desc    Delete profile, user & posts
 * @access  Private
 */
router.delete('/', auth, async (req, res) => {
    try {
        //todo - remove users posts

        //Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });

        //Remove profile
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT api/profile/experience
 * @desc    Add profile experience
 * @access  Private
 */

router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newExp = ({
            title,
            company,
            location,
            from,
            to,
            current,
            description,
        } = req.body);

        console.log('newExp', newExp);

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.experience.unshift(newExp); //I want last one on the top of the list

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

/**
 * @route   DELETE api/profile/experience/:exp_id
 * @desc    Delete experience from profile
 * @access  Private
 */
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //Get remove index

        const removeIndex = profile.experience
            .map((item) => item.id)
            .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT api/profile/education
 * @desc    Add profile education
 * @access  Private
 */

router.put(
    '/education',
    [
        auth,
        [
            check('school', 'School is required').not().isEmpty(),
            check('degree', 'Degree is required').not().isEmpty(),
            check('fieldofstudy', 'Field of study is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const newEdu = ({
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description,
        } = req.body);

        try {
            const profile = await Profile.findOne({ user: req.user.id });

            profile.education.unshift(newEdu); //I want last one on the top of the list

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

/**
 * @route   DELETE api/profile/education/:exp_id
 * @desc    Delete education from profile
 * @access  Private
 */
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        //Get remove index

        const removeIndex = profile.education
            .map((item) => item.id)
            .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET api/profile/github/:username
 * @desc    GET user repos from Github
 * @access  Public
 */

router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${
                req.params.username
            }/repos?per_page=5&sort=created:asc&client_id=${config.get(
                'githubClientId'
            )}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' },
        };

        request(options, (error, response, body) => {
            if (error) console.error(error);

            if (response.statusCode !== 200) {
                return res.status(404).json({ msg: 'No Github profile found' });
            }

            res.json(JSON.parse(body));
        });
    } catch (err) {
        console.err(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
