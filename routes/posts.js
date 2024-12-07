const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../verifyToken');
const { postValidation } = require('../validations/validation');

// POST /posts - CREATE a new post
router.post('/', auth, async (req, res) => {
    // Validate input
    const { error } = postValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { title, text, topic, duration } = req.body;

    try {
        // Validate and calculate the expiration time
        const minutes = Number(duration);
        if (isNaN(minutes) || minutes < 1 || minutes > 999) {
            return res.status(400).json({ message: 'Duration must be a number between 1 and 999.' });
        }

        const now = new Date();
        const expirationTime = new Date(now.getTime() + minutes * 60 * 1000);

        // Create new post data
        const postData = new Post({
            user: req.user._id, // Associate with authenticated user
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

// GET /posts - READ all posts
router.get('/', auth, async (req, res) => {
    try {
        const topic = req.query.topic;

        // Fetch posts, optionally filtering by topic
        const posts = topic
            ? await Post.find({ topic })
            : await Post.find();

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts/:id/comment - Add a comment to a post (UPDATE)
router.post('/:id/comment', auth, async (req, res) => {
    try {
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
            user: req.user._id, // Store user ID (or username)
            text: req.body.text,
            date: now,
        };

        post.comments.push(comment);
        post.totalInteractions++; // Increment total interactions
        await post.save();

        res.status(201).json({
            message: 'Comment added!',
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

        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot like an expired post.' });
        }

        const now = new Date();
        const timeLeft = Math.max(0, post.expirationTime - now);
        const minutesLeft = Math.floor(timeLeft / 60000);

        post.likes++;
        post.totalInteractions++; // Increment total interactions
        await post.save();

        res.status(200).json({
            message: `User ${req.user._id} liked this post.`,
            likes: post.likes,
            totalInteractions: post.totalInteractions,
            timeLeft: minutesLeft > 0 ? `${minutesLeft} minutes` : 'Expired',
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts/:id/dislike - Dislike a post
router.post('/:id/dislike', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');

        // Prevent interactions with expired posts
        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Sorry, post is expired.' });
        }

        post.dislikes++;
        await post.save();
        res.status(200).json({ message: 'Post disliked!', dislikes: post.dislikes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;