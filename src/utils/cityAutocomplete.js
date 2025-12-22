// cityAutocomplete.js - Version React du système city
export class CityAutocomplete {
  constructor() {
    this.debounceTimer = null;
    
    // Tous les drapeaux de pays du monde (195+ pays)
    this.countryFlags = {
      // Europe
      'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'ES': '🇪🇸', 'GB': '🇬🇧',
      'PT': '🇵🇹', 'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹',
      'GR': '🇬🇷', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'RO': '🇷🇴',
      'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'IE': '🇮🇪',
      'SK': '🇸🇰', 'BG': '🇧🇬', 'HR': '🇭🇷', 'SI': '🇸🇮', 'LT': '🇱🇹',
      'LV': '🇱🇻', 'EE': '🇪🇪', 'LU': '🇱🇺', 'MT': '🇲🇹', 'CY': '🇨🇾',
      'IS': '🇮🇸', 'AL': '🇦🇱', 'MK': '🇲🇰', 'BA': '🇧🇦', 'RS': '🇷🇸',
      'ME': '🇲🇪', 'XK': '🇽🇰', 'MD': '🇲🇩', 'UA': '🇺🇦', 'BY': '🇧🇾',
      'RU': '🇷🇺', 'TR': '🇹🇷', 'GE': '🇬🇪', 'AM': '🇦🇲', 'AZ': '🇦🇿',
      
      // Amériques
      'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷', 'AR': '🇦🇷',
      'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪', 'VE': '🇻🇪', 'EC': '🇪🇨',
      'BO': '🇧🇴', 'PY': '🇵🇾', 'UY': '🇺🇾', 'GY': '🇬🇾', 'SR': '🇸🇷',
      'CR': '🇨🇷', 'PA': '🇵🇦', 'GT': '🇬🇹', 'HN': '🇭🇳', 'SV': '🇸🇻',
      'NI': '🇳🇮', 'BZ': '🇧🇿', 'CU': '🇨🇺', 'DO': '🇩🇴', 'HT': '🇭🇹',
      'JM': '🇯🇲', 'TT': '🇹🇹', 'BS': '🇧🇸', 'BB': '🇧🇧', 'LC': '🇱🇨',
      'GD': '🇬🇩', 'VC': '🇻🇨', 'AG': '🇦🇬', 'DM': '🇩🇲', 'KN': '🇰🇳',
      
      // Asie
      'CN': '🇨🇳', 'JP': '🇯🇵', 'IN': '🇮🇳', 'KR': '🇰🇷', 'ID': '🇮🇩',
      'TH': '🇹🇭', 'VN': '🇻🇳', 'PH': '🇵🇭', 'MY': '🇲🇾', 'SG': '🇸🇬',
      'BD': '🇧🇩', 'PK': '🇵🇰', 'MM': '🇲🇲', 'KH': '🇰🇭', 'LA': '🇱🇦',
      'NP': '🇳🇵', 'LK': '🇱🇰', 'AF': '🇦🇫', 'MN': '🇲🇳', 'KP': '🇰🇵',
      'TW': '🇹🇼', 'HK': '🇭🇰', 'MO': '🇲🇴', 'BT': '🇧🇹', 'MV': '🇲🇻',
      
      // Moyen-Orient
      'SA': '🇸🇦', 'AE': '🇦🇪', 'IL': '🇮🇱', 'IQ': '🇮🇶', 'IR': '🇮🇷',
      'JO': '🇯🇴', 'LB': '🇱🇧', 'SY': '🇸🇾', 'YE': '🇾🇪', 'OM': '🇴🇲',
      'KW': '🇰🇼', 'QA': '🇶🇦', 'BH': '🇧🇭', 'PS': '🇵🇸', 'CY': '🇨🇾',
      
      // Afrique
      'EG': '🇪🇬', 'ZA': '🇿🇦', 'NG': '🇳🇬', 'ET': '🇪🇹', 'KE': '🇰🇪',
      'MA': '🇲🇦', 'DZ': '🇩🇿', 'TN': '🇹🇳', 'LY': '🇱🇾', 'SD': '🇸🇩',
      'GH': '🇬🇭', 'CI': '🇨🇮', 'CM': '🇨🇲', 'SN': '🇸🇳', 'ML': '🇲🇱',
      'BF': '🇧🇫', 'NE': '🇳🇪', 'TD': '🇹🇩', 'AO': '🇦🇴', 'MZ': '🇲🇿',
      'UG': '🇺🇬', 'TZ': '🇹🇿', 'RW': '🇷🇼', 'BI': '🇧🇮', 'SO': '🇸🇴',
      'ZW': '🇿🇼', 'ZM': '🇿🇲', 'MW': '🇲🇼', 'BW': '🇧🇼', 'NA': '🇳🇦',
      'LS': '🇱🇸', 'SZ': '🇸🇿', 'MG': '🇲🇬', 'MU': '🇲🇺', 'SC': '🇸🇨',
      'KM': '🇰🇲', 'CV': '🇨🇻', 'ST': '🇸🇹', 'GQ': '🇬🇶', 'GA': '🇬🇦',
      'CG': '🇨🇬', 'CD': '🇨🇩', 'CF': '🇨🇫', 'DJ': '🇩🇯', 'ER': '🇪🇷',
      'GM': '🇬🇲', 'GN': '🇬🇳', 'GW': '🇬🇼', 'LR': '🇱🇷', 'SL': '🇸🇱',
      'TG': '🇹🇬', 'BJ': '🇧🇯', 'MR': '🇲🇷', 'SS': '🇸🇸',
      
      // Océanie
      'AU': '🇦🇺', 'NZ': '🇳🇿', 'FJ': '🇫🇯', 'PG': '🇵🇬', 'NC': '🇳🇨',
      'PF': '🇵🇫', 'WS': '🇼🇸', 'TO': '🇹🇴', 'VU': '🇻🇺', 'SB': '🇸🇧',
      'KI': '🇰🇮', 'FM': '🇫🇲', 'MH': '🇲🇭', 'PW': '🇵🇼', 'NR': '🇳🇷',
      'TV': '🇹🇻', 'CK': '🇨🇰', 'NU': '🇳🇺', 'TK': '🇹🇰', 'WF': '🇼🇫',
      
      // Asie Centrale
      'KZ': '🇰🇿', 'UZ': '🇺🇿', 'TM': '🇹🇲', 'TJ': '🇹🇯', 'KG': '🇰🇬'
    };

    // Mapping des noms de pays vers leur forme normalisée (en français)
    this.countryNameMapping = {
      'DE': 'Allemagne',
      'US': 'États-Unis',
      'GB': 'Royaume-Uni',
      'ES': 'Espagne',
      'IT': 'Italie',
      'FR': 'France',
      'PT': 'Portugal',
      'BE': 'Belgique',
      'CH': 'Suisse',
      'NL': 'Pays-Bas',
      'AT': 'Autriche',
      'GR': 'Grèce',
      'TR': 'Turquie',
      'PL': 'Pologne',
      'SE': 'Suède',
      'NO': 'Norvège',
      'DK': 'Danemark',
      'FI': 'Finlande',
      'IE': 'Irlande',
      'CZ': 'République tchèque',
      'HU': 'Hongrie',
      'RO': 'Roumanie',
      'BG': 'Bulgarie',
      'HR': 'Croatie',
      'RS': 'Serbie',
      'SI': 'Slovénie',
      'SK': 'Slovaquie',
      'EE': 'Estonie',
      'LV': 'Lettonie',
      'LT': 'Lituanie',
      'UA': 'Ukraine',
      'BY': 'Biélorussie',
      'RU': 'Russie',
      'CA': 'Canada',
      'MX': 'Mexique',
      'BR': 'Brésil',
      'AR': 'Argentine',
      'CL': 'Chili',
      'CO': 'Colombie',
      'PE': 'Pérou',
      'VE': 'Venezuela',
      'EC': 'Équateur',
      'BO': 'Bolivie',
      'CN': 'Chine',
      'JP': 'Japon',
      'IN': 'Inde',
      'KR': 'Corée du Sud',
      'TH': 'Thaïlande',
      'VN': 'Vietnam',
      'ID': 'Indonésie',
      'MY': 'Malaisie',
      'SG': 'Singapour',
      'PH': 'Philippines',
      'PK': 'Pakistan',
      'BD': 'Bangladesh',
      'SA': 'Arabie saoudite',
      'AE': 'Émirats arabes unis',
      'IL': 'Israël',
      'IQ': 'Irak',
      'IR': 'Iran',
      'EG': 'Égypte',
      'MA': 'Maroc',
      'DZ': 'Algérie',
      'TN': 'Tunisie',
      'ZA': 'Afrique du Sud',
      'NG': 'Nigeria',
      'KE': 'Kenya',
      'AU': 'Australie',
      'NZ': 'Nouvelle-Zélande'
    };
  }

  getFlag(countryCode) {
    return this.countryFlags[countryCode?.toUpperCase()] || '🌍';
  }

  // Normaliser le nom du pays selon le code pays (toujours utiliser la version française)
  normalizeCountryName(country, countryCode) {
    if (!countryCode) return country;
    return this.countryNameMapping[countryCode.toUpperCase()] || country;
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

          // TOUJOURS normaliser le nom du pays selon le code pays
          const normalizedCountry = this.normalizeCountryName(country, countryCode);

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
          locationData = {
            ...contact.location,
            // Re-normaliser le nom du pays au cas où
            country: this.normalizeCountryName(contact.location.country, contact.location.countryCode),
            flag: this.getFlag(contact.location.countryCode)
          };
          
          // Reconstruire displayName avec le nom normalisé
          if (locationData.city && locationData.country) {
            locationData.displayName = locationData.state && locationData.state !== locationData.city
              ? `${locationData.city}, ${locationData.state}, ${locationData.country}`
              : `${locationData.city}, ${locationData.country}`;
          } else if (locationData.country) {
            locationData.displayName = locationData.country;
          }
        } else if (typeof contact.location === 'string') {
          // Parser string simple
          const parts = contact.location.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            const countryCode = this.guessCountryCode(parts[parts.length - 1]);
            const normalizedCountry = this.normalizeCountryName(parts[parts.length - 1], countryCode);
            
            locationData = {
              displayName: `${parts[0]}, ${normalizedCountry}`,
              city: parts[0],
              country: normalizedCountry,
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
      'deutschland': 'DE',
      'espagne': 'ES',
      'spain': 'ES',
      'españa': 'ES',
      'italie': 'IT',
      'italy': 'IT',
      'italia': 'IT',
      'états-unis': 'US',
      'etats-unis': 'US',
      'united states': 'US',
      'usa': 'US',
      'royaume-uni': 'GB',
      'united kingdom': 'GB',
      'uk': 'GB',
      'angleterre': 'GB',
      'england': 'GB',
      'portugal': 'PT',
      'belgique': 'BE',
      'belgium': 'BE',
      'belgië': 'BE',
      'suisse': 'CH',
      'switzerland': 'CH',
      'schweiz': 'CH',
      'pays-bas': 'NL',
      'netherlands': 'NL',
      'holland': 'NL',
      'nederland': 'NL'
    };

    return mapping[countryName.toLowerCase()] || '';
  }
}

export const cityAutocomplete = new CityAutocomplete();
