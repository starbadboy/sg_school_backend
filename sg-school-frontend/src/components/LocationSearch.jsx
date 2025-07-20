import React, { useState } from 'react'
import { Search, MapPin, Loader2, AlertCircle } from 'lucide-react'
import axios from 'axios'

const LocationSearch = ({ onSearchResults }) => {
  const [address, setAddress] = useState('')
  const [radius, setRadius] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const radiusOptions = [
    { value: 1, label: '1km', description: 'Highest priority in P1 registration' },
    { value: 2, label: '2km', description: 'Second priority in P1 registration' },
    { value: 5, label: '5km', description: 'Extended search area' }
  ]

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

  const suggestions = [
    'Ang Mo Kio Avenue 6',
    'Jurong West Street 42',
    'Tampines Avenue 9',
    'Woodlands Drive 62',
    'Sengkang Central',
    'Punggol Field'
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Input */}
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Enter Your Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., Ang Mo Kio Avenue 6, Singapore"
                className="input-field pl-10"
                disabled={loading}
              />
            </div>
            <p className="text-sm text-gray-500">
              Enter your Singapore address, postal code, or nearby landmark
            </p>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setAddress(suggestion)}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Radius Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Search Radius
            </label>
            <div className="grid grid-cols-3 gap-3">
              {radiusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`
                    relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${radius === option.value 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="radius"
                    value={option.value}
                    checked={radius === option.value}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className="font-semibold text-lg text-gray-900">{option.label}</div>
                  <div className="text-xs text-center text-gray-600 mt-1">
                    {option.description}
                  </div>
                  {radius === option.value && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !address.trim()}
            className="w-full btn-primary py-3 text-lg font-semibold"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching Schools...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Find Primary Schools</span>
              </div>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Distance Priority in P1 Registration</p>
              <p className="text-blue-700">
                Schools prioritize students by distance during Phase 2C registration. 
                Living within 1km gives the highest priority, followed by 1-2km range.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationSearch 