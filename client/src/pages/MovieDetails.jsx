import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import { HeartIcon, PlayCircleIcon, StarIcon, Clock, Calendar, Film } from "lucide-react";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { useAppContext } from "../context/AppContext";
import timeFormat from "../lib/timeFormat";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);

  const { shows, axios, favoriteMovies, toggleFavorite, image_base_url } = useAppContext();

  const getShow = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) setShow(data.data || data); // Ensure we get the actual show object
    } catch (error) {
      console.error(error);
    }
  }, [id, axios]);

  useEffect(() => {
    getShow();
    window.scrollTo(0, 0);
  }, [getShow]);

  if (!show || !show.movie) return <Loading />; // Wait until show and movie exist

  const movie = show.movie;
  const isFavorite = favoriteMovies?.some((m) => m._id === movie._id) || false;

  return (
    <div className="px-6 md:px-16 lg:px-40 pt-20 md:pt-32 pb-20 bg-black text-white min-h-screen">
      {/* --- HERO SECTION --- */}
      <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto relative">
        <BlurCircle top="-50px" left="-50px" opacity="0.4" />

        {/* Left Column: Poster & Rating */}
        <div className="flex flex-col items-center lg:items-start gap-4 shrink-0">
          <img
            src={movie.poster_path ? image_base_url + movie.poster_path : "/default-poster.png"}
            alt={movie.title || "Movie Poster"}
            className="rounded-2xl shadow-2xl w-full max-w-[320px] object-cover border border-white/10"
          />
          <div className="flex flex-col items-center lg:items-start mt-2">
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">User Rating</p>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(movie.vote_average / 2) ? "fill-primary text-primary" : "text-gray-600"
                  }`}
                />
              ))}
              <span className="ml-2 font-bold text-lg">{movie.vote_average?.toFixed(1) || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 flex-1">
          <div>
            <p className="text-primary font-medium tracking-wide mb-2">ENGLISH</p>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">{movie.title || "Untitled"}</h1>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm">
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Clock className="w-4 h-4 text-primary" /> {movie.runtime ? timeFormat(movie.runtime) : "N/A"}
            </span>
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Film className="w-4 h-4 text-primary" /> {movie.genres?.[0]?.name || "N/A"}
            </span>
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Calendar className="w-4 h-4 text-primary" /> {movie.release_date?.split("-")?.[0] || "N/A"}
            </span>
          </div>

          <p className="text-gray-400 leading-relaxed max-w-2xl text-base italic">
            "{movie.overview || "No overview available."}"
          </p>

          {/* Cast */}
          <div className="mt-4">
            <h3 className="text-white font-semibold mb-4 text-lg">Leading Cast</h3>
            <div className="flex gap-5 overflow-x-auto no-scrollbar pb-2">
              {movie.casts?.slice(0, 6).map((cast, index) => (
                <div key={index} className="flex flex-col items-center min-w-[80px]">
                  <img
                    src={cast.profile_path ? image_base_url + cast.profile_path : '/default-avatar.png'}
                    alt={cast.name || "Cast"}
                    className="rounded-full w-14 h-14 object-cover border-2 border-primary/20 p-0.5"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 text-center line-clamp-1 w-full">{cast.name || "Unknown"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6">
            <a
              href="#dateSelect"
              className="bg-primary hover:bg-primary/90 text-black px-10 py-4 rounded-xl font-bold transition transform active:scale-95 shadow-lg shadow-primary/20"
            >
              Buy Tickets
            </a>
            <button className="flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 transition rounded-xl font-medium border border-white/10">
              <PlayCircleIcon className="w-5 h-5" /> Watch Trailer
            </button>
            <button
              onClick={() => toggleFavorite(movie._id)}
              className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition"
            >
              <HeartIcon className={`w-6 h-6 ${isFavorite ? "fill-primary text-primary" : "text-white"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div id="dateSelect" className="mt-24 pt-10 border-t border-white/5">
        <h2 className="text-2xl font-semibold mb-8 text-center lg:text-left">Plan Your Visit</h2>
        <DateSelect dateTime={show.shows || []} id={id} />
      </div>

      {/* Recommendations */}
      <div className="mt-24">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-semibold">You May Also Like</h2>
          <button className="text-primary text-sm font-medium hover:underline">Show all</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {shows?.slice(0, 4).map((movie, index) => (
            <MovieCard key={index} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;