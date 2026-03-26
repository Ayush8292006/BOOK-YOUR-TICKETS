import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Database connected");
        return true;
    } catch (error) {
        console.log("❌ Database connection error:", error.message);
        return false;
    }
}

export default connectDB;