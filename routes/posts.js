const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../verifyToken');
const { postValidation, commentValidation } = require('../validations/validation');

// POST /posts - CREATE a new post
router.post('/', auth, async (req, res) => {
    const { error } = postValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { title, text, topic, duration } = req.body;

    try {
        const now = new Date();
        const expirationTime = new Date(now.getTime() + duration * 60 * 1000);

        const postData = new Post({
            user: req.user.username,
            title,
            text,
            topic,
            expirationTime,
            status: 'Live',
        });

        const postToSave = await postData.save();
        res.status(201).json(postToSave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /posts - READ all posts with optional filters
router.get('/', auth, async (req, res) => {
    const { topic, status } = req.query;
    const filter = {};

    if (topic) filter.topic = topic;
    if (status) {
        if (!['Live', 'Expired'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Use "Live" or "Expired".' });
        }
        filter.status = status;
    }

    try {
        const posts = await Post.find(filter);
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /posts/top - Get the most popular active post
router.get('/top', auth, async (req, res) => {
    const { topic } = req.query;
    const filter = { status: 'Live' };

    if (topic) filter.topic = topic;

    try {
        const topPost = await Post.find(filter).sort({ likes: -1, dislikes: -1 }).limit(1);

        if (!topPost.length) {
            return res.status(404).json({ message: 'No active posts found.' });
        }

        res.status(200).json(topPost[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts/:id/comment - Add a comment
router.post('/:id/comment', auth, async (req, res) => {
    const { error } = commentValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found.' });

        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot comment on an expired post.' });
        }

        const comment = {
            user: req.user.username,
            text: req.body.text,
            date: new Date(),
        };

        post.comments.push(comment);
        post.totalInteractions++;
        await post.save();

        res.status(201).json({
            message: `${req.user.username} added a comment!`,
            comments: post.comments,
            totalInteractions: post.totalInteractions,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts/:id/like - Like a post
router.post('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found.' });

        if (post.user === req.user.username) {
            return res.status(403).json({ message: 'Post owners cannot like their own posts.' });
        }

        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot like an expired post.' });
        }

        post.likes++;
        post.totalInteractions++;
        await post.save();

        res.status(200).json({
            message: `${req.user.username} liked this post!`,
            likes: post.likes,
            totalInteractions: post.totalInteractions,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts/:id/dislike - Dislike a post
router.post('/:id/dislike', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found.' });

        if (post.user === req.user.username) {
            return res.status(403).json({ message: 'Post owners cannot dislike their own posts.' });
        }

        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot dislike an expired post.' });
        }

        post.dislikes++;
        post.totalInteractions++;
        await post.save();

        res.status(200).json({
            message: `${req.user.username} disliked this post!`,
            dislikes: post.dislikes,
            totalInteractions: post.totalInteractions,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;