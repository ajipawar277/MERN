const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');
const { validationResult, check } = require('express-validator');

//@route POST api/posts
//@Desc  Create a Post
//@Access Private

router.post('/', [ auth , check('text','Text is required').not().isEmpty()],
 async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
        user: req.user.id
        })
        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});

//@route GET api/posts
//@Desc  Get a Posts
//@Access Private
router.get('/',auth, async(req,res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route GET api/posts/:id
//@Desc  Get a Posts by id
//@Access Private
router.get('/:id',auth, async(req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({msg:'Post not found'});
        }
        res.json(post);
    } catch (err) {
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg:'Post not found'});
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route DELETE api/posts/:id
//@Desc  Get a Posts by id
//@Access Private
router.delete('/:id',auth, async(req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({msg:'Post not found'});
        }
        //check user
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({ msg: 'User not authorised' });
        }
        await post.deleteOne();

        res.json({msg:'Post removed'});
    } catch (err) {
        if(err.kind === 'ObjectId'){
            return res.status(404).json({msg:'Post not found'});
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

//@route PUT api/posts/like/:id
//@Desc  like a post
//@Access Private
router.put('/like/:id', auth , async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        //check if post is already liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg: 'Post already liked'});
        }
        post.likes.unshift({user: req.user.id});
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

//@route PUT api/posts/unlike/:id
//@Desc  like a post
//@Access Private
router.put('/unlike/:id', auth , async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        //check if post is already liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({msg: 'Post has not yet liked'});
        }
        //Get remove Index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex,1);
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

//@route PUT api/posts/comment/:id
//@Desc  Commet on a post
//@Access Private
router.post('/comment/:id',
    [ 
        auth, [ check('text', 'Text is required').not().isEmpty() ]
    ], async (req,res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);
            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };
            post.comments.unshift(newComment);
            await post.save();
            res.json(post.comments);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error'); 
        }
    })

//@route DELETE api/posts/comment/:id
//@Desc  Delete comment
//@Access Private

router.delete('/comment/:id/:comment_id',auth, async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        //Pull out the comment 
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        //Make suer comment exist
        if(!comment){
            return res.status(400).json({msg:'Comment does not exist'});
        }
        //Check User
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg:'User not authorised'});
        }
        //Get remove Index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex,1);
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
})

module.exports = router;