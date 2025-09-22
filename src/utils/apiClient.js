const axios = require('axios');

// Configuración para APIs externas
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const LASTFM_BASE_URL = 'http://ws.audioscrobbler.com/2.0';

class MusicAPIClient {
  constructor() {
    this.spotifyToken = null;
    this.tokenExpiration = null;
  }

  // Autenticación con Spotify (Client Credentials Flow)
  async authenticateSpotify() {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('Spotify credentials not configured');
      }

      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
          }
        }
      );

      this.spotifyToken = response.data.access_token;
      this.tokenExpiration = Date.now() + (response.data.expires_in * 1000);
      
      return this.spotifyToken;
    } catch (error) {
      console.error('Spotify authentication failed:', error.message);
      throw error;
    }
  }

  // Obtener token válido (renueva si es necesario)
  async getValidToken() {
    if (!this.spotifyToken || Date.now() >= this.tokenExpiration) {
      await this.authenticateSpotify();
    }
    return this.spotifyToken;
  }

  // Buscar álbumes en Spotify
  async searchAlbums(query, limit = 10) {
    try {
      const token = await this.getValidToken();
      
      const response = await axios.get(`${SPOTIFY_BASE_URL}/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'album',
          limit: limit,
          market: 'CL' // Chile, puedes hacerlo configurable
        }
      });

      return response.data.albums.items.map(album => ({
        spotifyId: album.id,
        title: album.name,
        artist: album.artists[0]?.name,
        artists: album.artists,
        releaseDate: album.release_date,
        totalTracks: album.total_tracks,
        coverImage: album.images[0]?.url,
        externalUrl: album.external_urls.spotify
      }));
    } catch (error) {
      console.error('Error searching albums:', error.message);
      throw error;
    }
  }

  // Obtener información detallada de un álbum
  async getAlbumDetails(albumId) {
    try {
      const token = await this.getValidToken();
      
      const response = await axios.get(`${SPOTIFY_BASE_URL}/albums/${albumId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const album = response.data;
      
      return {
        spotifyId: album.id,
        title: album.name,
        artists: album.artists,
        releaseDate: album.release_date,
        totalTracks: album.total_tracks,
        coverImage: album.images[0]?.url,
        genres: album.genres,
        label: album.label,
        popularity: album.popularity,
        tracks: album.tracks.items.map(track => ({
          spotifyId: track.id,
          title: track.name,
          duration: track.duration_ms,
          trackNumber: track.track_number,
          previewUrl: track.preview_url
        })),
        externalUrl: album.external_urls.spotify
      };
    } catch (error) {
      console.error('Error getting album details:', error.message);
      throw error;
    }
  }

  // Buscar artistas
  async searchArtists(query, limit = 10) {
    try {
      const token = await this.getValidToken();
      
      const response = await axios.get(`${SPOTIFY_BASE_URL}/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: query,
          type: 'artist',
          limit: limit
        }
      });

      return response.data.artists.items.map(artist => ({
        spotifyId: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        image: artist.images[0]?.url,
        externalUrl: artist.external_urls.spotify
      }));
    } catch (error) {
      console.error('Error searching artists:', error.message);
      throw error;
    }
  }

  // Obtener información de artista
  async getArtistDetails(artistId) {
    try {
      const token = await this.getValidToken();
      
      const response = await axios.get(`${SPOTIFY_BASE_URL}/artists/${artistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const artist = response.data;
      
      return {
        spotifyId: artist.id,
        name: artist.name,
        genres: artist.genres,
        popularity: artist.popularity,
        image: artist.images[0]?.url,
        followers: artist.followers.total,
        externalUrl: artist.external_urls.spotify
      };
    } catch (error) {
      console.error('Error getting artist details:', error.message);
      throw error;
    }
  }

  // Obtener álbumes de un artista
  async getArtistAlbums(artistId, limit = 20) {
    try {
      const token = await this.getValidToken();
      
      const response = await axios.get(`${SPOTIFY_BASE_URL}/artists/${artistId}/albums`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          include_groups: 'album,single',
          limit: limit,
          market: 'CL'
        }
      });

      return response.data.items.map(album => ({
        spotifyId: album.id,
        title: album.name,
        releaseDate: album.release_date,
        totalTracks: album.total_tracks,
        coverImage: album.images[0]?.url,
        albumType: album.album_type
      }));
    } catch (error) {
      console.error('Error getting artist albums:', error.message);
      throw error;
    }
  }

  // Buscar en Last.fm (para información adicional)
  async searchLastFM(query, type = 'album') {
    try {
      const apiKey = process.env.LASTFM_API_KEY;
      
      if (!apiKey) {
        throw new Error('Last.fm API key not configured');
      }

      const response = await axios.get(LASTFM_BASE_URL, {
        params: {
          method: `${type}.search`,
          [type]: query,
          api_key: apiKey,
          format: 'json',
          limit: 10
        }
      });

      return response.data.results;
    } catch (error) {
      console.error('Error searching Last.fm:', error.message);
      // No throw error aquí porque Last.fm es opcional
      return null;
    }
  }

  // Obtener información de género desde Last.fm
  async getGenreInfo(genreName) {
    try {
      const apiKey = process.env.LASTFM_API_KEY;
      
      if (!apiKey) {
        return null;
      }

      const response = await axios.get(LASTFM_BASE_URL, {
        params: {
          method: 'tag.getinfo',
          tag: genreName,
          api_key: apiKey,
          format: 'json'
        }
      });

      return response.data.tag;
    } catch (error) {
      console.error('Error getting genre info:', error.message);
      return null;
    }
  }

  // Obtener álbumes populares por género
  async getTopAlbumsByGenre(genre, limit = 20) {
    try {
      const token = await this.getValidToken();
      
      const response = await axios.get(`${SPOTIFY_BASE_URL}/search`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          q: `genre:"${genre}"`,
          type: 'album',
          limit: limit,
          market: 'CL'
        }
      });

      return response.data.albums.items;
    } catch (error) {
      console.error('Error getting top albums by genre:', error.message);
      throw error;
    }
  }

  // Obtener nuevas releases
  async getNewReleases(limit = 20) {
    try {
      const token = await this.getValidToken();
      
      const response = await axios.get(`${SPOTIFY_BASE_URL}/browse/new-releases`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          limit: limit,
          country: 'CL'
        }
      });

      return response.data.albums.items;
    } catch (error) {
      console.error('Error getting new releases:', error.message);
      throw error;
    }
  }
}

// Singleton instance
const musicAPIClient = new MusicAPIClient();

module.exports = musicAPIClient;