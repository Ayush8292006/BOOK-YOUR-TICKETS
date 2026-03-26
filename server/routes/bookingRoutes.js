import express from "express";
import {
  createBooking,
  getOccupiedSeats,
  getUserBookings,
  cancelBooking,
} from "../controllers/BookingController.js";

import { requireAuth } from "@clerk/express";

const bookingRouter = express.Router();

bookingRouter.post("/create", requireAuth(), createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
bookingRouter.get("/user-bookings", requireAuth(), getUserBookings);
bookingRouter.delete("/cancel/:bookingId", requireAuth(), cancelBooking);

export default bookingRouter;