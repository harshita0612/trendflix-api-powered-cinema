import React, { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import MovieCard from './components/MovieCard.jsx';
import Search from './components/Search.jsx';
import Spinner from './components/Spinner.jsx';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const LOCAL_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 400, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const isLocal = window.location.hostname === 'localhost';

      const endpoint = isLocal
        ? query
          ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
          : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
        : query
          ? `/api/movies?query=${encodeURIComponent(query)}`
          : `/api/movies`;

      const options = isLocal
        ? {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${LOCAL_API_KEY}`,
            },
          }
        : undefined;

      const response = await fetch(endpoint, options);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies!');
        setMovieList([]);
        return;
      }

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

      setMovieList(data.results || []);
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      const filtered = movies.filter((m) => m.poster_url);
      setTrendingMovies(filtered.slice(0, 5));
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy Without Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img
                    src={movie.poster_url || 'https://via.placeholder.com/100x150?text=No+Image'}
                    alt={movie.title || 'Trending Movie'}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <div key={movie.id}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
