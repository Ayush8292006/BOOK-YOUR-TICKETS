import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, TicketPlus, XIcon, Heart } from 'lucide-react'
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()
  const location = useLocation()

  // Scroll Listener for Dynamic Header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'Theatres', path: '/theatres' },
    { name: 'Favorites', path: '/favorite' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 z-[100] w-full transition-all duration-500 ease-in-out ${
        isScrolled 
        ? 'py-3 bg-black/60 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
        : 'py-7 bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 lg:px-24 flex items-center justify-between">
          
          {/* 🎥 Logo Section */}
          <Link to='/' className='relative group z-[110]'>
            <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src={assets.logo} 
              alt='CineBook' 
              className='relative w-32 md:w-44 h-auto transition-transform duration-500 group-hover:scale-[1.02]' 
            />
          </Link>

          {/* 🧭 Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10 bg-white/[0.03] border border-white/5 px-8 py-2.5 rounded-full backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link 
                  key={link.name}
                  to={link.path}
                  className={`relative text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 ${
                    isActive ? 'text-primary' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary rounded-full shadow-[0_0_10px_#14b8a6]" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* ⚡ Action Hub */}
          <div className='flex items-center gap-4 md:gap-7'>
            { !user ? ( 
              <button 
                onClick={openSignIn} 
                className='hidden sm:block px-8 py-2.5 rounded-full bg-primary text-black font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:-translate-y-0.5 transition-all active:scale-95'
              >
                Join Now
              </button> 
            ) : (
              <div className='flex items-center gap-3 pl-4 border-l border-white/10'>
                <UserButton afterSignOutUrl="/">
                  <UserButton.MenuItems>
                    <UserButton.Action 
                      label='My Bookings' 
                      labelIcon={<TicketPlus className="w-4 h-4 text-primary" />} 
                      onClick={() => navigate('/my-bookings')} 
                    />
                    <UserButton.Action 
                      label='Favorites' 
                      labelIcon={<Heart className="w-4 h-4 text-red-500" />} 
                      onClick={() => navigate('/favorite')} 
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            )}

            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2 bg-white/5 rounded-lg border border-white/10"
              onClick={() => setIsOpen(true)}
            >
              <MenuIcon className='w-6 h-6 text-white' />
            </button>
          </div>
        </div>
      </nav>

      {/* 📱 Fullscreen Mobile Overlay */}
      <div className={`fixed inset-0 z-[150] bg-black transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen ? 'clip-path-circle-open pointer-events-auto' : 'clip-path-circle-close pointer-events-none'
      }`}>
        <div className="h-full flex flex-col items-center justify-center gap-8">
          <XIcon 
            className='absolute top-10 right-10 w-10 h-10 text-gray-500 hover:text-white cursor-pointer transition-transform hover:rotate-90' 
            onClick={() => setIsOpen(false)} 
          />
          
          {navLinks.map((link, i) => (
            <Link 
              key={i}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-4xl font-black uppercase tracking-tighter italic hover:text-primary transition-colors duration-300"
            >
              {link.name}
            </Link>
          ))}

          {!user && (
            <button onClick={openSignIn} className="mt-10 text-primary font-bold tracking-widest uppercase border-b-2 border-primary pb-2">
              Sign In to CineBook
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .clip-path-circle-open { clip-path: circle(150% at 100% 0); }
        .clip-path-circle-close { clip-path: circle(0% at 100% 0); }
      `}</style>
    </>
  )
}

export default Navbar