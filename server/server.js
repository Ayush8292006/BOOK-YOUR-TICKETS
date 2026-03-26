import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

// Database connection (don't await at top level for Vercel)
const startDB = async () => {
    try {
        await connectDB();
        console.log('✅ Database connected');
    } catch (error) {
        console.error('❌ Database error:', error.message);
    }
};
startDB();

app.use(express.json());

app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://cinebook-livid.vercel.app'],
    credentials: true
}));

app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('Server is Live!'));

// API Routes
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// ✅ For Vercel - export app
export default app;

// ✅ For local development only
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`✅ Server listening at http://localhost:${port}`);
    });
}