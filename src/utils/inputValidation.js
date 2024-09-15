export const validateTrackName = (name) => {
    return typeof name === 'string' && name.length > 0 && name.length <= 200;
  };
  
  export const validateArtistName = (name) => {
    return typeof name === 'string' && name.length > 0 && name.length <= 100;
  };
  
  export const validateSpotifyId = (id) => {
    return typeof id === 'string' && /^[a-zA-Z0-9]{22}$/.test(id);
  };
  
  export const validateTimeRange = (range) => {
    return ['short_term', 'medium_term', 'long_term'].includes(range);
  };
  
  export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>&'"]/g, char => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&#39;';
        case '"': return '&quot;';
        default: return char;
      }
    });
  };