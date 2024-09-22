export async function onRequestGet(context) {
    const { searchParams } = new URL(context.request.url);
    const query = searchParams.get('q');
  
    if (!query) {
      return new Response('Missing query parameter', { status: 400 });
    }
  
    const geniusApiKey = context.env.GENIUS_API_KEY;
  
    try {
      const geniusResponse = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${geniusApiKey}`
        }
      });
  
      if (!geniusResponse.ok) {
        throw new Error(`Genius API responded with status: ${geniusResponse.status}`);
      }
  
      const geniusData = await geniusResponse.json();
  
      return new Response(JSON.stringify(geniusData), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Error in Lyrics function:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }