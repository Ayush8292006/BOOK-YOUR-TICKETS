import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loading from '../components/Loading';
import { ArrowRight, Clock, Armchair, CheckCircle2 } from 'lucide-react';
import isoTimeFormat from '../lib/isoTimeFormat';
import BlurCircle from '../components/BlurCircle';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

const SeatLayout = () => {
  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];
  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  const navigate = useNavigate();
  const { axios, user, getToken } = useAppContext();

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data.success) {
        const dateTimeWithPrice = {};
        Object.keys(data.shows).forEach(date => {
          dateTimeWithPrice[date] = data.shows[date].map(show => ({
            ...show,
            price: show.price || data.movie?.showPrice || 0
          }));
        });
        setShow({ 
          movie: data.movie, 
          dateTime: dateTimeWithPrice 
        });
      }
    } catch (error) {
      console.error("Error fetching show:", error);
      toast.error("Failed to load movie details");
    }
  };

  const getOccupiedSeats = async (showId) => {
    try {
      const { data } = await axios.get(`/api/booking/seats/${showId}`);
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats || []);
      }
    } catch (error) {
      console.error("Error fetching seats:", error);
    }
  };

  const handleTimeSelect = (item) => {
    setSelectedTime(item);
    setSelectedSeats([]);
    getOccupiedSeats(item.showId);
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast.error("Please select a showtime first");
    if (occupiedSeats.includes(seatId)) {
      return toast.error("Seat already booked!");
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast.error("Maximum 5 seats allowed");
    }
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  // ✅ MOCK PAYMENT - No Gateway!
  const handleMockPayment = async (bookingId) => {
    try {
      const { data } = await axios.post(`/api/booking/mock-payment/${bookingId}`);
      
      if (data.success) {
        toast.success("🎉 Payment Successful! Your seats are confirmed.");
        navigate('/my-bookings');
      } else {
        toast.error(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Mock payment error:', error);
      toast.error('Payment failed');
    }
  };

// ✅ BOOK TICKETS - Redirect to Dummy Payment Page
const bookTickets = async () => {
  try {
    if (!user) return toast.error('Please login to book tickets');
    if (!selectedTime || selectedSeats.length === 0) return toast.error('Select time & seats');
    
    setIsBooking(true);
    const token = await getToken();
    
    const { data } = await axios.post('/api/booking/create', 
      { showId: selectedTime.showId, seats: selectedSeats }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (data.success) {
      // ✅ Redirect to dummy payment page
      navigate(`/dummy-payment/${data.bookingId}`);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error("Booking error:", error);
    toast.error(error.response?.data?.message || "Booking failed. Please try again.");
  } finally {
    setIsBooking(false);
  }
};

  useEffect(() => {
    getShow();
  }, [id]);

  if (!show) return <Loading />;

  const currentPrice = selectedTime?.price || show?.movie?.showPrice || 0;

  return (
    <div className='min-h-screen bg-[#020202] text-white pt-48 pb-32 px-6 md:px-16 lg:px-24 relative overflow-hidden'>
      <BlurCircle top='-10%' left='-5%' color="bg-primary" opacity="opacity-10" />
      
      <div className='max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-16 relative z-10'>
        <div className='xl:w-96 flex flex-col gap-8'>
          <div className='border-l-4 border-primary pl-6 py-2'>
            <h1 className='text-5xl font-black uppercase tracking-tighter leading-none italic'>{show.movie.title}</h1>
            <p className='text-gray-500 text-xs mt-3 font-bold tracking-[0.2em] uppercase'>Experience Premium Format</p>
          </div>
          
          <div className='bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8'>
            <h3 className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3'>Show Times</h3>
            <div className='space-y-3'>
              {show?.dateTime?.[date]?.map((item) => (
                <button
                  key={item.showId}
                  onClick={() => handleTimeSelect(item)}
                  className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 ${
                    selectedTime?.showId === item.showId
                      ? "bg-primary text-black"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <div className='flex items-center gap-4'>
                    <Clock className={`w-5 h-5 ${selectedTime?.showId === item.showId ? 'text-black' : 'text-primary'}`} />
                    <span className='font-black text-lg'>{isoTimeFormat(item.time)}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='text-sm font-bold'>₹{item.price}</span>
                    {selectedTime?.showId === item.showId && <CheckCircle2 className='w-5 h-5' />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='flex-1 flex flex-col items-center'>
          <div className='relative w-full max-w-2xl mb-24 px-10'>
            <div className='h-2 w-full bg-primary/20 rounded-[50%] blur-md mb-2 shadow-[0_-20px_50px_rgba(var(--primary-rgb),0.4)]' />
            <div className='h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent rounded-full' />
            <p className='text-center text-[10px] font-black text-gray-500 tracking-[0.6em] mt-6 uppercase opacity-50'>Screen This Side</p>
          </div>

          <div className='flex flex-col gap-6 items-center'>
            {groupRows.map((rows, gIdx) => (
              <div key={gIdx} className={`space-y-3 ${gIdx === 1 ? 'mt-8' : ''}`}>
                {rows.map(row => (
                  <div key={row} className='flex items-center gap-6'>
                    <span className='w-5 text-[10px] font-black text-gray-700 uppercase'>{row}</span>
                    <div className='flex gap-3'>
                      {Array.from({ length: 9 }, (_, i) => {
                        const seatId = `${row}${i + 1}`;
                        const isOccupied = occupiedSeats.includes(seatId);
                        const isSelected = selectedSeats.includes(seatId);

                        return (
                          <button
                            key={seatId}
                            onClick={() => handleSeatClick(seatId)}
                            disabled={isOccupied}
                            className={`relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all duration-500 flex items-center justify-center group overflow-hidden ${
                              isOccupied ? "bg-white/[0.03] text-gray-900 cursor-not-allowed border border-white/5 opacity-40" 
                              : isSelected ? "bg-primary text-black shadow-[0_0_25px_rgba(var(--primary-rgb),0.6)] scale-110 -translate-y-1.5 z-20" 
                              : "bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] text-gray-500 hover:text-primary"
                            }`}
                          >
                            <Armchair className={`w-5 h-5 transition-all duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-black uppercase transition-all duration-300 ${isSelected ? 'text-black/60' : 'text-primary opacity-0 group-hover:opacity-100'}`}>
                              {seatId}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 transition-all duration-500 ${selectedSeats.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <div className='bg-white/10 backdrop-blur-3xl border border-white/10 p-5 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col md:flex-row items-center justify-between gap-6 px-10'>
          <div className='flex items-center gap-8 text-white'>
            <div>
              <p className='text-[9px] font-black text-primary uppercase tracking-widest mb-1'>Seats Selected</p>
              <div className='flex gap-2 flex-wrap max-w-[200px]'>
                {selectedSeats.map(s => (
                  <span key={s} className='px-3 py-1 bg-white/5 rounded-lg text-sm font-black border border-white/5'>{s}</span>
                ))}
              </div>
            </div>
            <div className='h-10 w-px bg-white/10' />
            <div>
              <p className='text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1'>Total Bill</p>
              <p className='text-2xl font-black tracking-tighter'>
                ₹{(selectedSeats.length * currentPrice).toLocaleString()}
              </p>
            </div>
          </div>

          <button 
            onClick={bookTickets} 
            disabled={isBooking}
            className='w-full md:w-auto px-12 py-5 bg-primary text-black font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isBooking ? 'Processing...' : 'Confirm & Pay'} 
            <ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-1' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;