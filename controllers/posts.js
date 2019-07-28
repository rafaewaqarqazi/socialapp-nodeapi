const Post  = require('../models/posts');
const formidable = require('formidable');
const fs = require('fs');

exports.postByID = (req,res,next, id) =>{
  Post.findById(id)
      .populate("postedBy", "_id name")
      .populate('comments.postedBy','_id name')
      .select('_id body title createdAt photo postedBy likes comments')
      .exec()
      .then(post => {
          req.post = post;
          next();
      })
      .catch(err => res.status(400).json({error:err}));

};

exports.getPosts = (req,res) => {
    Post.find()
        .populate('postedBy','_id name')
        .populate('comments','text created')
        .populate('comments.postedBy','_id name')
        .select("_id title body postedBy createdAt likes comments")
        .sort({createdAt: -1})
        .then(posts => {
            res.json(posts);

        })
        .catch(err => console.log(err));
};

exports.createPost = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files)=>{
        if (err){
            return res.status(400).json({error: "image could not be uploaded"})
        }
        let post = new Post(fields);
        post.postedBy = req.profile;
        if (files.photo){
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType=files.photo.type;
        }
        post.save()
            .then(result => {
               res.json({result});
            })
            .catch(err => {
                res.status(400).json({
                    error:err
                })
            });
    });
    const post = new Post(req.body);

    post.save()
        .then(result => {
            res.json({
                post:result
            })
        });

};

exports.postsByUser = (req, res) => {
    Post.find({postedBy: req.profile._id})
    .populate("postedBy","_id name")
        .populate('comments','text created')
        .populate('comments.postedBy','_id name')
        .select('_id body title createdAt photo postedBy likes comments')
        .sort("_createdAt")
        .exec()
        .then(posts=>res.json(posts))
        .catch(err=> res.status(400).json({error:err}));


};

exports.isPoster = (req, res, next) => {
    let sameUser = req.post && req.auth && req.post.postedBy._id == req.auth._id;
    let adminUser = req.post && req.auth && req.auth.role === "admin";
    let isPoster = sameUser || adminUser;
    if (!isPoster){
        return res.status(403).json({
            error: "User is not Authorized To Delete Post"
        })
    }
    next();
};

exports.deletePost = (req, res)=>{
    let post = req.post;
    post.remove()
        .then(post => res.json({message: "Post Deleted Successfully"}))
        .catch(err => res.status(400).json({error:err}))
};

exports.updatePost = (req, res, next) =>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files)=>{
        if (err){
            return res.status(400).json({
                error:'Photo Could not be Uploaded'
            })
        }
        let post = req.post;
        post.updated = Date.now();
        Object.assign(post,fields);
        if (files.photo){
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }

        post.save()
            .then(result=>{
                res.json(post);
            })
            .catch(err => res.status(400).json({error:err}))
    })
};
exports.photo = (req,res, next)=>{
    if (req.post.photo.data){
        res.set('Content-Type', req.post.photo.contentType);
        return res.send(req.post.photo.data)
    }
    next();
};
exports.singlePost = (req,res)=>{
    return  res.json(req.post);
};

exports.like = (req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,
        {$push:{likes:req.body.userId}},
        {new: true})
        .exec((err,result)=>{
            if (err){
                return res.status(400).json({error:err})
            }
            else {
                res.json(result);
            }
        })
};

exports.unlike = (req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,
        {$pull:{likes:req.body.userId}},
        {new: true})
        .exec((err,result)=>{
            if (err){
                return res.status(400).json({error:err})
            }
            else {
                res.json(result);
            }
        })
};

exports.comment = (req,res)=>{
    let comment = req.body.comment;
    comment.postedBy = req.body.userId;

    Post.findByIdAndUpdate(req.body.postId,
        {$push:{comments:comment}},
        {new: true})
        .populate('comments.postedBy' ,'_id name')
        .populate('postedBy','_id name')
        .exec((err,result)=>{
            if (err){
                return res.status(400).json({error:err})
            }
            else {
                res.json(result);
            }
        })
};
exports.uncomment = (req,res)=>{
    let comment = req.body.comment;


    Post.findByIdAndUpdate(req.body.postId,
        {$pull:{comments:{_id:comment._id}}},
        {new: true})
        .exec((err,result)=>{
            if (err){
                return res.status(400).json({error:err})
            }
            else {
                res.json(result);
            }
        })
};