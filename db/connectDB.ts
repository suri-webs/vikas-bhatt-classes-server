import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error("Please define the DATABASE_URL environment variable inside .env.local");
}

// TypeScript ke liye global type declare karna zaroori hai
declare global {
    var mongoose: {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Mongoose> | null;
    };
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(DATABASE_URL!, opts).then((mongoose) => {
            return mongoose;
        }).catch((err) => {
            cached.promise = null;
            throw err;
        });
    }

    try {
        cached.conn = (await cached.promise).connection;
    } catch (err) {
        throw err;
    }

    return cached.conn;
}

export default connectDB;