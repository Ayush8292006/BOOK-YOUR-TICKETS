import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
// ❌ Remove: import stripeRouter from './routes/stripeRoutes.js';

const app = express();
const port = 3000;

await connectDB();

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'https://cinebook-livid.vercel.app'],
  credentials: true
}));

app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('Server is Live!'));

// API Routes
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
// ❌ Remove: app.use('/api/stripe', stripeRouter);

app.listen(port, () => {
  console.log(`✅ Server listening at http://localhost:${port}`);
});