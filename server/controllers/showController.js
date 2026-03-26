import axios from "axios";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";

// API TO GET NOW PLAYING MOVIES
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      }
    );
    res.status(200).json({ success: true, movies: data.results });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch movies" });
  }
};

// API TO ADD A NEW SHOW
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    if (!movieId || !showsInput || !showPrice) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if movie exists (Using String ID)
    let movie = await Movie.findById(String(movieId));

    if (!movie) {
      const [movieDetailsResponse, movieCreditResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
        }),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditResponse.data;

      movie = await Movie.create({
        _id: String(movieId), // Ensure it's a String
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast.slice(0, 10),
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      });
    }

    const showsToCreate = [];
    showsInput.forEach((show) => {
      const showDate = show.date; 
      show.time.forEach((t) => {
        // Handle both "HH:mm" and "HH:mm:ss"
        const timeStr = t.length === 5 ? `${t}:00` : t;
        const dateTimeString = `${showDate}T${timeStr}`; 
        const finalDate = new Date(dateTimeString);

        if (!isNaN(finalDate.getTime())) {
          showsToCreate.push({
            movie: String(movieId),
            showDateTime: finalDate,
            showPrice: Number(showPrice),
            occupiedSeats: {}, // Default empty object
          });
        }
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.status(201).json({ success: true, message: "Shows added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getShows = async (req, res) => {
  try {
    // 1. Aaj ki shuruat (Midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 2. Active shows dhoondhein
    const shows = await Show.find({
      showDateTime: { $gte: startOfToday },
    });

    console.log("Shows found in DB:", shows.length);

    if (shows.length === 0) {
      return res.json({ 
        success: true, 
        shows: [], 
        message: "No active shows found. Please add a show with a FUTURE date." 
      });
    }

    // 3. Unique Movie IDs nikal kar unki details fetch karein
    const movieIds = [...new Set(shows.map(s => s.movie))];
    const movies = await Movie.find({ _id: { $in: movieIds } });

    return res.json({
      success: true,
      count: movies.length,
      shows: movies,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API TO GET SINGLE MOVIE SHOWS
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const shows = await Show.find({
      movie: String(movieId),
      showDateTime: { $gte: startOfToday },
    }).sort({ showDateTime: 1 });

    const movie = await Movie.findById(String(movieId));
    
    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
        price: show.showPrice  // ✅ THIS MUST BE HERE
      });
    });

    return res.json({ success: true, movie, shows: dateTime });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};