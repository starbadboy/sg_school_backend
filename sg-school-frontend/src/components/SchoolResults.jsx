import React, { useState } from 'react'
import { MapPin, Phone, Mail, Globe, Users, TrendingUp, AlertTriangle, CheckCircle, Brain, Filter, SortAsc, Star, Trophy, Shield, Zap } from 'lucide-react'
import P1DataChart from './P1DataChart'

const SchoolResults = ({ results, userLocation, selectedSchools, onSchoolSelect, onGenerateStrategy }) => {
  const [sortBy, setSortBy] = useState('distance')
  const [filterBy, setFilterBy] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const schools = results?.schools || []

  const getCompetitivenessLevel = (school) => {
    const p1Data = school.p1_data
    if (!p1Data) return 'unknown'
    
    // Use new competitiveness tier from comprehensive data
    if (p1Data.competitiveness_tier) {
      const tier = p1Data.competitiveness_tier.toLowerCase().replace(' ', '-')
      return tier
    }
    
    // Fallback to calculation for legacy data
    const phase2c = p1Data.phases?.phase_2c
    if (!phase2c) return 'unknown'
    
    const applicants = phase2c.applicants || phase2c.applied || 0
    const vacancies = phase2c.vacancies || phase2c.vacancy || 1
    const ratio = applicants / vacancies
    
    if (ratio >= 2) return 'very-high'
    if (ratio >= 1.5) return 'high'
    if (ratio >= 1.2) return 'medium'
    return 'low'
  }

  const getCompetitivenessColor = (level) => {
    switch (level) {
      case 'very-high': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
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
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Results Header */}
      <div className="card-gradient border-2 border-blue-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {schools.length} School{schools.length !== 1 ? 's' : ''} Found
                </h2>
                <p className="text-lg text-slate-600">
                  Near {userLocation?.address} • Within {results.radius || 2}km radius
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
            {/* Sort Controls */}
            <div className="flex items-center space-x-3">
              <SortAsc className="h-5 w-5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field py-2 px-3 text-sm min-w-0"
              >
                <option value="distance">Sort by Distance</option>
                <option value="name">Sort by Name</option>
                <option value="competitiveness">Sort by Competition</option>
              </select>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-slate-500" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="input-field py-2 px-3 text-sm min-w-0"
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
                className="btn-primary flex items-center space-x-2 shadow-lg"
              >
                <Brain className="h-4 w-4" />
                <span>Generate AI Strategy</span>
                <div className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {selectedSchools.length}
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* School Cards */}
      <div className="space-y-6">
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

      {/* Empty State */}
      {filteredSchools.length === 0 && (
        <div className="card-elevated text-center py-16">
          <AlertTriangle className="h-16 w-16 text-slate-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 mb-4">No schools match your filters</h3>
          <p className="text-lg text-slate-600 mb-8">Try adjusting your filter criteria to see more results</p>
          <button
            onClick={() => setFilterBy('all')}
            className="btn-primary"
          >
            Show All Schools
          </button>
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

  const getSuccessRate = () => {
    if (!p1Data?.phases?.phase_2c) return 0
    const phase2c = p1Data.phases.phase_2c
    const applicants = phase2c.applicants || phase2c.applied || 0
    const taken = phase2c.taken || 0
    if (applicants === 0) return 100
    return Math.round((taken / applicants) * 100)
  }

  const getDistancePriority = () => {
    if (school.distance <= 1) return { text: 'Priority 1', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
    if (school.distance <= 2) return { text: 'Priority 2', color: 'text-blue-600 bg-blue-50 border-blue-200' }
    return { text: 'Priority 3+', color: 'text-purple-600 bg-purple-50 border-purple-200' }
  }

  const distancePriority = getDistancePriority()

  return (
    <div className={`card-hover border-l-4 transition-all duration-300 animate-slide-up group ${
      isSelected 
        ? 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent shadow-lg' 
        : 'border-l-slate-200 hover:border-l-blue-400'
    }`}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Rank Badge */}
            <div className="flex-shrink-0">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isSelected 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600'
              }`}>
                <span className="text-xl font-bold">#{rank}</span>
              </div>
            </div>

            {/* School Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {school.name}
                </h3>
                <p className="text-slate-600 mt-1">{school.address}</p>
              </div>

              {/* Key Metrics */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold text-slate-700">{school.distance}km away</span>
                </div>
                
                <div className={`px-3 py-1.5 rounded-xl border text-sm font-semibold ${distancePriority.color}`}>
                  {distancePriority.text}
                </div>
                
                <div className={`px-3 py-1.5 rounded-xl border text-sm font-semibold ${competitivenessColor}`}>
                  {competitivenessText}
                </div>

                {p1Data?.balloted && (
                  <div className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-700">Balloted</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selection Button */}
          <button
            onClick={onSelect}
            className={`p-4 rounded-2xl transition-all duration-300 ${
              isSelected 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600 hover:shadow-md'
            }`}
          >
            <CheckCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {school.phone && (
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <Phone className="h-5 w-5 text-slate-500" />
              <span className="text-slate-700 font-medium">{school.phone}</span>
            </div>
          )}
          {school.email && (
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <Mail className="h-5 w-5 text-slate-500" />
              <span className="text-slate-700 font-medium truncate">{school.email}</span>
            </div>
          )}
          {school.website && (
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <Globe className="h-5 w-5 text-slate-500" />
              <span className="text-slate-700 font-medium">Visit Website</span>
            </div>
          )}
        </div>

        {/* P1 Statistics */}
        {p1Data && (
          <div className="card-gradient border border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-slate-900">{p1Data.total_vacancies}</div>
                <div className="text-sm text-slate-600">Total Vacancy</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-slate-900">{p1Data.phases?.phase_2c?.applicants || p1Data.phases?.phase_2c?.applied || 0}</div>
                <div className="text-sm text-slate-600">Phase 2C Applied</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-2xl font-bold text-emerald-600">{getSuccessRate()}%</div>
                <div className="text-sm text-slate-600">Success Rate</div>
              </div>
              <div className="text-center space-y-2">
                <div className={`text-2xl font-bold ${p1Data.balloted ? 'text-red-600' : 'text-emerald-600'}`}>
                  {p1Data.balloted ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-slate-600">Balloted</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-secondary flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>{showDetails ? 'Hide P1 Data' : 'View P1 Analytics'}</span>
          </button>

          {getSuccessRate() >= 80 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <Star className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">Good Chances</span>
            </div>
          )}

          {school.distance <= 1 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">Priority Zone</span>
            </div>
          )}
        </div>

        {/* Detailed P1 Data */}
        {showDetails && p1Data && (
          <div className="mt-6 pt-6 border-t border-slate-200 animate-slide-down">
            <P1DataChart school={school} />
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions (moved outside component to avoid re-creation)
const getCompetitivenessLevel = (school) => {
  const p1Data = school.p1_data
  if (!p1Data) return 'unknown'
  
  // Use new competitiveness tier from comprehensive data
  if (p1Data.competitiveness_tier) {
    const tier = p1Data.competitiveness_tier.toLowerCase().replace(' ', '-')
    return tier
  }
  
  // Fallback to calculation for legacy data
  const phase2c = p1Data.phases?.phase_2c
  if (!phase2c) return 'unknown'
  
  const applicants = phase2c.applicants || phase2c.applied || 0
  const taken = phase2c.taken || 0
  if (applicants === 0) return 'unknown'
  
  // Calculate success rate for applicants
  const successRate = (taken / applicants) * 100
  
  // CORRECTED: Lower success rate = MORE competitive
  if (successRate >= 90) return 'low'        // 90-100% success = Less Competitive
  if (successRate >= 70) return 'medium'     // 70-89% success = Moderately Competitive  
  if (successRate >= 50) return 'high'       // 50-69% success = Highly Competitive
  return 'very-high'                         // <50% success = Very Competitive
}

const getCompetitivenessColor = (level) => {
  switch (level) {
    case 'very-high': return 'text-red-600 bg-red-50 border-red-200'
    case 'high': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'low': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    default: return 'text-slate-600 bg-slate-50 border-slate-200'
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