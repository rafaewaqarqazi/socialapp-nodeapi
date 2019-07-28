
const User = require('../models/users');
const formidable = require('formidable');
const fs = require('fs');

exports.userById=(req,res,next,id)=>{
    User.findById(id).select("name created email updated photo about")
        .populate('following','_id name')
        .populate('followers','_id name')
        .exec((err, user)=> {
        if (err || !user){
            return res.status(400).json({
                error:"User not found"
            })
        }

        req.profile = user;
        next();
    })
};

exports.hasAuthorization = (req, res, next) =>{
    const authorized = req.profile && req.auth && req.profile._id === req.auth._id;
    if (!authorized){
        res.status(403).json({error:'user is not authorized'});
    }

};

exports.allUsers = (req,res)=>{
    User.find().select("name email updated created")
        .then(users => {
            res.json(users);
        })
        .catch(err => res.status(400).json({err}));
};

exports.getUser = (req,res)=>{
    return res.json(req.profile);
};

exports.updateUser = (req, res, next) =>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files)=>{
        if (err){
            return res.status(400).json({
                error:'Photo Could not be Uploaded'
            })
        }
        let user = req.profile;
        user.updated = Date.now();
        Object.assign(user,fields);
        if (files.photo){
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }

        user.save()
            .then(result=>{
                res.json(user);
            })
            .catch(err => res.status(400).json({error:err}))
    })
};

exports.userPhoto = (req, res, next)=>{

    if (req.profile.photo.data){
        res.set('Content-Type', req.profile.photo.contentType);
        return res.send(req.profile.photo.data)
    }
    next();
};

exports.deleteUser = (req, res) => {
    let user = req.profile;
    user.remove()
        .then(user => res.json({message: "User Deleted Successfully"}))
        .catch(err => res.status(400).json({error:err}));
};

exports.addFollowing = (req, res, next)=>{
    User.findByIdAndUpdate(req.body.userId, {$push: {following:req.body.followId}})
        .then(result=>{
            next();
        })
        .catch(err=> res.status(400).json({error:err}));
};

exports.addFollower = (req, res, next)=>{
    User.findByIdAndUpdate(req.body.followId,
        {$push: {followers:req.body.userId}},
        {new:true})
        .populate('following','_id name')
        .populate('followers','_id name')
        .exec((err,result)=>{
            if (err){
                return res.status(400).json({error:err})
            }
            res.json(result);
        });

};


exports.removeFollowing = (req, res, next)=>{
    User.findByIdAndUpdate(req.body.userId, {$pull: {following:req.body.unfollowId}})
        .then(result=>{
            next();
        })
        .catch(err=> res.status(400).json({error:err}));
};

exports.removeFollower = (req, res, next)=>{
    User.findByIdAndUpdate(req.body.unfollowId,
        {$pull: {followers:req.body.userId}},
        {new:true}
        )
        .populate('following','_id name')
        .populate('followers','_id name')
        .exec((err,result)=>{
            if (err){
                return res.status(400).json({error:err})
            }
            res.json(result);
        });

};

exports.findPeople = (req, res)=>{
    let following = req.profile.following;
    following.push(req.profile._id);
    User.find({_id: {$nin: following}})
        .select('name')
        .then(users =>{
            res.json(users)
        })
        .catch(err => res.status(400).json({error:err}))
};