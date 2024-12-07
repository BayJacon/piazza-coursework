const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../verifyToken');
const { postValidation, commentValidation } = require('../validations/validation');

// POST /posts - CREATE a new post
router.post('/', auth, async (req, res) => {
    const { title, text, topic, duration } = req.body;

    try {
        // Validate input
        const { error } = postValidation(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Validate and calculate expiration time
        const minutes = Number(duration);
        if (isNaN(minutes) || minutes < 1 || minutes > 999) {
            return res.status(400).json({ message: 'Duration must be a number between 1 and 999.' });
        }

        const now = new Date();
        const expirationTime = new Date(now.getTime() + minutes * 60 * 1000);
        const username = req.user.username; // Assuming your auth middleware attaches the username

        // Create new post data
        const postData = new Post({
            user: username, // Save username directly
            title,
            text,
            topic,
            expirationTime,
            status: 'Live', // Default status
        });

        const postToSave = await postData.save();
        res.status(201).json(postToSave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /posts - READ all posts, with optional filtering by topic and status
router.get('/', auth, async (req, res) => {
    try {
        const { topic, status } = req.query; // Extract query parameters
        const filter = {};

        // Filter by topic if provided
        if (topic) {
            filter.topic = topic;
        }

        // Filter by status if provided
        if (status) {
            if (status !== 'Live' && status !== 'Expired') {
                return res.status(400).json({ message: 'Invalid status filter. Use "Live" or "Expired".' });
            }
            filter.status = status;
        }

        // Fetch posts based on filters
        const posts = await Post.find(filter);
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts/:id/comment - Add a comment to a post (UPDATE)
router.post('/:id/comment', auth, async (req, res) => {
    try {
        // Validate input
        const { error } = commentValidation(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');

        // Prevent interactions with expired posts
        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot comment on an expired post.' });
        }

        const now = new Date();
        const timeLeft = Math.max(0, post.expirationTime - now);
        const minutesLeft = Math.floor(timeLeft / 60000);

        // Add the comment
        const comment = {
            user: req.user.username, // Store username instead of user ID
            text: req.body.text,
            date: now,
        };

        post.comments.push(comment);
        post.totalInteractions++; // Increment total interactions
        await post.save();

        res.status(201).json({
            message: `${req.user.username} added a comment!`,
            comments: post.comments,
            totalInteractions: post.totalInteractions,
            timeLeft: minutesLeft > 0 ? `${minutesLeft} minutes` : 'Expired',
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');

        // Prevent post owner from liking their own post
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
            message: `User ${req.user.username} liked this post.`,
            likes: post.likes,
            totalInteractions: post.totalInteractions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:id/dislike', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');

        // Prevent post owner from disliking their own post
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
            message: `User ${req.user.username} disliked this post.`,
            dislikes: post.dislikes,
            totalInteractions: post.totalInteractions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;