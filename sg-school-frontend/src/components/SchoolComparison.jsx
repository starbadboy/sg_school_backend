import React, { useState } from 'react'
import { ArrowLeft, BarChart3, MapPin, Users, TrendingUp, AlertTriangle, Phone, Mail, Globe, Star, Trophy, Shield, Target, CheckCircle, Award } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const SchoolComparison = ({ schools, onBack }) => {
  const [selectedMetric, setSelectedMetric] = useState('competitiveness')

  if (schools.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="card-elevated text-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-4">No Schools Selected</h3>
          <p className="text-xl text-slate-600 mb-8">Please select at least one school to compare.</p>
          <button onClick={onBack} className="btn-primary">
            Back to Results
          </button>
        </div>
      </div>
    )
  }

  const getCompetitivenessScore = (school) => {
    const p1Data = school.p1_data
    if (!p1Data?.phases?.phase_2c) return 0
    
    const phase2c = p1Data.phases.phase_2c
    if (!phase2c.applied || phase2c.applied === 0) return 0
    
    // Calculate success rate for applicants
    const successRate = (phase2c.taken / phase2c.applied) * 100
    
    // CORRECTED: Lower success rate = MORE competitive (higher score)
    if (successRate >= 90) return 1 // Less Competitive
    if (successRate >= 70) return 2 // Moderately Competitive  
    if (successRate >= 50) return 3 // Highly Competitive
    return 4 // Very Competitive
  }

  const getSuccessRate = (school) => {
    const p1Data = school.p1_data
    if (!p1Data?.phases?.phase_2c) return 0
    
    const phase2c = p1Data.phases.phase_2c
    if (!phase2c.applied || phase2c.applied === 0) return 100
    
    return Math.round((phase2c.taken / phase2c.applied) * 100)
  }

  const prepareChartData = () => {
    const metrics = {
      competitiveness: schools.map(school => ({
        name: school.name.split(' ').slice(0, 2).join(' '), // Shorten names
        value: getCompetitivenessScore(school),
        fullName: school.name,
        color: getCompetitivenessScore(school) >= 3 ? '#ef4444' : getCompetitivenessScore(school) >= 2 ? '#f59e0b' : '#10b981'
      })),
      distance: schools.map(school => ({
        name: school.name.split(' ').slice(0, 2).join(' '),
        value: school.distance,
        fullName: school.name,
        color: school.distance <= 1 ? '#10b981' : school.distance <= 2 ? '#3b82f6' : '#8b5cf6'
      })),
      successRate: schools.map(school => ({
        name: school.name.split(' ').slice(0, 2).join(' '),
        value: getSuccessRate(school),
        fullName: school.name,
        color: getSuccessRate(school) >= 80 ? '#10b981' : getSuccessRate(school) >= 60 ? '#f59e0b' : '#ef4444'
      })),
      vacancy: schools.map(school => ({
        name: school.name.split(' ').slice(0, 2).join(' '),
        value: school.p1_data?.total_vacancy || 0,
        fullName: school.name,
        color: '#3b82f6'
      }))
    }

    return metrics[selectedMetric] || []
  }

  const getMetricLabel = () => {
    const labels = {
      competitiveness: 'Competition Level',
      distance: 'Distance (km)',
      successRate: 'Success Rate (%)',
      vacancy: 'Total P1 Vacancy'
    }
    return labels[selectedMetric] || ''
  }

  const getCompetitivenessText = (score) => {
    const levels = {
      1: 'Less Competitive',
      2: 'Moderately Competitive', 
      3: 'Highly Competitive',
      4: 'Very Competitive'
    }
    return levels[score] || 'Unknown'
  }

  const getRecommendation = (school) => {
    const successRate = getSuccessRate(school)
    const distance = school.distance
    const isAlumni = false // This would come from user input
    const hasVolunteered = false // This would come from user input

    if (successRate >= 90) {
      return { text: '✅ Excellent chance of admission', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
    } else if (successRate >= 70) {
      return { text: '⚠️ Good chance - consider as backup', color: 'text-amber-600 bg-amber-50 border-amber-200' }
    } else if (distance <= 1) {
      return { text: '🎯 Priority zone helps despite competition', color: 'text-blue-600 bg-blue-50 border-blue-200' }
    } else {
      return { text: '🔴 Very competitive - need strong backup plan', color: 'text-red-600 bg-red-50 border-red-200' }
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="card-gradient border-2 border-emerald-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={onBack} className="btn-ghost p-3 rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">School Comparison</h1>
                <p className="text-lg text-slate-600">Compare {schools.length} selected schools side-by-side</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Comparison Chart */}
      <div className="card-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Performance Analytics</h3>
          </div>
          
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="input-field py-3 px-4 text-sm"
          >
            <option value="competitiveness">Competition Level</option>
            <option value="distance">Distance from You</option>
            <option value="successRate">P1 Success Rate</option>
            <option value="vacancy">Available Places</option>
          </select>
        </div>

        <div className="h-96 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}${selectedMetric === 'distance' ? 'km' : selectedMetric === 'successRate' ? '%' : ''}`,
                  props.payload.fullName
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill={(entry) => entry.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600">{getMetricLabel()}</p>
        </div>
      </div>

      {/* Enhanced Detailed Comparison Table */}
      <div className="card-elevated">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
            <Trophy className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Detailed Comparison</h3>
        </div>
        
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-4 px-6 font-bold text-slate-900 bg-slate-50 rounded-tl-xl">School</th>
                <th className="text-left py-4 px-6 font-bold text-slate-900 bg-slate-50">Distance</th>
                <th className="text-left py-4 px-6 font-bold text-slate-900 bg-slate-50">Competition</th>
                <th className="text-left py-4 px-6 font-bold text-slate-900 bg-slate-50">Vacancy</th>
                <th className="text-left py-4 px-6 font-bold text-slate-900 bg-slate-50">Success Rate</th>
                <th className="text-left py-4 px-6 font-bold text-slate-900 bg-slate-50 rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school, index) => {
                const recommendation = getRecommendation(school)
                return (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{school.name}</div>
                          <div className="text-sm text-slate-600">{school.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-900">{school.distance}km</span>
                        {school.distance <= 1 && (
                          <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                            Priority Zone
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold border ${
                        getCompetitivenessScore(school) === 4 ? 'bg-red-50 text-red-700 border-red-200' :
                        getCompetitivenessScore(school) === 3 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        getCompetitivenessScore(school) === 2 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {getCompetitivenessText(getCompetitivenessScore(school))}
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="font-bold text-slate-900 text-lg">
                        {school.p1_data?.total_vacancy || 'N/A'}
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="font-bold text-slate-900 text-lg">
                          {getSuccessRate(school)}%
                        </div>
                        {getSuccessRate(school) >= 80 && (
                          <Star className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold border ${
                        school.p1_data?.balloted ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {school.p1_data?.balloted ? 'Balloted' : 'Non-balloted'}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced School Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school, index) => {
          const recommendation = getRecommendation(school)
          return (
            <div key={index} className="card-hover border-l-4 border-l-blue-500">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-lg">{school.name}</h4>
                    <p className="text-sm text-slate-600 mt-1">{school.distance}km from your location</p>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-3">
                  {school.phone && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-700 font-medium">{school.phone}</span>
                    </div>
                  )}
                  {school.email && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-700 font-medium truncate">{school.email}</span>
                    </div>
                  )}
                  {school.website && (
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                      <Globe className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-700 font-medium">Official Website</span>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="card-gradient border border-slate-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-slate-900">
                        {school.p1_data?.total_vacancy || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-600">P1 Vacancy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {getSuccessRate(school)}%
                      </div>
                      <div className="text-xs text-slate-600">Success Rate</div>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`p-4 rounded-xl text-sm font-medium border ${recommendation.color}`}>
                  {recommendation.text}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enhanced Summary Insights */}
      <div className="card-elevated">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
            <Target className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Strategic Insights</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span>Recommended Strategy</span>
            </h4>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Apply to less competitive schools as your safety net</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Consider volunteering at highly competitive schools for Phase 2B</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Priority is given to families within 1km distance</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Alumni connections provide significant Phase 2A advantage</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span>Important Considerations</span>
            </h4>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Balloted schools had extremely high demand in previous years</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Success rates are based on 2024 Phase 2C actual data</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Distance priority applies specifically to Phase 2C registration</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Consider school culture and programs beyond pure statistics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SchoolComparison 