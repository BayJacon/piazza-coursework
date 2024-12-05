const express = require('express');
const router = express.Router();
const Post = require('../models/schema');

// POST /posts - Create a new post
router.post('/', async (req, res) => {
    const { user, title, text, topic, duration } = req.body;

    try {
        // Parse "HH:MM" format into hours and minutes
        const [hours, minutes] = duration.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
            return res.status(400).json({ message: 'Invalid duration format. Use "HH:MM".' });
        }

        // Calculate the expiration time
        const now = new Date();
        const expirationTime = new Date(now.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000);

        // Create a new post
        const postData = new Post({
            user,
            title,
            text,
            topic,
            expirationTime,
            status: 'Live' // Default status
        });

        const postToSave = await postData.save();
        res.status(201).json(postToSave);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /posts - Fetch all posts
router.get('/', async (req, res) => {
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

// POST /posts/:id/comment - Add a comment to a post
router.post('/:id/comment', async (req, res) => {
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
            date: new Date()
        };

        post.comments.push(comment);
        await post.save();
        res.status(201).json({ message: 'Comment added!', comments: post.comments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /posts/:id/like - Like a post
router.post('/:id/like', async (req, res) => {
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
router.post('/:id/dislike', async (req, res) => {
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