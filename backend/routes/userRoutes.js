const express = require('express')
const { signup, login, logout, updateacccount, deleteacccount, getallusersexceptme, getme } = require('../controllers/userController')
const authmiddleware = require('../middleware/authmiddleware')
const upload = require('../middleware/multer')


const userrouter = express.Router()

userrouter.post('/sign',upload.single('image'),signup)
userrouter.post('/login',login)
userrouter.post('/logout',authmiddleware,logout)
userrouter.put('/update',authmiddleware,upload.single('image'),updateacccount)
userrouter.delete('/deleteaccount',authmiddleware,deleteacccount)
userrouter.get('/getallusers',authmiddleware,getallusersexceptme)
userrouter.get('/get',authmiddleware,getme)

module.exports = userrouter