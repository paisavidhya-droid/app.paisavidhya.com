
import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log(`------ ✓ Connection Successful -------`);

    } catch (error) {
        console.error("❌ Database Connection failed!",error);
        process.exit(0);
    }
}


export default connectDb;