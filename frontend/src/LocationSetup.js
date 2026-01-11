import React, { useState, useEffect } from 'react';
import { MapPin, Search, Save } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function LocationSetup({ user, onLocationSaved }) {
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    country: 'US',
    zipCode: '',
    searchRadius: 50
  });
  const [loading, setLoading] = useState(false);
  const [geolocating, setGeolocating] = useState(false);

  useEffect(() => {
    // Load user's current location if available
    const loadUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const profile = await response.json();
          if (profile.city) {
            setFormData({
              city: profile.city || '',
              state: profile.state || '',
              country: profile.country || 'US',
              zipCode: profile.zipCode || '',
              searchRadius: profile.searchRadius || 50
            });
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Use reverse geocoding to get city/state
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          setFormData(prev => ({
            ...prev,
            city: data.address.city || data.address.town || data.address.village || '',
            state: data.address.state || '',
            country: data.address.country_code?.toUpperCase() || 'US',
            zipCode: data.address.postcode || ''
          }));

          // Save coordinates along with location
          await saveLocation({
            ...formData,
            city: data.address.city || data.address.town || data.address.village || '',
            state: data.address.state || '',
            country: data.address.country_code?.toUpperCase() || 'US',
            zipCode: data.address.postcode || '',
            latitude,
            longitude
          });
        } catch (error) {
          console.error('Geocoding error:', error);
          // Still save coordinates even if geocoding fails
          await saveLocation({
            ...formData,
            latitude,
            longitude
          });
        }

        setGeolocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Failed to get your location. Please enter it manually.');
        setGeolocating(false);
      }
    );
  };

  const saveLocation = async (data = formData) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // If we don't have coordinates yet, geocode the address
      let locationData = { ...data };

      if (!locationData.latitude && data.city && data.state) {
        try {
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(data.city)}&state=${encodeURIComponent(data.state)}&country=${data.country}&format=json&limit=1`
          );
          const geocodeData = await geocodeResponse.json();

          if (geocodeData.length > 0) {
            locationData.latitude = parseFloat(geocodeData[0].lat);
            locationData.longitude = parseFloat(geocodeData[0].lon);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/user/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(locationData)
      });

      if (response.ok) {
        const result = await response.json();
        if (onLocationSaved) {
          onLocationSaved(result.user);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save location');
      }
    } catch (error) {
      console.error('Save location error:', error);
      alert('Failed to save location. Please try again.');
    }

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveLocation();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <MapPin className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Set Your Location</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Add your location to find local collaborators in your area. This helps us match you with creators nearby for in-person collaborations.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <button
            type="button"
            onClick={handleGeolocation}
            disabled={geolocating}
            className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            {geolocating ? 'Detecting location...' : 'Use My Current Location'}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or enter manually</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="San Francisco"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CA"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="94102"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius (miles)
            </label>
            <input
              type="number"
              name="searchRadius"
              value={formData.searchRadius}
              onChange={handleInputChange}
              min="5"
              max="500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save Location'}
        </button>
      </form>
    </div>
  );
}
