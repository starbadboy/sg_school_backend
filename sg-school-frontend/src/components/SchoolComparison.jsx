import React, { useState } from 'react'
import { ArrowLeft, BarChart3, MapPin, Users, TrendingUp, AlertTriangle, Phone, Mail, Globe, Star, Trophy, Shield, Target, CheckCircle, Award, Calendar, BookOpen, UserCheck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const SchoolComparison = ({ schools, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!schools || schools.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Schools to Compare</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Select schools from your search results to compare their P1 data, success rates, and key metrics side-by-side.
        </p>
        <button 
          onClick={onBack} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
        >
          Back to Search Results
        </button>
      </div>
    )
  }

  const getSuccessRate = (school) => {
    const phase2c = school.p1_data?.phases?.phase_2c
    if (!phase2c?.applicants || phase2c.applicants === 0) return 100
    return Math.round((phase2c.taken / phase2c.applicants) * 100)
  }

  const getCompetitivenessLevel = (school) => {
    const tier = school.p1_data?.competitiveness_tier?.toLowerCase()
    if (tier) return tier
    
    const successRate = getSuccessRate(school)
    if (successRate >= 90) return 'low'
    if (successRate >= 70) return 'medium'
    if (successRate >= 50) return 'high'
    return 'very high'
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
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-700 border border-gray-200', icon: '⚪' }
    }
  }

  const prepareChartData = () => {
    return schools.map(school => ({
      name: school.name.split(' ').slice(0, 2).join(' '),
      fullName: school.name,
      distance: school.distance,
      successRate: getSuccessRate(school),
      totalVacancy: school.p1_data?.total_vacancies || 0,
      balloted: school.p1_data?.balloted ? 1 : 0
    }))
  }

  const phases = [
    { key: 'phase_1', name: 'Phase 1', description: 'Siblings' },
    { key: 'phase_2a', name: 'Phase 2A', description: 'Alumni/Staff/Committee' },
    { key: 'phase_2b', name: 'Phase 2B', description: 'Volunteers/Grassroots/Church' },
    { key: 'phase_2c', name: 'Phase 2C', description: 'Distance Priority' },
    { key: 'phase_2c_supp', name: 'Phase 2C(S)', description: 'Supplementary' },
    { key: 'phase_3', name: 'Phase 3', description: 'Open to All' }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'phases', name: 'Phase Comparison', icon: Calendar },
    { id: 'contact', name: 'Contact Info', icon: Phone }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">School Comparison</h1>
              <p className="text-gray-600">
                Comparing {schools.length} school{schools.length !== 1 ? 's' : ''} side-by-side
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Detailed Analysis</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((school, index) => {
                  const competitiveness = getCompetitivenessDisplay(getCompetitivenessLevel(school))
                  const successRate = getSuccessRate(school)
                  
                  return (
                    <div key={school.name} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        {/* School Header */}
                        <div className="text-center">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            index === 1 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                            index === 2 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                            'bg-gradient-to-r from-purple-400 to-pink-500'
                          }`}>
                            #{index + 1}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{school.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center justify-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {school.distance}km away
                          </p>
                        </div>

                        {/* Key Metrics */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                              <div className="text-2xl font-bold text-gray-900">{school.p1_data?.total_vacancies || 'N/A'}</div>
                              <div className="text-xs text-gray-600">Total Vacancy</div>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-gray-100">
                              <div className="text-2xl font-bold text-emerald-600">{successRate}%</div>
                              <div className="text-xs text-gray-600">Success Rate</div>
                            </div>
                          </div>

                          {/* Status Badges */}
                          <div className="space-y-2">
                            <span className={`block px-3 py-1 rounded-full text-xs font-medium text-center ${competitiveness.color}`}>
                              {competitiveness.icon} {competitiveness.text}
                            </span>
                            {school.p1_data?.balloted && (
                              <span className="block px-3 py-1 rounded-full text-xs font-medium text-center bg-red-100 text-red-700 border border-red-200">
                                ⚠️ Balloted School
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Comparison Chart */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Success Rate Comparison
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                      />
                      <Bar 
                        dataKey="successRate" 
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Phase Comparison Tab */}
          {activeTab === 'phases' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Phase-by-Phase Registration Analysis</h3>
                <p className="text-gray-600">Detailed breakdown of P1 registration data for each phase</p>
              </div>

              {phases.map((phase) => (
                <div key={phase.key} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
                    <h4 className="text-lg font-bold">{phase.name}</h4>
                    <p className="text-blue-100">{phase.description}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">School</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">Vacancies</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">Applicants</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">Taken</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">Success Rate</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-900">Balloted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {schools.map((school, index) => {
                            const phaseData = school.p1_data?.phases?.[phase.key]
                            const vacancies = phaseData?.vacancies || phaseData?.vacancy || 0
                            const applicants = phaseData?.applicants || phaseData?.applied || 0
                            const taken = phaseData?.taken || 0
                            const successRate = applicants > 0 ? Math.round((taken / applicants) * 100) : 100
                            const balloted = phaseData?.balloting || false
                            
                            return (
                              <tr key={school.name} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="py-4 px-4">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                                      index === 0 ? 'bg-yellow-500' :
                                      index === 1 ? 'bg-emerald-500' :
                                      index === 2 ? 'bg-blue-500' :
                                      'bg-purple-500'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">{school.name}</div>
                                      <div className="text-sm text-gray-600">{school.distance}km away</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center py-4 px-4">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {vacancies}
                                  </span>
                                </td>
                                <td className="text-center py-4 px-4">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                    {applicants}
                                  </span>
                                </td>
                                <td className="text-center py-4 px-4">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    {taken}
                                  </span>
                                </td>
                                <td className="text-center py-4 px-4">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    successRate >= 90 ? 'bg-green-100 text-green-800' :
                                    successRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                    successRate >= 50 ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {applicants > 0 ? `${successRate}%` : 'N/A'}
                                  </span>
                                </td>
                                <td className="text-center py-4 px-4">
                                  {balloted ? (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                      ⚠️ Yes
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                      ✅ No
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Balloting Details - Enhanced with Remarks */}
                    {schools.some(school => school.p1_data?.phases?.[phase.key]?.balloting) && (
                      <div className="mt-6 space-y-4">
                        <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                          Balloting Information for {phase.name}
                        </h5>
                        
                        {schools.map(school => {
                          const phaseData = school.p1_data?.phases?.[phase.key]
                          const ballotingDetails = phaseData?.balloting_details
                          const balloted = phaseData?.balloting
                          
                          if (!balloted) return null
                          
                          return (
                            <div key={school.name} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-white text-xs font-bold">⚠</span>
                                </div>
                                <div className="flex-1">
                                  <h6 className="font-semibold text-amber-900 mb-2">{school.name} - Balloting Conducted</h6>
                                  
                                  {/* Balloting Conducted For */}
                                  <div className="mb-3">
                                    <p className="text-sm font-medium text-amber-800 mb-1">Conducted for:</p>
                                    <p className="text-sm text-amber-700">
                                      {ballotingDetails?.conducted_for || 'Singapore Citizen children residing within 1km of the school.'}
                                    </p>
                                  </div>

                                  {/* Balloting Statistics */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-amber-600">
                                          {ballotingDetails?.vacancies_for_ballot || phaseData?.vacancies || 'N/A'}
                                        </div>
                                        <div className="text-xs text-amber-700 font-medium">Vacancies for Ballot</div>
                                      </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-amber-600">
                                          {ballotingDetails?.balloting_applicants || phaseData?.applicants || 'N/A'}
                                        </div>
                                        <div className="text-xs text-amber-700 font-medium">Balloting Applicants</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Additional Balloting Info */}
                                  {ballotingDetails?.additional_info && (
                                    <div className="mt-3 p-2 bg-amber-100 rounded border border-amber-300">
                                      <p className="text-xs text-amber-800">
                                        <strong>Additional Info:</strong> {ballotingDetails.additional_info}
                                      </p>
                                    </div>
                                  )}

                                  {/* Status Message */}
                                  {phaseData?.status && (
                                    <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                                      <p className="text-xs text-blue-800">
                                        <strong>Status:</strong> {phaseData.status}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Phase Notes */}
                    {schools.some(school => school.p1_data?.phases?.[phase.key]?.balloting_details?.special_note) && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <h5 className="font-medium text-yellow-800 mb-2">Phase Notes:</h5>
                        {schools.map(school => {
                          const note = school.p1_data?.phases?.[phase.key]?.balloting_details?.special_note
                          if (note) {
                            return (
                              <div key={school.name} className="text-sm text-yellow-700 mb-1">
                                <strong>{school.name}:</strong> {note}
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contact Info Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Information</h3>
                <p className="text-gray-600">Get in touch with these schools for more information</p>
              </div>

              <div className="grid gap-6">
                {schools.map((school, index) => (
                  <div key={school.name} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-start space-x-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                        index === 2 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                        'bg-gradient-to-r from-purple-400 to-pink-500'
                      }`}>
                        #{index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{school.name}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-5 w-5 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">Address</div>
                                <div className="text-gray-600">{school.address}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Phone className="h-5 w-5 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">Phone</div>
                                <a href={`tel:${school.phone}`} className="text-blue-600 hover:text-blue-700">
                                  {school.phone}
                                </a>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <Mail className="h-5 w-5 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">Email</div>
                                <a href={`mailto:${school.email}`} className="text-blue-600 hover:text-blue-700">
                                  {school.email}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Globe className="h-5 w-5 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">Website</div>
                                <a 
                                  href={school.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  Visit Website
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SchoolComparison 