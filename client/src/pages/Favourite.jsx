import React, { useEffect, useState } from 'react';
import BlurCircle from "../components/BlurCircle";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { HeartOff } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import toast from 'react-hot-toast';

const Favorite = () => {
  const { favoriteMovies, fetchFavoriteMovies, user } = useAppContext();
  const [loading, setLoading] = useState(true);

  // Load favorite movies when component mounts or user changes
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) await fetchFavoriteMovies();
      setLoading(false);
      
    };
    loadFavorites();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-screen px-6 md:px-16 lg:px-36 pt-48 pb-20">
      {/* Background blur circles */}
      <BlurCircle top="100px" left="-50px" size="300px" />
      <BlurCircle bottom="50px" right="-50px" size="300px" />

      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center text-white">
        Your Favorite Movies
      </h1>

      {favoriteMovies && favoriteMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {favoriteMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-20 space-y-6 text-center">
          <div className="bg-gray-800/50 p-8 rounded-full">
            <HeartOff className="w-16 h-16 text-gray-600 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold text-white">
              No favorites yet!
            </h2>
            <p className="text-gray-400 max-w-sm mx-auto">
              Explore our collection and tap the heart icon on movies you love.
              They'll show up right here!
            </p>
          </div>

          <button
            onClick={() => window.location.href = '/movies'}
            className="mt-4 px-8 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-medium"
          >
            Browse Movies
          </button>
        </div>
      )}
    </div>
  );
};

export default Favorite;