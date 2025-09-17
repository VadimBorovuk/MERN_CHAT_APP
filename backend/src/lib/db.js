import mongoose from "mongoose";

export const connectDB = async () => {
  try {
   const connect = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Mongo connected ${connect.connection.host}`)
  } catch (e) {
    console.log(`Mongo error ${e}`)

  }
}
