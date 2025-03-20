import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log(`db: DB connected`);
  } catch (error) {
    console.log(`db: `, (error as Error).message);
    process.exit(1);
  }
}
