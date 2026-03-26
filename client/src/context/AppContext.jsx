import { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ ADMIN
  const fetchIsAdmin = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("Unauthorized");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ SHOWS
  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all");
      if (data.success) setShows(data.shows);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ FAVORITES FETCH
  const fetchFavoriteMovies = async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setFavoriteMovies(data.movies); // ✅ FIX
      }
    } catch (error) {
      console.error(error);
    }
  };

const toggleFavorite = async (movieId) => {
  try {
    if (!user) return toast.error("Please login");

    const token = await getToken();

    // check pehle (important for message)
    const alreadyFavorite = favoriteMovies.some(
      (m) => m._id === movieId
    );

    // 🔥 instant UI update
    setFavoriteMovies((prev) => {
      if (alreadyFavorite) {
        return prev.filter((m) => m._id !== movieId);
      } else {
        const movie = shows.find((m) => m._id === movieId);
        return movie ? [...prev, movie] : prev;
      }
    });

    const { data } = await axios.post(
      "/api/user/update-favorite",
      { movieId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.success) {
      // ✅ SUCCESS TOAST (MISSING THA)
      toast.success(
        alreadyFavorite
          ? "Removed from favorites"
          : "Added to favorites"
      );
    } else {
      toast.error(data.message);
      fetchFavoriteMovies(); // rollback
    }

  } catch (error) {
    console.error(error);
    toast.error("Something went wrong"); 
    fetchFavoriteMovies();
  }
};

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavoriteMovies();
    } else {
      setFavoriteMovies([]);
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        axios,
        user,
        getToken,
        navigate,
        isAdmin,
        shows,
        favoriteMovies,
        fetchFavoriteMovies,
        toggleFavorite,
        image_base_url,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);