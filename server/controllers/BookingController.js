import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Stripe from "stripe";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const { origin } = req.headers;

    if (!seats || seats.length === 0) {
      return res.json({ success: false, message: "No seats selected" });
    }

    const isAvailable = await checkSeatAvailability(showId, seats);

    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Seats already booked",
      });
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

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: showData.movie.title,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/my-bookings?success=true`,
      cancel_url: `${origin}/my-bookings?canceled=true`,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });

    booking.paymentLink = session.url;
    await booking.save();

    res.json({ success: true, url: session.url });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ GET OCCUPIED SEATS
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    const showData = await Show.findById(showId);

    const occupiedSeats = showData.occupiedSeats || [];

    res.json({ success: true, occupiedSeats });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
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

    res.json({
      success: true,
      bookings,
    });

  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
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