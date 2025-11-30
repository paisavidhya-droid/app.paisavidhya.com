// db/conn.js
import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('------ ✓ BSE DB Connection Successful -------');
  } catch (error) {
    console.error('❌ BSE Database Connection failed!', error);
    process.exit(1);
  }
};

export default connectDb;
