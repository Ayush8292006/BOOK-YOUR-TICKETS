import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { CheckIcon, StarIcon, X, Calendar, DollarSign, Film, Clock } from 'lucide-react'
import { kConverter } from '../../lib/kConverter'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddShows = () => {
  const { axios, getToken, user, image_base_url } = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY

  const [nowPlayingMovies, setNowPlayingMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [dateTimeSelection, setDateTimeSelection] = useState({})
  const [dateTimeInput, setDateTimeInput] = useState("")
  const [showPrice, setShowPrice] = useState("");
  const [addingShow, setAddingShow] = useState(false)

  const fetchNowPlayingMovies = async () => {
    try {
      const { data } = await axios.get('/api/show/now-playing', { headers: { Authorization: `Bearer ${await getToken()}` } })
      if (data.success) setNowPlayingMovies(data.movies)
    } catch (error) {
      console.error('Error fetching movies: ', error)
    }
  };

  useEffect(() => {
    if (user) fetchNowPlayingMovies();
  }, [user])

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });
    setDateTimeInput("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);
      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: filteredTimes };
    });
  };

  const handleSubmit = async () => {
    try {
      if (!selectedMovie || Object.keys(dateTimeSelection).length === 0 || !showPrice) {
        return toast.error('Please fill all required fields');
      }
      setAddingShow(true);
      const token = await getToken();
      const showsInput = Object.entries(dateTimeSelection).map(([date, time]) => ({ date, time }));
      
      const { data } = await axios.post('/api/show/add', 
        { movieId: selectedMovie, showsInput, showPrice: Number(showPrice) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setSelectedMovie(null);
        setDateTimeSelection({});
        setShowPrice("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Submission failed. Check console.');
    } finally {
      setAddingShow(false);
    }
  };

  return nowPlayingMovies.length > 0 ? (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <Title text1="Schedule" text2="New Shows" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        
        {/* LEFT COLUMN: Movie Selection */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <Film className="text-primary w-5 h-5" />
              <h2 className="text-xl font-bold tracking-tight">Select Movie</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {nowPlayingMovies.map((movie) => {
                const movieId = movie._id || movie.id;
                const isSelected = selectedMovie === movieId;
                return (
                  <div
                    key={movieId}
                    onClick={() => setSelectedMovie(movieId)}
                    className={`group relative rounded-xl cursor-pointer transition-all duration-300 ${
                      isSelected ? 'ring-2 ring-primary ring-offset-4 ring-offset-black scale-[0.98]' : 'hover:scale-[1.02]'
                    }`}
                  >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/5 shadow-2xl">
                      <img src={image_base_url + movie.poster_path} alt="" className={`w-full h-full object-cover transition-all duration-500 ${isSelected ? 'brightness-100' : 'brightness-50 group-hover:brightness-75'}`} />
                      
                      {/* Rating Badge */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                        <StarIcon className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-bold text-white">{movie.vote_average.toFixed(1)}</span>
                      </div>

                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px]">
                          <div className="bg-primary p-2 rounded-full shadow-lg shadow-primary/40">
                            <CheckIcon className="w-6 h-6 text-black" strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className={`mt-3 text-xs font-bold uppercase tracking-wider truncate px-1 ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                      {movie.title}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Configuration */}
        <div className="space-y-6">
          
          {/* Scheduling Card */}
          <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6 text-gray-200">
              <Clock className="text-primary w-5 h-5" />
              <h2 className="text-lg font-bold">Show Timing</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <input
                  type="datetime-local"
                  value={dateTimeInput}
                  onChange={(e) => setDateTimeInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all"
                  style={{ colorScheme: 'dark' }}
                />
                <button
                  type="button"
                  onClick={handleDateTimeAdd}
                  className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-black font-bold py-3 rounded-xl transition-all duration-300 border border-primary/20 text-xs uppercase tracking-widest"
                >
                  Add Slot
                </button>
              </div>

              {/* Displaying Slots */}
              <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-1">
                {Object.keys(dateTimeSelection).map((date) => (
                  <div key={date} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-black">{date}</p>
                    <div className="flex flex-wrap gap-2">
                      {dateTimeSelection[date].map((time) => (
                        <span key={time} className="group flex items-center gap-2 bg-white/5 border border-white/10 pl-3 pr-2 py-1 rounded-full text-[11px] hover:border-red-500/50 transition-colors">
                          {time}
                          <X 
                            onClick={() => handleRemoveTime(date, time)} 
                            className="w-3 h-3 cursor-pointer text-gray-500 group-hover:text-red-500" 
                          />
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Card */}
          <section className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 text-gray-200">
              <DollarSign className="text-primary w-5 h-5" />
              <h2 className="text-lg font-bold">Ticket Pricing</h2>
            </div>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{currency}</span>
              <input
                type="number"
                value={showPrice}
                onChange={(e) => setShowPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-xl font-mono focus:border-primary/50 outline-none transition-all"
              />
            </div>
          </section>

          {/* Final Action */}
          <button 
            onClick={handleSubmit} 
            disabled={addingShow}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all duration-500 flex items-center justify-center gap-3 ${
              addingShow 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-primary text-black hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:-translate-y-1 active:scale-95'
            }`}
          >
            {addingShow ? 'Processing...' : 'Deploy Shows'}
          </button>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default AddShows