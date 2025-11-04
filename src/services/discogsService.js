const axios = require('axios');

class DiscogsService {
  constructor() {
    this.baseURL = 'https://api.discogs.com';
    this.token = process.env.DISCOGS_TOKEN;
    this.userAgent = 'MPT-Backend/1.0 +https://bdpw-back-end.onrender.com';
    
    if (!this.token) {
      console.warn('⚠️ DISCOGS_TOKEN not found in environment variables');
    }
  }

  getHeaders() {
    return {
      'Authorization': `Discogs token=${this.token}`,
      'User-Agent': this.userAgent,
      'Accept': 'application/vnd.discogs.v2.discogs+json'
    };
  }

  async searchAlbum(artist, title) {
    try {
      const query = `${title} ${artist}`;
      const response = await axios.get(`${this.baseURL}/database/search`, {
        params: {
          q: query,
          type: 'release',
          format: 'album'
        },
        headers: this.getHeaders()
      });

      if (response.data.results && response.data.results.length > 0) {
        // Buscar el mejor match
        const results = response.data.results;
        
        // Priorizar matches exactos o muy similares
        const exactMatch = results.find(result => 
          result.title.toLowerCase().includes(title.toLowerCase()) &&
          result.title.toLowerCase().includes(artist.toLowerCase())
        );

        return exactMatch || results[0];
      }

      return null;
    } catch (error) {
      console.error(`❌ Error searching album "${title}" by "${artist}":`, error.message);
      return null;
    }
  }

  async getReleaseDetails(releaseId) {
    try {
      const response = await axios.get(`${this.baseURL}/releases/${releaseId}`, {
        headers: this.getHeaders()
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Error getting release details for ID ${releaseId}:`, error.message);
      return null;
    }
  }

  async getAlbumCover(artist, title) {
    try {
      console.log(`🔍 Searching Discogs for: "${title}" by "${artist}"`);
      
      // 1. Buscar el álbum
      const searchResult = await this.searchAlbum(artist, title);
      if (!searchResult) {
        console.log(`❌ No results found for "${title}" by "${artist}"`);
        return null;
      }

      console.log(`✅ Found release ID: ${searchResult.id}`);

      // 2. Obtener detalles del release
      const releaseDetails = await this.getReleaseDetails(searchResult.id);
      if (!releaseDetails || !releaseDetails.images || releaseDetails.images.length === 0) {
        console.log(`❌ No images found for release ID: ${searchResult.id}`);
        return null;
      }

      // 3. Seleccionar la mejor imagen
      const images = releaseDetails.images;
      
      // Priorizar imagen primaria
      let bestImage = images.find(img => img.type === 'primary');
      if (!bestImage) {
        bestImage = images[0]; // Tomar la primera si no hay primaria
      }

      console.log(`🖼️ Found cover image: ${bestImage.uri}`);

      return {
        discogs_release_id: searchResult.id,
        cover_image: bestImage.uri,
        discogs_data: {
          title: releaseDetails.title,
          year: releaseDetails.year,
          label: releaseDetails.labels?.[0]?.name || 'Unknown',
          formats: releaseDetails.formats?.map(f => f.name) || [],
          tracklist_count: releaseDetails.tracklist?.length || 0
        }
      };

    } catch (error) {
      console.error(`❌ Error in getAlbumCover for "${title}" by "${artist}":`, error.message);
      return null;
    }
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/database/search`, {
        params: {
          q: 'Abbey Road',
          type: 'release'
        },
        headers: this.getHeaders()
      });

      console.log('✅ Discogs API connection successful');
      console.log(`📊 Rate limit remaining: ${response.headers['x-discogs-ratelimit-remaining']}`);
      return true;
    } catch (error) {
      console.error('❌ Discogs API connection failed:', error.message);
      return false;
    }
  }
}

module.exports = new DiscogsService();