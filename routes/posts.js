const express = require('express');
const router = express.Router();
const Post = require('../models/schema');
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
            return res.status(403).json({ message: 'Cannot add a comment to an expired post.' });
        }

        const comment = {
            user: req.body.user,
            text: req.body.text,
            date: new Date(),
        };

        post.comments.push(comment);
        await post.save();
        res.status(201).json({ message: 'Comment added!', comments: post.comments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts/:id/like - Like a post
router.post('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');

        // Prevent interactions with expired posts
        if (post.status === 'Expired') {
            return res.status(403).json({ message: 'Cannot like an expired post.' });
        }

        post.likes++;
        await post.save();
        res.status(200).json({ message: 'Post liked!', likes: post.likes });
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
            return res.status(403).json({ message: 'Cannot dislike an expired post.' });
        }

        post.dislikes++;
        await post.save();
        res.status(200).json({ message: 'Post disliked!', dislikes: post.dislikes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;