import Booking from "../models/Booking.js"
import Show from "../models/Show.js"
import User from "../models/User.js"

// api to check if user is admin
export const isAdmin = async (req, res) => {
    res.json({ success: true, isAdmin: true })
}

// api to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({ isPaid: true })
        const activeShows = await Show.find({
            showDateTime: { $gte: new Date() }
        }).populate('movie')

        const totalUser = await User.countDocuments()

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, b) => acc + b.amount, 0),
            activeShows,
            totalUser
        }

        res.json({ success: true, dashboardData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export const getAllShows = async (req, res) => {
    try {
        //  Start of today (midnight)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        //  Fetch shows
        const shows = await Show.find({
            showDateTime: { $gte: startOfToday }
        })
        .populate('movie')   // 🔥 important
        .sort({ showDateTime: 1 });

        //  Debug
        console.log("Total shows:", shows.length);

        //  If no shows
        if (shows.length === 0) {
            return res.json({
                success: true,
                shows: [],
                message: "No shows available"
            });
        }

        //  Response
        res.json({
            success: true,
            count: shows.length,
            shows
        });

    } catch (error) {
        console.log("Error in getAllShows:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// api to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user')
            .populate({
                path: "show",
                populate: { path: "movie" }
            })
            .sort({ createdAt: -1 })

        res.json({ success: true, bookings })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}