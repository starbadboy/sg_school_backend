import React, { useState } from 'react'
import { MapPin, Phone, Mail, Globe, Users, TrendingUp, AlertTriangle, CheckCircle, Brain, Filter, SortAsc, Star, Trophy, Shield, Zap, Map, List, Navigation, Award, Target, Clock, BarChart3 } from 'lucide-react'
import P1DataChart from './P1DataChart'
import SchoolMap from './SchoolMap'

const SchoolResults = ({ results, userLocation, selectedSchools, onSchoolSelect, onGenerateStrategy, onAddToComparison, comparisonSchools, onShowComparison }) => {
  const [sortBy, setSortBy] = useState('distance')
  const [filterBy, setFilterBy] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [expandedSchool, setExpandedSchool] = useState(null)

  const schools = results?.schools || []

  const getCompetitivenessLevel = (school) => {
    const p1Data = school.p1_data
    if (!p1Data) return 'unknown'
    
    if (p1Data.competitiveness_tier) {
      return p1Data.competitiveness_tier.toLowerCase()
    }
    
    const phase2c = p1Data.phases?.phase_2c
    if (!phase2c) return 'unknown'
    
    const applicants = phase2c.applicants || phase2c.applied || 0
    const vacancies = phase2c.vacancies || phase2c.vacancy || 1
    const ratio = applicants / vacancies
    
    if (ratio >= 2) return 'very high'
    if (ratio >= 1.5) return 'high'
    if (ratio >= 1.2) return 'medium'
    return 'low'
  }

  const getCompetitivenessDisplay = (level) => {
    switch (level) {
      case 'very high':
        return { text: 'Very Competitive', color: 'bg-red-100 text-red-700 border border-red-200', icon: '🔴' }
      case 'high':
        return { text: 'Highly Competitive', color: 'bg-orange-100 text-orange-700 border border-orange-200', icon: '🟠' }
      case 'medium':
        return { text: 'Moderately Competitive', color: 'bg-yellow-100 text-yellow-700 border border-yellow-200', icon: '🟡' }
      case 'low':
        return { text: 'Less Competitive', color: 'bg-green-100 text-green-700 border border-green-200', icon: '🟢' }
      case 'very low':
        return { text: 'Very Low Competition', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: '🟢' }
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-700 border border-gray-200', icon: '⚪' }
    }
  }

  const getPriorityZone = (distance) => {
    if (distance <= 1) return { text: 'Priority 1 (<1km)', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' }
    if (distance <= 2) return { text: 'Priority 2 (1-2km)', color: 'bg-blue-100 text-blue-700 border border-blue-200' }
    return { text: 'Priority 3+ (>2km)', color: 'bg-purple-100 text-purple-700 border border-purple-200' }
  }

  const getSuccessRate = (school) => {
    const p1Data = school.p1_data
    if (!p1Data?.phases) return 0
    
    // Calculate overall success rate from all phases
    const phases = ['phase_1', 'phase_2a', 'phase_2b', 'phase_2c', 'phase_2c_supp']
    let totalApplied = 0
    let totalTaken = 0
    
    phases.forEach(phaseKey => {
      const phase = p1Data.phases[phaseKey]
      if (phase) {
        totalApplied += phase.applicants || phase.applied || 0
        totalTaken += phase.taken || 0
      }
    })
    
    return totalApplied > 0 ? Math.round((totalTaken / totalApplied) * 100) : 0
  }

  const getSortedSchools = () => {
    let filteredSchools = [...schools]

    if (filterBy !== 'all') {
      filteredSchools = filteredSchools.filter(school => {
        const level = getCompetitivenessLevel(school)
        return level === filterBy
      })
    }

    filteredSchools.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance
        case 'name':
          return a.name.localeCompare(b.name)
        case 'competitiveness':
          const aLevel = getCompetitivenessLevel(a)
          const bLevel = getCompetitivenessLevel(b)
          const order = ['low', 'medium', 'high', 'very high']
          return order.indexOf(bLevel) - order.indexOf(aLevel) // Most competitive first
        default:
          return 0
      }
    })

    return filteredSchools
  }

  const isSchoolSelected = (school) => {
    return selectedSchools.some(s => s.name === school.name)
  }

  const filteredSchools = getSortedSchools()

  return (
    <div className="space-y-6">
      {/* Clean Results Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          {/* Left side - Results info */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {filteredSchools.length} School{filteredSchools.length !== 1 ? 's' : ''} Found
              </h1>
              <p className="text-gray-600">
                Near {userLocation?.address?.split(',')[0] || 'your location'} • Within 2km radius
              </p>
            </div>
          </div>

          {/* Right side - View controls */}
          <div className="flex items-center space-x-3">
            <div className="flex bg-white rounded-xl border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'map' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="distance">Sort by Distance</option>
            <option value="name">Sort by Name</option>
            <option value="competitiveness">Sort by Competitiveness</option>
          </select>
        </div>
        <div className="flex-1">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Schools</option>
            <option value="low">Less Competitive</option>
            <option value="medium">Moderately Competitive</option>
            <option value="high">Highly Competitive</option>
            <option value="very high">Very Competitive</option>
          </select>
        </div>
      </div>

             {/* Strategy Generation Button */}
       {selectedSchools.length > 0 && (
         <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white">
           <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
             <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                 <Brain className="h-6 w-6 text-white" />
               </div>
               <div>
                 <h3 className="text-xl font-bold">Ready for AI Strategy?</h3>
                 <p className="text-purple-100">
                   {selectedSchools.length} school{selectedSchools.length !== 1 ? 's' : ''} selected • Get personalized admission recommendations
                 </p>
               </div>
             </div>
             <button
               onClick={onGenerateStrategy}
               className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 flex items-center space-x-2"
             >
               <Zap className="h-5 w-5" />
               <span>Generate Strategy</span>
             </button>
           </div>
         </div>
       )}

       {/* School Comparison Button */}
       {comparisonSchools && comparisonSchools.length > 0 && (
         <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
           <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
             <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                 <BarChart3 className="h-6 w-6 text-white" />
               </div>
               <div>
                 <h3 className="text-xl font-bold">Schools Ready for Comparison</h3>
                 <p className="text-emerald-100">
                   {comparisonSchools.length} school{comparisonSchools.length !== 1 ? 's' : ''} added • Compare success rates, distances, and P1 data
                 </p>
                 <p className="text-emerald-200 text-sm">
                   Schools: {comparisonSchools.map(s => s.name).join(', ')}
                 </p>
               </div>
             </div>
             <button
               onClick={onShowComparison}
               className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-200 flex items-center space-x-2"
             >
               <BarChart3 className="h-5 w-5" />
               <span>View Comparison</span>
             </button>
           </div>
         </div>
       )}



      {/* Schools List/Map */}
      {viewMode === 'map' ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <SchoolMap
            schools={filteredSchools}
            userLocation={userLocation}
            selectedSchools={selectedSchools}
            onSchoolSelect={onSchoolSelect}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSchools.map((school, index) => {
            const competitiveness = getCompetitivenessDisplay(getCompetitivenessLevel(school))
            const priority = getPriorityZone(school.distance)
            const successRate = getSuccessRate(school)
            const isSelected = isSchoolSelected(school)

            return (
              <div
                key={school.name}
                className={`bg-white rounded-2xl border-2 transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="p-6">
                  {/* School Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                        'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}>
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                          {school.name}
                        </h2>
                        <p className="text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {school.address}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        onSchoolSelect(school)
                        onAddToComparison(school)
                      }}
                      className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300 text-gray-400 hover:border-gray-400'
                      }`}
                      title="Select for AI Strategy & Add to Comparison"
                    >
                      <CheckCircle className="h-5 w-5 mx-auto" />
                    </button>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{school.distance}km</div>
                      <div className="text-sm text-gray-600">Distance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{school.p1_data?.total_vacancies || 'N/A'}</div>
                      <div className="text-sm text-gray-600">Total Vacancy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{successRate}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {school.p1_data?.balloted ? 'Yes' : 'No'}
                      </div>
                      <div className="text-sm text-gray-600">Balloted</div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${priority.color}`}>
                      {priority.text}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${competitiveness.color}`}>
                      {competitiveness.icon} {competitiveness.text}
                    </span>
                    {school.p1_data?.balloted && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 border border-red-200">
                        ⚠️ Balloted School
                      </span>
                    )}
                  </div>

                                     {/* Action Buttons */}
                   <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                     <button
                       onClick={() => setExpandedSchool(expandedSchool === school.name ? null : school.name)}
                       className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
                     >
                       <TrendingUp className="h-4 w-4" />
                       <span>{expandedSchool === school.name ? 'Hide P1 Analytics' : 'View P1 Analytics'}</span>
                     </button>
                     
                     <button
                       onClick={() => onAddToComparison(school)}
                       className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                         comparisonSchools && comparisonSchools.find(s => s.name === school.name)
                           ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                           : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-emerald-500 hover:text-emerald-600'
                       }`}
                     >
                       <BarChart3 className="h-4 w-4" />
                       <span>
                         {comparisonSchools && comparisonSchools.find(s => s.name === school.name)
                           ? 'In Comparison'
                           : 'Add to Compare'
                         }
                       </span>
                     </button>
                     
                     {successRate >= 80 && (
                       <div className="flex items-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-xl border border-green-200">
                         <Star className="h-4 w-4" />
                         <span className="font-medium">Good Chances</span>
                       </div>
                     )}
                     
                     {school.distance <= 1 && (
                       <div className="flex items-center space-x-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl border border-blue-200">
                         <Target className="h-4 w-4" />
                         <span className="font-medium">Priority Zone</span>
                       </div>
                     )}
                   </div>

                   {/* Contact Information */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 mt-4">
                     <a
                       href={`tel:${school.phone}`}
                       className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                     >
                       <Phone className="h-4 w-4" />
                       <span className="text-sm">{school.phone}</span>
                     </a>
                     <a
                       href={`mailto:${school.email}`}
                       className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                     >
                       <Mail className="h-4 w-4" />
                       <span className="text-sm">{school.email}</span>
                     </a>
                     <a
                       href={school.website}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                     >
                       <Globe className="h-4 w-4" />
                       <span className="text-sm">Visit Website</span>
                     </a>
                   </div>

                   {/* Expanded P1 Analytics */}
                   {expandedSchool === school.name && (
                     <div className="mt-6 pt-6 border-t border-gray-200 animate-in slide-in-from-top duration-300">
                       <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                         <div className="flex items-center space-x-3 mb-6">
                           <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                             <TrendingUp className="h-5 w-5 text-white" />
                           </div>
                           <div>
                             <h4 className="text-lg font-bold text-gray-900">P1 Registration Analytics</h4>
                             <p className="text-gray-600">Detailed breakdown of 2024 admission data</p>
                           </div>
                         </div>
                         <P1DataChart school={school} />
                       </div>
                     </div>
                   )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No Results */}
      {filteredSchools.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Schools Found</h3>
          <p className="text-gray-600">Try adjusting your filters or search radius.</p>
        </div>
      )}
    </div>
  )
}

export default SchoolResults 