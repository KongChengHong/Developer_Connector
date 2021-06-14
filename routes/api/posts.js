const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const Post = require('../../modals/Post');
const Profile = require('../../modals/Profile');
const User = require('../../modals/User');

/**
 * @route   POST api/posts
 * @desc    Create a post
 * @access  Private
 */

router.post(
    '/',
    [auth, [check('text', 'Text is required').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.aaarray() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');

            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            });

            await newPost.save();

            res.json(newPost);
        } catch (err) {
            console.err(err.message);
            res.status(500).send('Server Error');
        }
    }
);

/**
 * @route   GET api/posts
 * @desc    Get all posts
 * @access  Private
 * only user logged in can see all the posts
 */

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 }); //the most recent first
        res.json(posts);
    } catch (err) {
        console.err(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET api/posts/:id
 * @desc    Get post by ID
 * @access  Private
 */

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); //the most recent first
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

/**
 * @route   DELETE api/posts/:id
 * @desc    DELETE a post
 * @access  Private
 * only user logged in can see all the posts
 */

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); //the most recent first

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        //Check User
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await post.remove();

        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT api/posts/like/:id
 * @desc    Like a post
 * @access  Private
 * only user logged in can see all the posts
 */

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //Check if the post has already been liked
        if (
            post.likes.filter((like) => like.user.toString() === req.user.id) //user already liked this post
                .length > 0
        ) {
            return res.status(400).json({ msg: 'Post already liked' });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes); //in order to update in the frontend
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT api/posts/like/:id
 * @desc    Like a post
 * @access  Private
 * only user logged in can see all the posts
 */

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //Get remove index
        const removeIndex = post.likes
            .map((like) => like.user.toString())
            .indexOf(req.user.id);

        //Check if the post has already been liked
        if (
            // post.likes.filter((like) => like.user.toString() === req.user.id) //user already liked this post
            //     .length === 0
            removeIndex === -1
        ) {
            return res.status(400).json({ msg: 'Post has not yet been liked' });
        } else {
            post.likes.splice(removeIndex, 1);
        }

        await post.save();

        res.json(post.likes); //in order to update in the frontend
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST api/posts/comment/:id
 * @desc    Comment on a post
 * @access  Private
 */

router.post(
    '/comment/:id',
    [auth, [check('text', 'Text is required').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.aaarray() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id,
            };

            post.comments.unshift(newComment);

            await post.save();

            res.json(post.comments);
        } catch (err) {
            console.err(err.message);
            res.status(500).send('Server Error');
        }
    }
);

/**
 * @route   DELETE api/posts/comment/:post_id/:comment_id
 * @desc    Delete comment
 * @access  Private
 */

router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        //Pull out comment

        const comment = post.comments.find(
            (comment) => comment.id === req.params.comment_id
        );

        //Make sure comment exists
        if (!comment) {
            return res.status(404).json({ msg: 'Comment does not exist' });
        }

        //Check user is the same person
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        //Get remove index
        const removeIndex = post.comments
            .map((comment) => comment.user.toString())
            .indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);

        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
