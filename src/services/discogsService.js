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

  async searchAlbums(artist, title) {
    try {
      const query = `${artist} ${title}`;
      const response = await axios.get(`${this.baseURL}/database/search`, {
        params: {
          q: query,
          type: 'release',
          format: 'album'
        },
        headers: this.getHeaders()
      });

      if (response.data.results && response.data.results.length > 0) {
        // Priorizar matches exactos o muy similares
        const results = response.data.results;
        const exactMatch = results.find(result => 
          result.title.toLowerCase().includes(title.toLowerCase()) &&
          result.title.toLowerCase().includes(artist.toLowerCase())
        );
        return exactMatch ? [exactMatch] : results;
      }

      return [];
    } catch (error) {
      console.error(`❌ Error searching albums "${title}" by "${artist}":`, error.message);
      return [];
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
      const searchResult = await this.searchAlbums(artist, title);
      if (!searchResult || searchResult.length === 0) {
        console.log(`❌ No results found for "${title}" by "${artist}"`);
        return null;
      }
      const releaseDetails = await this.getReleaseDetails(searchResult[0].id);
      if (!releaseDetails || !releaseDetails.images || releaseDetails.images.length === 0) {
        console.log(`❌ No images found for release ID: ${searchResult[0].id}`);
        return null;
      }
      const images = releaseDetails.images;
      let bestImage = images.find(img => img.type === 'primary');
      if (!bestImage) bestImage = images[0];
      console.log(`🖼️ Found cover image: ${bestImage.uri}`);
      return {
        discogs_release_id: searchResult[0].id,
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
