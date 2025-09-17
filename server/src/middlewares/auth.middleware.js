import jwt from 'jsonwebtoken'
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
// User
  try {
    // check of token exist
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({message: 'Unauthorized - No Token Provided'})
    }
    //
    // check token on verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    if (!decoded) return res.status(401).json({message: 'Unauthorized - Invalid Token'})

    // check of user exist
    const user = await User.findById(decoded.userId).select('-password'); /*select('-password') for security*/
    if (!user) return res.status(401).json({message: 'User not found'})

    req.user = user;
    next()
  } catch (e) {
    console.log('error auth middleware', e)
    return res.status(500).json({message: 'Internal Server error'})
  }
}
