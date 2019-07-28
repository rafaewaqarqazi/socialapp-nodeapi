
const express = require('express');
const  {
    getPosts,
    createPost,
    postsByUser,
    postByID,
    isPoster,
    deletePost,
    updatePost,
    photo,
    singlePost,
    like,
    unlike,
    comment,
    uncomment
} = require('../../controllers/posts');

const  { requireSignin} = require('../../controllers/auth');
const  {userById} = require('../../controllers/user');
const {createPostValidator} = require('../../validator');
const router = express.Router();

router.get('/posts',getPosts);
router.put('/post/like',requireSignin,like);
router.put('/post/unlike',requireSignin,unlike);

router.put('/post/comment',requireSignin,comment);
router.put('/post/uncomment',requireSignin,uncomment);

router.post('/post/new/:userId', requireSignin,createPost,createPostValidator);
router.get('/post/by/:userId', requireSignin,postsByUser);
router.get('/post/:postById',singlePost);
router.delete('/post/:postById',requireSignin,isPoster,deletePost);
router.put('/post/:postById',requireSignin,isPoster,updatePost);
router.get('/post/photo/:postById', photo);


router.param("userId", userById);
router.param("postById", postByID);
module.exports = router;