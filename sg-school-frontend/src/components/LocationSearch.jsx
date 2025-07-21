import React, { useState } from 'react'
import { Search, MapPin, Loader2, AlertCircle, Navigation, Sparkles } from 'lucide-react'
import axios from 'axios'

const LocationSearch = ({ onSearchResults }) => {
  const [address, setAddress] = useState('')
  const [radius, setRadius] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/schools/search', {
        address: address.trim(),
        radius: radius
      })

      if (response.data.schools && response.data.schools.length > 0) {
        onSearchResults(response.data, response.data.user_location)
      } else {
        setError('No schools found in the specified area. Try increasing the search radius.')
      }
    } catch (err) {
      console.error('Search error:', err)
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Invalid address. Please check and try again.')
      } else {
        setError('Unable to search for schools. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="max-w-3xl mx-auto">
      {/* Beautiful Search Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 relative overflow-hidden">
        {/* Background gradient accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-transparent"></div>
        
        <div className="relative z-10 text-center space-y-8">
          {/* Search Icon with Sparkle */}
          <div className="relative inline-flex">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Search className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Discover Your Perfect School Match
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Enter your location to unlock personalized school recommendations with detailed P1 insights
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            <div className="text-left space-y-3">
              <label htmlFor="address" className="block text-lg font-semibold text-gray-900">
                Your Address in Singapore
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., Ang Mo Kio Avenue 6, Singapore 560123"
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg shadow-sm"
                  disabled={loading}
                />
                {address && !loading && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  </div>
                )}
                {loading && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Search Radius Selector */}
            <div className="text-left space-y-3">
              <label htmlFor="radius" className="block text-lg font-semibold text-gray-900">
                Search Radius
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 5].map((radiusOption) => (
                  <button
                    key={radiusOption}
                    type="button"
                    onClick={() => setRadius(radiusOption)}
                    className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                      radius === radiusOption
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {radiusOption}km
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {radius === 1 && "Very close schools only - ideal for priority zone"}
                {radius === 2 && "Balanced selection - recommended for most families"}
                {radius === 3 && "Good variety of options within reasonable distance"}
                {radius === 5 && "Maximum choice - includes all accessible schools"}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !address.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Searching Schools...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Find My Perfect Schools</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Helper Text */}
          <p className="text-sm text-gray-500 flex items-center justify-center space-x-2">
            <Navigation className="h-4 w-4" />
            <span>Choose your preferred search radius • Currently searching within {radius}km</span>
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 max-w-xl mx-auto">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Search Error</h4>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationSearch 