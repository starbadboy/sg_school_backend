import React, { useState } from 'react'
import { MapPin, Phone, Mail, Globe, Users, TrendingUp, AlertTriangle, CheckCircle, Brain, Filter, SortAsc } from 'lucide-react'
import P1DataChart from './P1DataChart'

const SchoolResults = ({ results, userLocation, selectedSchools, onSchoolSelect, onGenerateStrategy }) => {
  const [sortBy, setSortBy] = useState('distance')
  const [filterBy, setFilterBy] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const schools = results?.schools || []

  const getCompetitivenessLevel = (school) => {
    const p1Data = school.p1_data
    if (!p1Data) return 'unknown'
    
    const phase2c = p1Data.phases?.phase_2c
    if (!phase2c) return 'unknown'
    
    const ratio = phase2c.applied / phase2c.taken
    if (ratio > 2) return 'very-high'
    if (ratio > 1.5) return 'high'
    if (ratio > 1.2) return 'medium'
    return 'low'
  }

  const getCompetitivenessColor = (level) => {
    switch (level) {
      case 'very-high': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCompetitivenessText = (level) => {
    switch (level) {
      case 'very-high': return 'Very Competitive'
      case 'high': return 'Highly Competitive'
      case 'medium': return 'Moderately Competitive'
      case 'low': return 'Less Competitive'
      default: return 'Unknown'
    }
  }

  const getSortedAndFilteredSchools = () => {
    let filteredSchools = [...schools]

    // Apply filters
    if (filterBy !== 'all') {
      filteredSchools = filteredSchools.filter(school => {
        const level = getCompetitivenessLevel(school)
        return level === filterBy
      })
    }

    // Apply sorting
    filteredSchools.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance
        case 'name':
          return a.name.localeCompare(b.name)
        case 'competitiveness':
          const aLevel = getCompetitivenessLevel(a)
          const bLevel = getCompetitivenessLevel(b)
          const order = ['low', 'medium', 'high', 'very-high']
          return order.indexOf(aLevel) - order.indexOf(bLevel)
        default:
          return 0
      }
    })

    return filteredSchools
  }

  const isSchoolSelected = (school) => {
    return selectedSchools.some(s => s.name === school.name)
  }

  const filteredSchools = getSortedAndFilteredSchools()

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {schools.length} Schools Found
          </h2>
          <p className="text-gray-600">
            Near {userLocation?.address} • Within {results.radius || 2}km radius
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sort */}
          <div className="flex items-center space-x-2">
            <SortAsc className="h-4 w-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="distance">Distance</option>
              <option value="name">Name</option>
              <option value="competitiveness">Competitiveness</option>
            </select>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="all">All Schools</option>
              <option value="low">Less Competitive</option>
              <option value="medium">Moderately Competitive</option>
              <option value="high">Highly Competitive</option>
              <option value="very-high">Very Competitive</option>
            </select>
          </div>

          {/* Generate Strategy Button */}
          {selectedSchools.length > 0 && (
            <button
              onClick={onGenerateStrategy}
              className="btn-primary flex items-center space-x-2"
            >
              <Brain className="h-4 w-4" />
              <span>Generate AI Strategy</span>
            </button>
          )}
        </div>
      </div>

      {/* School Cards */}
      <div className="grid gap-6">
        {filteredSchools.map((school, index) => (
          <SchoolCard
            key={school.name}
            school={school}
            isSelected={isSchoolSelected(school)}
            onSelect={() => onSchoolSelect(school)}
            rank={index + 1}
          />
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schools match your filters</h3>
          <p className="text-gray-600">Try adjusting your filter criteria</p>
        </div>
      )}
    </div>
  )
}

const SchoolCard = ({ school, isSelected, onSelect, rank }) => {
  const [showDetails, setShowDetails] = useState(false)
  
  const competitivenessLevel = getCompetitivenessLevel(school)
  const competitivenessColor = getCompetitivenessColor(competitivenessLevel)
  const competitivenessText = getCompetitivenessText(competitivenessLevel)

  const p1Data = school.p1_data

  return (
    <div className={`card-hover border-l-4 ${isSelected ? 'border-l-primary-500 bg-primary-50' : 'border-l-gray-200'}`}>
      <div className="flex items-start justify-between">
        {/* School Info */}
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold text-lg">#{rank}</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{school.distance}km away</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs border ${competitivenessColor}`}>
                      {competitivenessText}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onSelect}
                  className={`p-2 rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{school.phone}</span>
                </div>
                {school.email && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{school.email}</span>
                  </div>
                )}
                {school.website && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Globe className="h-4 w-4" />
                    <span className="truncate">Website</span>
                  </div>
                )}
              </div>

              {/* P1 Quick Stats */}
              {p1Data && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Total Vacancy</div>
                      <div className="font-semibold text-gray-900">{p1Data.total_vacancy}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Phase 2C Applied</div>
                      <div className="font-semibold text-gray-900">{p1Data.phases?.phase_2c?.applied || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Success Rate</div>
                      <div className="font-semibold text-gray-900">
                        {p1Data.phases?.phase_2c ? 
                          `${Math.round((p1Data.phases.phase_2c.taken / p1Data.phases.phase_2c.applied) * 100)}%` : 
                          'N/A'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Balloted</div>
                      <div className={`font-semibold ${p1Data.balloted ? 'text-red-600' : 'text-green-600'}`}>
                        {p1Data.balloted ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="btn-outline text-sm"
                >
                  {showDetails ? 'Hide Details' : 'View P1 Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed P1 Data */}
      {showDetails && p1Data && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <P1DataChart school={school} />
        </div>
      )}
    </div>
  )
}

// Helper functions (moved outside component to avoid re-creation)
const getCompetitivenessLevel = (school) => {
  const p1Data = school.p1_data
  if (!p1Data) return 'unknown'
  
  const phase2c = p1Data.phases?.phase_2c
  if (!phase2c || !phase2c.applied || phase2c.applied === 0) return 'unknown'
  
  // Calculate success rate for applicants
  const successRate = (phase2c.taken / phase2c.applied) * 100
  
  // CORRECTED: Lower success rate = MORE competitive
  if (successRate >= 90) return 'low'        // 90-100% success = Less Competitive
  if (successRate >= 70) return 'medium'     // 70-89% success = Moderately Competitive  
  if (successRate >= 50) return 'high'       // 50-69% success = Highly Competitive
  return 'very-high'                         // <50% success = Very Competitive
}

const getCompetitivenessColor = (level) => {
  switch (level) {
    case 'very-high': return 'text-red-600 bg-red-50 border-red-200'
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low': return 'text-green-600 bg-green-50 border-green-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getCompetitivenessText = (level) => {
  switch (level) {
    case 'very-high': return 'Very Competitive'
    case 'high': return 'Highly Competitive'
    case 'medium': return 'Moderately Competitive'
    case 'low': return 'Less Competitive'
    default: return 'Unknown'
  }
}

export default SchoolResults 