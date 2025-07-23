const GIPHY_API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65'; // Public demo key
const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs/search';

export const fetchGiphyGif = async (query: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `${GIPHY_BASE_URL}?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1&offset=0&rating=g&lang=en`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Giphy');
    }
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].images.fixed_height.url;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Giphy GIF:', error);
    return null;
  }
};