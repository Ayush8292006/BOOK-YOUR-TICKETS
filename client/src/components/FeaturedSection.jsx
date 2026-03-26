import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle'
import MovieCard from './MovieCard'
import { useAppContext } from '../context/AppContext'

const FeaturedSection = () => {
  const navigate = useNavigate()
  const { shows } = useAppContext()

  return (
    <div className='relative px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
      
      {/* Background Decorative Blur */}
      <BlurCircle top='-10%' right='-5%' color="bg-primary" opacity="opacity-10" />

      {/* Header Area */}
      <div className='flex items-end justify-between mb-12 relative z-10'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]'>
            <Sparkles className='w-3 h-3' /> Exclusive
          </div>
          <h2 className='text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white/90'>
            Now <span className='text-primary/80'>Showing</span>
          </h2>
        </div>

        <button
          onClick={() => navigate('/movies')}
          className='group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-colors cursor-pointer border-b border-transparent hover:border-primary pb-1'
        >
          View All
          <ArrowRight className='group-hover:translate-x-1 transition-transform w-3.5 h-3.5' />
        </button>
      </div>

      {/* 🎬 Responsive Grid - 4 Columns on Large Screens */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
        {shows.slice(0, 4).map((show) => (
          <div key={show._id} className='flex justify-center'>
            <MovieCard movie={show} />
          </div>
        ))}
      </div>

      {/* Footer Action */}
      <div className='flex flex-col items-center justify-center mt-20 gap-4'>
        <div className='w-px h-12 bg-gradient-to-b from-primary/50 to-transparent' />
        
        <button
          onClick={() => { navigate('/movies'); window.scrollTo(0, 0) }}
          className='relative group overflow-hidden px-12 py-4 bg-white/[0.03] border border-white/10 hover:border-primary/50 transition-all rounded-2xl cursor-pointer'
        >
          {/* Subtle button glow on hover */}
          <div className='absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity' />
          
          <span className='relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-white group-hover:text-primary transition-colors'>
            Explore More Content
          </span>
        </button>
      </div>

    </div>
  )
}

export default FeaturedSection