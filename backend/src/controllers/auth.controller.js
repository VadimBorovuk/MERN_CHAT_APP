import User from "../models/user.model.js";
import bcript from 'bcryptjs'
import {generateToken} from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signUp = async (req, res) => {
  const {
    email,
    fullName,
    password
  } = req.body;
  try {

    if (!fullName || !email || !password) return res.status(400).json({message: 'All fields are required'})
    // hash passwords
    if (password.length < 6) {
      return res.status(400).json({message: 'Pass must be at least 6 characters'})
    }
    const user = await User.findOne({email})
    if (user) return res.status(400).json({message: 'Email already exists'})

    const salt = await bcript.genSalt(10);
    const hashedPass = await bcript.hash(password, salt)

    // create new User
    const newUser = new User({
      fullName,
      email,
      password: hashedPass
    })

    if (newUser) {
      // generate jwt token
      generateToken(newUser._id, res)
      await newUser.save();

      return res.status(200).json({newUser})
    } else {
      return res.status(400).json({message: 'Invalid user data'})
    }
  } catch (e) {
    console.log('err catch', e)
    return res.status(500).json({message: 'Internal Server error'})
  }
}

export const login = async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await User.findOne({email})

    if (!user) res.status(400).json({message: 'Invalid credentials'})

    const isPassCorrect = await bcript.compare(password, user.password);

    if (!isPassCorrect) res.status(400).json({message: 'Invalid credentials'})

    generateToken(user._id, res)

    return res.status(200).json({user})
  } catch (e) {
    console.log('err catch', e)
    return res.status(500).json({message: 'Internal Server error'})
  }
}

export const logout = (req, res) => {
  try {
    res.cookie('jwt', "", {maxAge: 0})
    res.status(200).json({message: 'Logged successfully'})
  } catch (e) {
    console.log('err catch from logged', e)
    return res.status(500).json({message: 'Internal Server error'})
  }
}

export const updateProfile = async (req, res) => {
  try {
    const {profilePic} = req.body;
    const userId = req.user._id;

    if (!profilePic) res.status(400).json({message: 'Profile pic is required'});

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {
      new: true
    });
    res.status(200).json(updatedUser)
  } catch (e) {
    console.log('err catch updated profile', e)
    return res.status(500).json({message: 'Internal Server error'})
  }
}

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user)
  } catch (e) {
    console.log('err catch check auth', e)
    return res.status(500).json({message: 'Internal Server error 1'})
  }
}
