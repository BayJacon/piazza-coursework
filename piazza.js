const express = require('express');
const router = express.Router();

const Post = require('../models/Post');

// Define the POST route once to avoid conflicts
router.post('/', async (req, res) => {
    const postData = new Post({
        user: req.body.user,
        title: req.body.title,
        text: req.body.text,
        hashtag: req.body.hashtag,
        location: req.body.location,
        url: req.body.url
    });

    // Try to save the new post
    try {
        const postToSave = await postData.save();
        res.status(201).json(postToSave);  // Send a success response with status 201
    } catch (err) {
        res.status(500).json({ message: err.message });  // Send a failure response with status 500
    }
});

router.get('/, async(req,res) =>')

module.exports = router;


router.get('/', async (req, res) => {
    try {
        const topic = req.query.topic;
        const posts = topic
            ? await Post.find({ topic })
            : await Post.find();
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:id/comment', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).send('Post not found');

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
