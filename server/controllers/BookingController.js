import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

// ✅ CHECK SEAT AVAILABILITY
const checkSeatAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;
    const occupiedSeats = showData.occupiedSeats || [];
    return !selectedSeats.some(seat => occupiedSeats.includes(seat));
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

// ✅ CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    const userId = req.auth().userId;
    
    if (!seats || seats.length === 0) {
      return res.json({ success: false, message: "No seats selected" });
    }
    
    const isAvailable = await checkSeatAvailability(showId, seats);
    
    if (!isAvailable) {
      return res.json({ success: false, message: "Seats already booked" });
    }
    
    const showData = await Show.findById(showId).populate("movie");
    const amount = Number(showData.showPrice) * seats.length;
    
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount,
      bookedSeats: seats,
      isPaid: false,
    });
    
    res.json({ 
      success: true, 
      message: "Booking created", 
      bookingId: booking._id,
      amount: booking.amount
    });
    
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ GET SINGLE BOOKING (For payment page)
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie" }
      });
    
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }
    
    res.json({ success: true, booking });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ MOCK PAYMENT - No Gateway Required!
export const mockPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }
    
    if (booking.isPaid) {
      return res.json({ success: false, message: "Already paid" });
    }
    
    // Mark as paid
    booking.isPaid = true;
    await booking.save();
    
    // Update occupied seats in Show
    const show = await Show.findById(booking.show);
    if (show) {
      const currentOccupied = show.occupiedSeats || [];
      show.occupiedSeats = [...currentOccupied, ...booking.bookedSeats];
      await show.save();
    }
    
    res.json({ success: true, message: "Payment successful!" });
    
  } catch (error) {
    console.error("Mock payment error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ GET OCCUPIED SEATS
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);
    const occupiedSeats = showData?.occupiedSeats || [];
    res.json({ success: true, occupiedSeats });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ GET USER BOOKINGS
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "show",
        populate: { path: "movie" },
      })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ CANCEL BOOKING
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.auth().userId;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }
    
    if (booking.user !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }
    
    if (booking.isPaid) {
      const showId = booking.show;
      const seats = booking.bookedSeats;
      
      await Show.findByIdAndUpdate(showId, {
        $pull: { occupiedSeats: { $in: seats } }
      });
    }
    
    await Booking.findByIdAndDelete(bookingId);
    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.json({ success: false, message: error.message });
  }
};