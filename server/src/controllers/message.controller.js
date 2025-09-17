import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import {getReceiverSocketId} from "../lib/socket.js";
import {io} from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select('-password')

    res.status(200).send(filteredUsers)
  } catch (e) {
    console.log('err catch users sidebar', e)
    return res.status(500).json({message: 'Internal Server error'})
  }
}
export const getMessages = async (req, res) => {
  try {
    const {id: userToChatId} = req.params;
    const myCurrentId = req.user._id;

    const messages = await Message.find({
      $or: [
        {senderId: myCurrentId, receiverId: userToChatId},
        {senderId: userToChatId, receiverId: myCurrentId}
      ]
    })

    res.status(200).send(messages)
  } catch (e) {
    console.log('err catch getMessages', e)
    return res.status(500).json({message: 'Internal Server error'})
  }
}

export const sendMessage = async (req, res) => {
  try {
    const {id: receiverId} = req.params;
    const {text, image} = req.body;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl
    })

    await newMessage.save();

    // logic for socket.io sending messages
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage)
    }

    res.status(200).send(newMessage)
  } catch (e) {
    console.log('err catch send Message', e)
    return res.status(500).json({message: 'Internal Server error'})
  }
}
