const express = require('express');
const  { requireSignin} = require('../../controllers/auth');
const  {
    userById,
    allUsers,
    getUser,
    updateUser,
    deleteUser,
    userPhoto,
    addFollowing,
    addFollower,
    removeFollowing,
    removeFollower,
    findPeople
} = require('../../controllers/user');

const router = express.Router();

router.get('/users', allUsers);
router.put('/users/follow',requireSignin,addFollowing, addFollower);
router.put('/users/unfollow',requireSignin,removeFollowing, removeFollower);
router.get('/users/:userId',requireSignin, getUser);
router.put('/users/:userId',requireSignin, updateUser);
router.delete('/users/:userId',requireSignin, deleteUser);
router.get('/users/photo/:userId', userPhoto);
router.get('/users/findpeople/:userId', requireSignin, findPeople)
router.param("userId", userById);
module.exports = router;