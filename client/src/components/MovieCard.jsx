import React, { useState, useEffect } from 'react';
import { Star, Heart, Ticket } from 'lucide-react'; // Play icon removed from imports
import { useNavigate } from 'react-router-dom';
import timeFormat from '../lib/timeFormat';
import { useAppContext } from '../context/AppContext';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { image_base_url, toggleFavorite, favoriteMovies } = useAppContext();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!favoriteMovies) return;
    const exists = favoriteMovies.some((m) => m._id === movie._id);
    setIsFavorite(exists);
  }, [favoriteMovies, movie._id]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
    toggleFavorite(movie._id);
  };

  const handleNavigate = () => {
    navigate(`/movies/${movie._id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className='group relative flex flex-col bg-[#0a0a0a] border border-white/5 rounded-[2.2rem] overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] cursor-pointer h-full'>
      
      {/* 🎬 Image Wrapper with Zoom Effect */}
      <div className='relative overflow-hidden aspect-[2/3] w-full'>
        
        {/* ❤️ Glass Heart Icon */}
        <button
          onClick={handleToggle}
          className='absolute top-4 right-4 z-30 p-2.5 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-primary transition-all active:scale-90 group/heart shadow-xl'
        >
          <Heart
            className={`w-4 h-4 transition-all duration-500 ${
              isFavorite 
                ? 'fill-white text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                : 'text-white/60 group-hover/heart:text-black'
            }`}
          />
        </button>

        {/* Rating Badge (Top Left) */}
        <div className='absolute top-4 left-4 z-30 px-3 py-1.5 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl flex items-center gap-1.5 shadow-lg'>
          <Star className='w-3 h-3 text-primary fill-primary' />
          <span className='text-[10px] font-black text-white italic'>{movie.vote_average?.toFixed(1)}</span>
        </div>

        {/* The Image */}
        <img
          onClick={handleNavigate}
          src={image_base_url + movie.poster_path}
          className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-[20%] group-hover:grayscale-0'
          alt={movie.title}
        />

        {/* Dark Fade bottom */}
        <div className='absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90' />
      </div>

      {/* 📄 Content Area */}
      <div className='p-5 pt-2 flex flex-col flex-grow relative z-10'>
        
        {/* Genre & Year Row */}
        <div className='flex items-center gap-2 text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2'>
          <span className='text-primary/80'>{movie.genres?.[0]?.name || 'Action'}</span>
          <span className='w-1 h-1 rounded-full bg-white/10' />
          <span>{new Date(movie.release_date).getFullYear()}</span>
        </div>

        {/* Title */}
        <h3 className='font-black text-md md:text-lg text-white/90 leading-tight mb-4 tracking-tight group-hover:text-primary transition-colors line-clamp-1'>
          {movie.title}
        </h3>

        {/* 🎫 Action Button */}
        <button
          onClick={handleNavigate}
          className='mt-auto w-full py-3.5 bg-white/[0.02] hover:bg-primary border border-white/5 hover:border-primary text-white hover:text-black rounded-2xl font-black text-[9px] tracking-[0.25em] uppercase transition-all duration-500 flex items-center justify-center gap-2 group/btn'
        >
          <Ticket className='w-3.5 h-3.5 transition-transform group-hover/btn:-rotate-12' />
          Quick Book
        </button>
      </div>

    </div>
  );
};

export default MovieCard;