import React from 'react';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';
import { useAppContext } from '../context/AppContext';
import { Ticket, Loader2 } from 'lucide-react';

const Movies = () => {
  const { shows } = useAppContext();

  if (!shows) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500 tracking-[0.3em] uppercase text-[10px] font-black">Initializing Theater...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-48 pb-24 px-6 md:px-16 lg:px-32 relative overflow-hidden">
      
      {/* --- 1. MINIMALIST AMBIENCE --- */}
      <BlurCircle top='-10%' left='-5%' color="bg-primary" opacity="opacity-10" />
      <BlurCircle bottom='10%' right='-10%' color="bg-blue-600" opacity="opacity-10" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.05)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* --- 2. CLEAN EDITORIAL HEADER --- */}
        <div className="mb-20 border-l-2 border-primary pl-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-primary text-[10px] font-black tracking-[0.4em] uppercase">
              Now Available
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none uppercase italic">
            Current <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/20">Lineup</span>
          </h1>
          
          <p className="mt-6 text-gray-500 font-bold text-sm tracking-widest uppercase">
            Showing {shows.length} curated experiences in Greater Noida
          </p>
        </div>

        {/* --- 3. CINEMATIC GRID --- */}
        {shows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-10 gap-y-20">
            {shows.map((movie, index) => (
              <div 
                key={movie._id} 
                className="relative group"
              >
                {/* Visual Rank (Ghosted Number) */}
                <div className="absolute -top-10 -left-6 text-[100px] font-black text-white/[0.02] pointer-events-none group-hover:text-primary/5 transition-colors duration-500">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </div>

                {/* Card Container with Functional Hover */}
                <div className="transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-4 group-hover:scale-[1.02]">
                  
                  {/* Neon Glow on Hover */}
                  <div className="absolute -inset-4 bg-primary/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none" />
                  
                  <MovieCard movie={movie} />

                  {/* Functional Status Indicator */}
                  <div className="mt-4 flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-primary transition-colors">
                      Book Seat
                    </span>
                    <Ticket className="w-4 h-4 text-gray-700 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-40 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center animate-spin-slow">
               <Ticket className="text-white/10 w-6 h-6" />
            </div>
            <p className="text-gray-600 tracking-[0.5em] uppercase text-[10px]">No screenings scheduled</p>
          </div>
        )}

      </div>

      {/* --- 4. NAVIGATION UTILITY --- */}
      <div className="fixed bottom-10 right-10 z-50">
         <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-110 active:scale-95"
         >
            <Ticket className="w-6 h-6" />
         </button>
      </div>

    </div>
  );
};

export default Movies;