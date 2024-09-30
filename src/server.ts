import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Server } from 'http';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerMap';

// Function to handle shutdown gracefully
const shutdown = async (signal: string, server: Server) => {
    console.log(`Received ${signal}. Closing HTTP server...`);
    server.close(async () => {
        console.log('HTTP server closed.');
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed.');
            process.exit(0);
        } catch (error) {
            console.error('Error closing MongoDB connection:', error);
            process.exit(1);
        }
    });
};

// Connect to MongoDB
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};

// Start the server
const startServer = async () => {
    await connectToMongoDB();

    const server = app.listen(PORT, () => {
        console.log(`Server is running on http://127.0.0.1:${PORT}`);
    });

    // Handle shutdown signals
    process.on('SIGINT', () => shutdown('SIGINT', server));
    process.on('SIGTERM', () => shutdown('SIGTERM', server));
};

startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

export default app;