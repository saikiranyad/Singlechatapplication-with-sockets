const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const { uploadimage } = require("../helpers/cloudinaryhelper")


const signup = async (req, res) => {
    try {
        const { name, email, password, gender } = req.body
        const file = req.file    
        const user = await User.findOne({ email })
        let avi = user?.avatar
        
        if (file) {
            let imagefileurl = await uploadimage(file.path)
            avi = imagefileurl?.imageurl
        }
        if (user) {
            return res.status(409).json({ success: false, message: "User already exists" })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt)
        const newuser = new User({
            name, email, password: hashedpassword, avatar: avi, gender
        })
        await newuser.save();
        return res.status(201).json({ success: true, message: "User is registered successfully", newuser })



    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false, message: "Internal Server Error in signup"
        })
    }
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "invalid credentials" })
        }
        const token = jwt.sign({ id: user._id, email: user.email, avatar: user.avatar, name: user.name, description: user.description }, 'SAIKIRAN', { expiresIn: '1d' })

        return res.cookie('token', token, { httpOnly: true, secure: true, sameSite: "none", maxAge: 30 * 60 * 1000 }).status(201).json({ success: true, message: "login successsfull", token, user })


    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false, message: "Internal Server Error in login"
        })
    }
}




const logout = async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId)
        return res.clearCookie('token').status(201).json({ success: true, message: "logout successfully", user })

    } catch (err) {
        console.log(err)
        returnres.status(500).json({
            success: false, message: "Internal Server Error in logout"
        })
    }
}




const updateacccount = async (req, res) => {
    try {
        const { name, description } = req.body
        const file = req.file
        const userId = req.user.id
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }
        let avi = user?.avatar
        if (file) {
            const imagefileurl = await uploadimage(file.path)
            avi = imagefileurl?.imageurl
        }
        const updateuserdetails = {
            name: name || user.name,
            avatar: avi || user.avatar,
            description: description || user.description,
        }
        const updateuser = await User.findByIdAndUpdate(userId, updateuserdetails, { new: true })
        return res.status(201).json({ success: true, message: "User updated successfully", updateuser })

    } catch (err) {
        console.log(err)
        returnres.status(500).json({
            success: false, message: "Internal Server Error in updateacccount"
        })
    }
}




const deleteacccount = async (req, res) => {
    try {
        const userId = req.user.id
        const deleteduser = await User.findByIdAndDelete(userId)
        return res.status(201).json({ success: true, message: "Account is deleted successfully", deleteduser })

    } catch (err) {
        console.log(err)
        returnres.status(500).json({
            success: false, message: "Internal Server Error in deleteacccount"
        })
    }
}






const getallusersexceptme = async (req, res) => {
    try {
        const userId = req.user.id
        const remainingusers = await User.find({_id:{$ne:userId}}).select("-password")
        return res.status(201).json({succes:true,message:'all users',remainingusers})

    } catch (err) {
        console.log(err)
        returnres.status(500).json({
            success: false, message: "Internal Server Error in getallusersexceptme"
        })
    }
}



const getme = async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId).select('-password')
        if(!user){
            return res.status(404).json({success:false,message:"user not found"})
        }
        return res.status(201).json({success:true,message:"it is me",user})

    } catch (err) {
        console.log(err)
        returnres.status(500).json({
            success: false, message: "Internal Server Error in getme"
        })
    }
}

module.exports = {
    signup,
    login,
    logout,
    updateacccount,
    deleteacccount,
    getallusersexceptme,
    getme
}