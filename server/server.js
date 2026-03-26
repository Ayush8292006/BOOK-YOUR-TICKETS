import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import { stripeWebHooks } from './controllers/stripeWebHooks.js';

const app = express();
const port = 3000;

await connectDB();

// ✅ WEBHOOK MUST BE BEFORE express.json()
app.use('/api/stripe', express.raw({ type: 'application/json' }), stripeWebHooks);

// ✅ This should come AFTER webhook route
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get('/', (req, res) => res.send('Server is Live!'));

// API Routes
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

app.listen(port, () => {
  console.log(`✅ Server listening at http://localhost:${port}`);
});