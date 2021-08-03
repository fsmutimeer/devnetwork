const express = require('express');
const {check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

const postsRouter = express.Router();


postsRouter.get('/', auth, async (req, res)=>{

    try{
        const posts = await Post.find().sort({date:-1})
        if(!posts){
            return res.status(400).json({msg:'Not found'})
        }
        res.send(posts)
 
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
 })
 postsRouter.get('/:id',auth, async (req, res)=>{

    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(400).json({msg:'Post Not found'})
        }
        res.json(post)
 
    }
    catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(400).json({msg:'Post Not found'})
        }
        res.status(500).send('Server Error');
    }
 });
postsRouter
.post('/', auth, [
    check('text', 'Text is required').not().isEmpty(),
], async (req, res)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){ return res.status(400).json({error:errors.array()})}

    try{
        const user = await User.findById(req.user.id).select("-password");

        const newPost =new Post({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        });

        const post = await newPost.save();
        res.json(post);
    }
    catch(err){
        console.error(err.message)
         res.status(500).send('Server Error')
    }
});

postsRouter.delete('/:id',auth, async (req, res)=>{
    try{

       const post = await Post.findById(req.params.id);
       if(!post){
        return res.status(400).json({msg:'Post Not found'})
    }

       if(post.user.toString() !== req.user.id){
           return res.status(401).json({msg:'user not authorized'});
       } 

       await post.remove();
       res.json({msg:'post have been deleted!'});
    }
    catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(400).json({msg:'Post Not found'})
        }
        res.status(500).send('Server Error');
    }
});

//post likes

postsRouter.put('/like/:id', auth, async (req, res)=>{
    
    try {

        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(400).json({msg:'There is no post to like'})
        }

        if(post.likes.filter(like=>like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg:'Post has already been liked!'})
        }

        post.likes.unshift({user:req.user.id});

        await post.save();
        res.json(post.likes)
        
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(400).json({msg:'There is no post to like'})
        }
        res.status(500).send('Server Error');   
    }
});


//post likes

postsRouter.put('/unlike/:id', auth, async (req, res)=>{
    
    try {

        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(400).json({msg:'There is no post to unlike'})
        }

        if(post.likes.filter(like=>like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({msg:'Post has not been liked!'})
        }

        const removeIndex = post.likes.map(like=>like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();
        res.json(post.likes)
        
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(400).json({msg:'There is no post to unlike'})
        }
        res.status(500).send('Server Error');   
    }
});

//add comments
postsRouter
.post('/comment/:id', auth, [
    check('text', 'Text is required').not().isEmpty(),
], async (req, res)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){ return res.status(400).json({errors:errors.array()})}

    try{
        const user = await User.findById(req.user.id).select("-password");

        const post = await Post.findById(req.params.id);


        const newComment = {
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        };

      post.comments.unshift(newComment);

      await post.save();
      res.json(post.comments);
    }
    catch(err){
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(400).json({msg:'comment id is invalid'})
        }
         res.status(500).send('Server Error')
    }
});
//delete comment

postsRouter.delete('/comment/:id/:comment_id', auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);

        // pull out comment
        const comment = post.comments.find(
            comment => comment.id === req.params.comment_id);
        //check if comment exist
        if(!comment){
            return res.status(404).json({msg:"comment doesn't exist"});
        }
        //check user

        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg:'User not authorized'});
        }

        //get remove index

        const removeIndex = post.comments
        .map(comment=>comment.user.toString())
        .indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);

        await post.save();
        res.json(post.comments)
   
    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId'){
            return res.status(400).json({msg:'Invalid Id'})
        }
         res.status(500).send('Server Error')
        
    }
})


module.exports = postsRouter;


