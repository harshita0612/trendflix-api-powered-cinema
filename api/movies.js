export default async function handler(req, res) {
    const { query } = req.query;
  
    const endpoint = query
      ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`
      : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc`;
  
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
          accept: 'application/json',
        },
      });
  
      const data = await response.json();
  
      return res.status(200).json(data);
    } catch (error) {
      console.error('TMDB fetch error:', error);
      return res.status(500).json({ error: 'Error fetching movies from TMDB' });
    }
  }
  
