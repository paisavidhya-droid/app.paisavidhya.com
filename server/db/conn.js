// server\db\conn.js
import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const uri = process.env.MONGODB_URI;

        if (!uri) {
            throw new Error("MONGODB_URI is missing");
        }
        await mongoose.connect(uri)
        console.log(`------ ✓ Connection Successful -------`);

    } catch (error) {
        console.error("❌ Database Connection failed!", error);
        process.exit(1);
    }
}


export default connectDb;

// ✔ Preflight checks.
// ✔ Verifying framework. Found Vite.
// ✔ Validating Tailwind CSS config. Found v4.
// ✖ Validating import alias.