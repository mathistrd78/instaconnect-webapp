// cityAutocomplete.js - Version React du système city
export class CityAutocomplete {
  constructor() {
    this.debounceTimer = null;
    this.countryFlags = {
      'FR': '🇫🇷', 'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪', 'ES': '🇪🇸',
      'IT': '🇮🇹', 'PT': '🇵🇹', 'BE': '🇧🇪', 'CH': '🇨🇭', 'NL': '🇳🇱',
      'CA': '🇨🇦', 'BR': '🇧🇷', 'AR': '🇦🇷', 'MX': '🇲🇽', 'JP': '🇯🇵',
      'CN': '🇨🇳', 'IN': '🇮🇳', 'AU': '🇦🇺', 'RU': '🇷🇺', 'ZA': '🇿🇦',
      'EG': '🇪🇬', 'MA': '🇲🇦', 'DZ': '🇩🇿', 'TN': '🇹🇳', 'SN': '🇸🇳'
      // ... ajouter plus de drapeaux si besoin
    };
  }

  getFlag(countryCode) {
    return this.countryFlags[countryCode] || '🌍';
  }

  normalizeCountry(country) {
    const mapping = {
      'germany': 'Allemagne',
      'united states': 'États-Unis',
      'united states of america': 'États-Unis',
      'usa': 'États-Unis',
      'uk': 'Royaume-Uni',
      'united kingdom': 'Royaume-Uni',
      'spain': 'Espagne',
      'italy': 'Italie',
      'france': 'France'
    };
    
    const lower = country.toLowerCase().trim();
    return mapping[lower] || country;
  }

  async searchCities(query) {
    if (!query || query.length < 2) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=8&` +
        `accept-language=fr`,
        {
          headers: {
            'User-Agent': 'InstaConnect CRM'
          }
        }
      );

      if (!response.ok) return [];

      const results = await response.json();

      return results
        .map(r => {
          const city = r.address?.city || r.address?.town || r.address?.village || r.name;
          const country = r.address?.country || '';
          const countryCode = r.address?.country_code?.toUpperCase() || '';
          const state = r.address?.state || '';

          // Normaliser le pays
          const normalizedCountry = this.normalizeCountry(country);

          return {
            city: city,
            country: normalizedCountry,
            countryCode: countryCode,
            state: state,
            displayName: state && state !== city 
              ? `${city}, ${state}, ${normalizedCountry}` 
              : city 
                ? `${city}, ${normalizedCountry}`
                : normalizedCountry,
            flag: this.getFlag(countryCode)
          };
        })
        .filter((item, index, self) => 
          // Dédupliquer par displayName
          index === self.findIndex(t => t.displayName === item.displayName)
        )
        .slice(0, 6);
    } catch (error) {
      console.error('City search error:', error);
      return [];
    }
  }

  getRecentLocations(contacts) {
    const locations = [];
    const seen = new Set();

    // Trier par date de modification ou création
    const sortedContacts = [...contacts].sort((a, b) => {
      const getTimestamp = (contact) => {
        if (contact.updatedAt) return new Date(contact.updatedAt).getTime();
        if (contact.createdAt) return new Date(contact.createdAt).getTime();
        return 0;
      };
      return getTimestamp(b) - getTimestamp(a);
    });

    for (const contact of sortedContacts) {
      if (contact.location) {
        let locationData = null;

        if (typeof contact.location === 'object') {
          locationData = contact.location;
        } else if (typeof contact.location === 'string') {
          // Parser string simple
          const parts = contact.location.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            const countryCode = this.guessCountryCode(parts[parts.length - 1]);
            locationData = {
              displayName: contact.location,
              country: parts[parts.length - 1],
              countryCode: countryCode,
              flag: this.getFlag(countryCode)
            };
          }
        }

        if (locationData && locationData.displayName && !seen.has(locationData.displayName)) {
          locations.push(locationData);
          seen.add(locationData.displayName);

          if (locations.length >= 5) break;
        }
      }
    }

    return locations;
  }

  guessCountryCode(countryName) {
    const mapping = {
      'france': 'FR',
      'allemagne': 'DE',
      'germany': 'DE',
      'espagne': 'ES',
      'spain': 'ES',
      'italie': 'IT',
      'italy': 'IT',
      'états-unis': 'US',
      'united states': 'US',
      'usa': 'US',
      'royaume-uni': 'GB',
      'united kingdom': 'GB',
      'uk': 'GB'
    };

    return mapping[countryName.toLowerCase()] || '';
  }
}

export const cityAutocomplete = new CityAutocomplete();
