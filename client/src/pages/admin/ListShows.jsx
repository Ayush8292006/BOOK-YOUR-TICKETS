import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/dateFormate';
import { useAppContext } from '../../context/AppContext';
import { Film, Calendar, Users, IndianRupee, Hash, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ListShows = () => {
  const { axios, getToken, user } = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/all-shows", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) getAllShows();
  }, [user]);

  return !loading ? (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Title text1="Production" text2="Inventory" />

      <div className="mt-8 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-white/[0.05]">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-white/10">
                  <div className="flex items-center gap-2"><Film className="w-3 h-3 text-primary" /> Movie Detail</div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-white/10">
                  <div className="flex items-center gap-2"><Calendar className="w-3 h-3 text-primary" /> Show Timing</div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-white/10 text-center">
                  <div className="flex items-center justify-center gap-2"><Users className="w-3 h-3 text-primary" /> Capacity</div>
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-white/10 text-right">
                  <div className="flex items-center justify-end gap-2"><IndianRupee className="w-3 h-3 text-primary" /> Total Revenue</div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.05]">
              {shows.map((show, index) => {
                const bookingCount = Object.keys(show.occupiedSeats).length;
                const earnings = bookingCount * show.showPrice;

                return (
                  <tr 
                    key={index} 
                    className="group hover:bg-primary/[0.04] transition-all duration-300 cursor-default"
                  >
                    {/* Movie Info */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                          {show.movie.title}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-medium">
                           ID: {show._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    
                    {/* Timing */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                           <span className="text-xs font-semibold text-gray-300">
                            {dateFormat(show.showDateTime).split('at')[0]}
                          </span>
                          <span className="text-[10px] text-primary/80 font-black uppercase tracking-tighter">
                            {dateFormat(show.showDateTime).split('at')[1]}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Bookings with Progress feel */}
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xs font-mono font-bold text-white bg-white/5 px-3 py-1 rounded-full border border-white/10">
                          {bookingCount} <span className="text-[10px] text-gray-500 font-sans">Seats</span>
                        </span>
                      </div>
                    </td>

                    {/* Earnings */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-white tracking-tight">
                          {currency}{earnings.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">
                          Base: {currency}{show.showPrice}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {shows.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
               <Hash className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">No active records found</p>
          </div>
        )}
      </div>
    </div>
  ) : <Loading />
}

export default ListShows