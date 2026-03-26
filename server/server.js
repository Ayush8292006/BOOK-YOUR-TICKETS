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

// ✅ Connect to database (without blocking)
connectDB();

app.use(express.json());

app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://cinebook-livid.vercel.app'],
    credentials: true
}));

app.use(clerkMiddleware());

app.get('/', (req, res) => res.json({ success: true, message: 'Server is Live!' }));
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

// API Routes
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// ✅ Export for Vercel
export default app;