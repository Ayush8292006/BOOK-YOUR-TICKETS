import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, Smartphone, Loader, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

const DummyPayment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { axios, user } = useAppContext();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  
  // UPI details
  const [upiId, setUpiId] = useState('');
  
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await axios.get(`/api/booking/${bookingId}`);
        if (data.success) {
          setBooking(data.booking);
        } else {
          toast.error('Booking not found');
          navigate('/my-bookings');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load booking');
        navigate('/my-bookings');
      } finally {
        setLoading(false);
      }
    };
    
    if (bookingId && user) {
      fetchBooking();
    }
  }, [bookingId, user]);
  
  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(async () => {
      // 90% success rate for demo
      const isSuccess = Math.random() < 0.9;
      
      if (isSuccess) {
        try {
          const { data } = await axios.post(`/api/booking/mock-payment/${bookingId}`);
          if (data.success) {
            toast.success('🎉 Payment Successful! Your tickets are confirmed.');
            navigate('/my-bookings');
          } else {
            toast.error(data.message);
            setProcessing(false);
          }
        } catch (error) {
          toast.error('Payment failed. Please try again.');
          setProcessing(false);
        }
      } else {
        toast.error('Payment failed! Please try again.');
        setProcessing(false);
      }
    }, 2000);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!booking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Booking not found</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-32 pb-20 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        
        {/* Booking Summary */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">Booking Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Movie:</span>
              <span className="text-white font-semibold">{booking.show?.movie?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Seats:</span>
              <span className="text-white font-semibold">{booking.bookedSeats?.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date & Time:</span>
              <span className="text-white text-sm">
                {booking.show?.showDateTime ? new Date(booking.show.showDateTime).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="border-t border-white/10 pt-3 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount:</span>
                <span className="text-primary font-bold text-2xl">₹{booking.amount}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment Methods */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Select Payment Method</h3>
          
          {/* Method Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setPaymentMethod('card'); setShowOtp(false); }}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'card' 
                  ? 'bg-primary text-black' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Card
            </button>
            <button
              onClick={() => { setPaymentMethod('upi'); setShowOtp(false); }}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'upi' 
                  ? 'bg-primary text-black' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              <Smartphone className="w-4 h-4" /> UPI
            </button>
          </div>
          
          {/* Card Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              {!showOtp ? (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 1111 1111 1111"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength="3"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOtp(true)}
                    className="w-full bg-primary text-black py-3 rounded-xl font-bold mt-4 hover:scale-105 transition-all"
                  >
                    Proceed
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      placeholder="123456"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white mb-4"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {processing ? (
                      <Loader className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      `Pay ₹${booking.amount}`
                    )}
                  </button>
                  <button
                    onClick={() => setShowOtp(false)}
                    className="w-full text-gray-400 text-sm py-2 hover:text-white transition"
                  >
                    ← Back
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* UPI Form */}
          {paymentMethod === 'upi' && (
            <div className="space-y-4">
              {!showOtp ? (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">UPI ID</label>
                    <input
                      type="text"
                      placeholder="success@upi"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (upiId.includes('@')) {
                        setShowOtp(true);
                      } else {
                        toast.error('Enter valid UPI ID (e.g., name@upi)');
                      }
                    }}
                    className="w-full bg-primary text-black py-3 rounded-xl font-bold hover:scale-105 transition-all"
                  >
                    Proceed
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Enter UPI PIN</label>
                    <input
                      type="password"
                      placeholder="1234"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white mb-4"
                    />
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {processing ? (
                      <Loader className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      `Pay ₹${booking.amount}`
                    )}
                  </button>
                  <button
                    onClick={() => setShowOtp(false)}
                    className="w-full text-gray-400 text-sm py-2 hover:text-white transition"
                  >
                    ← Back
                  </button>
                </>
              )}
            </div>
          )}
          
          <p className="text-center text-xs text-gray-500 mt-6 pt-4 border-t border-white/10">
            🔐 Demo Mode - No real money deducted. <br />
            Test Card: 4111 1111 1111 1111 | OTP: Any 6 digits
          </p>
        </div>
      </div>
    </div>
  );
};

export default DummyPayment;