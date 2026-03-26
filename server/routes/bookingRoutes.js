import express from "express";
import {
  createBooking,
  getOccupiedSeats,
  getUserBookings,
  cancelBooking,
  mockPayment,
  getBookingById
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", createBooking);
bookingRouter.get("/seats/:showId", getOccupiedSeats);
bookingRouter.get("/user-bookings", getUserBookings);
bookingRouter.delete("/cancel/:bookingId", cancelBooking);
bookingRouter.post("/mock-payment/:bookingId", mockPayment);  // ✅ Mock payment
bookingRouter.get("/:bookingId", getBookingById);              // ✅ Get single booking

export default bookingRouter;