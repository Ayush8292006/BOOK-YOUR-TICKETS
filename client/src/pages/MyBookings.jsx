import React, { useEffect, useState } from 'react';
import Loading from '../components/Loading';
import BlurCircle from '../components/BlurCircle';
import timeFormat from '../lib/timeFormat';
import { dateFormat } from '../lib/dateFormate';
import { useAppContext } from '../context/AppContext';
import { Calendar, Clock, CreditCard, Ticket, X, CheckCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const { axios, user, image_base_url, getToken } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY;
  const location = useLocation();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch bookings from backend
  const getMyBookings = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await axios.get('/api/booking/user-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setBookings(data.bookings);
        console.log("Bookings loaded:", data.bookings);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Show ticket modal
  const handleShowTicket = (booking) => {
    setSelectedTicket(booking);
    setShowModal(true);
  };

  // Load bookings on user login
  useEffect(() => {
    if (user) getMyBookings();
  }, [user]);

  // Refresh bookings after Stripe redirect
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const success = queryParams.get('success');
    const canceled = queryParams.get('canceled');

    if (success === 'true') {
      toast.success("Payment Successful! Your seats are confirmed.");
      navigate('/my-bookings', { replace: true });
      getMyBookings();
    } else if (canceled === 'true') {
      toast.error("Payment cancelled. No seats were booked.");
      navigate('/my-bookings', { replace: true });
    }
  }, [location, user]);

  if (isLoading) return <Loading />;

  return (
    <div className='relative px-6 md:px-16 lg:px-40 pt-32 pb-20 min-h-screen bg-[#020202] text-white selection:bg-primary/30'>
      <BlurCircle top='5%' left='-2%' color="bg-primary" opacity="opacity-10" />
      <div className='max-w-4xl mx-auto relative z-10'>
        <header className='flex items-center gap-4 mb-12 group'>
          <div className='h-8 w-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)] group-hover:h-10 transition-all duration-500' />
          <h1 className='text-2xl md:text-3xl font-black uppercase tracking-[0.2em] italic text-white/90'>
            Vault <span className='text-primary/80'>Bookings</span>
          </h1>
        </header>

        <div className='grid gap-6'>
          {bookings.length > 0 ? bookings.map((item, index) => (
            <div
              key={item._id || index}
              className='group relative flex flex-col md:flex-row bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden hover:bg-white/[0.03] hover:border-primary/20 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-500'
            >
              {/* Poster Section */}
              <div className='relative md:w-48 shrink-0 overflow-hidden'>
                <img
                  src={item.show?.movie?.poster_path ? image_base_url + item.show.movie.poster_path : '/placeholder.jpg'}
                  alt={item.show?.movie?.title}
                  className='w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent' />
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest backdrop-blur-xl border shadow-lg ${
                  item.isPaid 
                    ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                    : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                }`}>
                  {item.isPaid ? 'Confirmed ✓' : 'Pending Payment'}
                </div>
              </div>

              {/* Info Section */}
              <div className='flex-1 flex flex-col p-6 relative z-10'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h2 className='text-xl font-black uppercase tracking-tight text-white/90 group-hover:text-primary transition-colors duration-300'>
                      {item.show?.movie?.title || "Unknown Movie"}
                    </h2>
                    <div className='flex items-center gap-4 mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest'>
                      <span className='flex items-center gap-1.5'>
                        <Clock className='w-3.5 h-3.5 text-primary/60' /> 
                        {item.show?.movie?.runtime ? timeFormat(item.show.movie.runtime) : 'N/A'}
                      </span>
                      <span className='flex items-center gap-1.5'>
                        <Calendar className='w-3.5 h-3.5 text-primary/60' /> 
                        {item.show?.showDateTime ? dateFormat(item.show.showDateTime) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className='text-right'>
                    <p className='text-2xl font-black text-white tracking-tighter'>
                      {currency}{item.amount}
                    </p>
                    <p className='text-[9px] font-bold text-gray-600 uppercase mt-1 tracking-[0.2em]'>
                      {item.isPaid ? 'Confirmed' : 'Awaiting Payment'}
                    </p>
                  </div>
                </div>

                {/* Tickets & Action Buttons */}
                <div className='mt-auto pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4'>
                  <div className='flex gap-8'>
                    <div className='group/label'>
                      <p className='text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 group-hover/label:text-primary transition-colors'>Tickets</p>
                      <p className='text-md font-black italic'>{item.bookedSeats?.length.toString().padStart(2, '0')}</p>
                    </div>
                    <div className='group/label'>
                      <p className='text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 group-hover/label:text-primary transition-colors'>Seat No.</p>
                      <div className='flex gap-2 flex-wrap'>
                        {item.bookedSeats?.map(seat => (
                          <span key={seat} className='text-sm font-black text-primary/80 group-hover:text-white transition-colors'>{seat}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-3'>
                    {/* ✅ Show Ticket Button - Only for paid bookings */}
                    {item.isPaid && (
                      <button
                        onClick={() => handleShowTicket(item)}
                        className='flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all'
                      >
                        <Ticket className='w-3.5 h-3.5' /> Show Ticket
                      </button>
                    )}

                    {/* ✅ Pay Now Button - Only for unpaid bookings */}
                   {/* ✅ Pay Now Button - Only for unpaid bookings */}
{!item.isPaid && item.paymentLink ? (
  <a
    href={item.paymentLink}
    className='flex items-center gap-2 bg-primary text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest'
  >
    <CreditCard className='w-3.5 h-3.5' /> Pay Now
  </a>
) : item.isPaid ? (
  <div className='flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider'>
    ✓ Payment Confirmed
  </div>
) : null}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
              <p className="text-gray-500 font-bold uppercase tracking-widest">No bookings found in your vault.</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Ticket Modal */}
      {showModal && selectedTicket && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-md w-full border border-white/20 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-center">
              <Ticket className="w-12 h-12 mx-auto mb-3 text-white" />
              <h2 className="text-2xl font-black text-white">Movie Ticket</h2>
              <p className="text-purple-200 text-sm mt-1">Valid for one entry</p>
            </div>
            
            {/* Ticket Content */}
            <div className="p-6 space-y-4">
              <div className="border-b border-white/10 pb-3">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Movie</p>
                <p className="text-white font-bold text-lg">{selectedTicket.show?.movie?.title}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border-b border-white/10 pb-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Date</p>
                  <p className="text-white font-semibold">
                    {selectedTicket.show?.showDateTime ? dateFormat(selectedTicket.show.showDateTime) : 'N/A'}
                  </p>
                </div>
                <div className="border-b border-white/10 pb-3">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Time</p>
                  <p className="text-white font-semibold">
                    {selectedTicket.show?.showDateTime ? 
                      new Date(selectedTicket.show.showDateTime).toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="border-b border-white/10 pb-3">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Seats</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedTicket.bookedSeats?.map(seat => (
                    <span key={seat} className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-lg font-bold text-sm">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Amount Paid</p>
                  <p className="text-2xl font-black text-green-400">₹{selectedTicket.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Booking ID</p>
                  <p className="text-white font-mono text-sm">#{selectedTicket._id?.slice(-8)}</p>
                </div>
              </div>
            </div>
            
            {/* Ticket Footer */}
            <div className="bg-white/5 p-4 text-center border-t border-white/10">
              <p className="text-gray-400 text-xs">Please show this ticket at the cinema entrance</p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-3 text-purple-400 hover:text-purple-300 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;