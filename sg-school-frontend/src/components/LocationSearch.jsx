import React, { useState } from 'react'
import { Search, MapPin, Loader2, AlertCircle, Navigation, Sparkles } from 'lucide-react'
import axios from 'axios'

const LocationSearch = ({ onSearchResults }) => {
  const [address, setAddress] = useState('')
  const [radius, setRadius] = useState(2)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const radiusOptions = [
    { 
      value: 1, 
      label: '1km', 
      description: 'Highest priority in P1 registration',
      priority: 'Phase 2C Priority 1',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    { 
      value: 2, 
      label: '2km', 
      description: 'Second priority in P1 registration',
      priority: 'Phase 2C Priority 2', 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      value: 5, 
      label: '5km', 
      description: 'Extended search area',
      priority: 'Comprehensive Search',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
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
    { address: 'Ang Mo Kio Avenue 6', type: 'HDB Estate' },
    { address: 'Jurong West Street 42', type: 'New Town' },
    { address: 'Tampines Avenue 9', type: 'New Town' },
    { address: 'Woodlands Drive 62', type: 'HDB Estate' },
    { address: 'Sengkang Central', type: 'Town Center' },
    { address: 'Punggol Field', type: 'Waterfront' }
  ]

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <div className="card-elevated">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl mb-4">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Find Your Perfect School</h2>
          <p className="text-slate-600">Enter your location to discover nearby primary schools with detailed P1 data</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Address Input */}
          <div className="space-y-4">
            <label htmlFor="address" className="block text-lg font-semibold text-slate-900">
              Your Address in Singapore
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MapPin className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., Ang Mo Kio Avenue 6, Singapore 560123"
                className="input-field-lg pl-14 text-lg"
                disabled={loading}
              />
              {address && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 flex items-center space-x-2">
              <Navigation className="h-4 w-4" />
              <span>Enter your Singapore address, postal code, or nearby landmark</span>
            </p>
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Popular Locations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setAddress(suggestion.address)}
                  className="text-left p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all duration-200 group hover:shadow-md hover:-translate-y-0.5"
                  disabled={loading}
                >
                  <div className="font-medium text-slate-900 group-hover:text-blue-700 transition-colors">
                    {suggestion.address}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{suggestion.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Radius Selection */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-slate-900">Search Radius</h3>
              <p className="text-slate-600">Distance affects P1 registration priority</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {radiusOptions.map((option) => (
                <label
                  key={option.value}
                  className={`
                    relative flex flex-col p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group hover:shadow-lg hover:-translate-y-1
                    ${radius === option.value 
                      ? `${option.borderColor} ${option.bgColor} shadow-lg` 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
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
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl mb-4 mx-auto flex items-center justify-center transition-all duration-300
                    ${radius === option.value 
                      ? `bg-gradient-to-r ${option.color} text-white` 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}>
                    <span className="font-bold text-lg">{option.label}</span>
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-2">
                    <div className={`font-bold text-lg transition-colors ${
                      radius === option.value ? 'text-slate-900' : 'text-slate-700'
                    }`}>
                      {option.priority}
                    </div>
                    <div className="text-sm text-slate-600 leading-relaxed">
                      {option.description}
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {radius === option.value && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="card bg-red-50 border-2 border-red-200 animate-scale-in">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Search Error</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !address.trim()}
            className="w-full btn-primary py-4 text-xl font-bold shadow-xl disabled:shadow-none"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Searching Schools...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <Search className="h-6 w-6" />
                <span>Find Primary Schools</span>
              </div>
            )}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 card-gradient border-2 border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">Distance Priority in P1 Registration</h4>
              <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                <p className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Within 1km:</strong> Highest priority during Phase 2C registration</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>1-2km range:</strong> Second priority for remaining places</span>
                </p>
                <p className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Beyond 2km:</strong> Lower priority but more school options</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationSearch 