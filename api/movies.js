// api/movies.js

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
  
    const endpoint = query
      ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`
      : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc`;
  
    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
          accept: 'application/json',
        },
      });
  
      const data = await res.json();
  
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
  
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from TMDB' }),
        { status: 500 }
      );
    }
  }
  