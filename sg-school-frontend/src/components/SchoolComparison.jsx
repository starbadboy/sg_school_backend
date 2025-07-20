import React, { useState } from 'react'
import { ArrowLeft, BarChart3, MapPin, Users, TrendingUp, AlertTriangle, Phone, Mail, Globe } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const SchoolComparison = ({ schools, onBack }) => {
  const [selectedMetric, setSelectedMetric] = useState('competitiveness')

  if (schools.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Schools Selected</h3>
          <p className="text-gray-600 mb-4">Please select at least one school to compare.</p>
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
        fullName: school.name
      })),
      distance: schools.map(school => ({
        name: school.name.split(' ').slice(0, 2).join(' '),
        value: school.distance,
        fullName: school.name
      })),
      successRate: schools.map(school => ({
        name: school.name.split(' ').slice(0, 2).join(' '),
        value: getSuccessRate(school),
        fullName: school.name
      })),
      vacancy: schools.map(school => ({
        name: school.name.split(' ').slice(0, 2).join(' '),
        value: school.p1_data?.total_vacancy || 0,
        fullName: school.name
      }))
    }

    return metrics[selectedMetric] || []
  }

  const getMetricLabel = () => {
    const labels = {
      competitiveness: 'Competitiveness Level (1=Low, 4=Very High)',
      distance: 'Distance from Your Location (km)',
      successRate: 'Phase 2C Success Rate (%)',
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">School Comparison</h1>
            <p className="text-gray-600">Compare {schools.length} selected schools side-by-side</p>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Comparison Chart</span>
          </h3>
          
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="competitiveness">Competitiveness</option>
            <option value="distance">Distance</option>
            <option value="successRate">Success Rate</option>
            <option value="vacancy">Total Vacancy</option>
          </select>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={prepareChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}${selectedMetric === 'distance' ? 'km' : selectedMetric === 'successRate' ? '%' : ''}`,
                  props.payload.fullName
                ]}
              />
              <Bar 
                dataKey="value" 
                fill={selectedMetric === 'competitiveness' ? '#ef4444' : 
                     selectedMetric === 'distance' ? '#3b82f6' :
                     selectedMetric === 'successRate' ? '#10b981' : '#8b5cf6'} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-sm text-gray-600 text-center mt-2">{getMetricLabel()}</p>
      </div>

      {/* Detailed Comparison Table */}
      <div className="card overflow-hidden">
        <h3 className="font-semibold text-gray-900 mb-6">Detailed Comparison</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">School</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Distance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Competitiveness</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Total Vacancy</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Phase 2C Success</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Balloted</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{school.name}</div>
                      <div className="text-sm text-gray-600">{school.address}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1 text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{school.distance}km</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getCompetitivenessScore(school) === 4 ? 'bg-red-100 text-red-800' :
                      getCompetitivenessScore(school) === 3 ? 'bg-orange-100 text-orange-800' :
                      getCompetitivenessScore(school) === 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getCompetitivenessText(getCompetitivenessScore(school))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">
                      {school.p1_data?.total_vacancy || 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">
                      {getSuccessRate(school)}%
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`font-medium ${
                      school.p1_data?.balloted ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {school.p1_data?.balloted ? 'Yes' : 'No'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school, index) => (
          <div key={index} className="card">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">{school.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{school.distance}km from your location</p>
              </div>

              {/* Contact Details */}
              <div className="space-y-3 text-sm">
                {school.phone && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{school.phone}</span>
                  </div>
                )}
                {school.email && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{school.email}</span>
                  </div>
                )}
                {school.website && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Globe className="h-4 w-4" />
                    <span>Official Website</span>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-600">P1 Vacancy</div>
                    <div className="font-semibold text-gray-900">
                      {school.p1_data?.total_vacancy || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Success Rate</div>
                    <div className="font-semibold text-gray-900">
                      {getSuccessRate(school)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-3 rounded-lg text-xs ${
                getCompetitivenessScore(school) <= 2 
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : getCompetitivenessScore(school) === 3
                  ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {getCompetitivenessScore(school) <= 2 && '✅ Good chance of admission in Phase 2C'}
                {getCompetitivenessScore(school) === 3 && '⚠️ Consider volunteering for Phase 2B'}
                {getCompetitivenessScore(school) >= 4 && '🔴 Highly competitive - have backup options'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Insights */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Comparison Insights</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommended Strategy</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Apply to less competitive schools as backup options</li>
              <li>• Consider volunteering at highly competitive schools</li>
              <li>• Priority is given to those within 1km distance</li>
              <li>• Alumni connections provide Phase 2A advantage</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Key Considerations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Balloted schools had high demand in previous years</li>
              <li>• Success rates are based on 2024 Phase 2C data</li>
              <li>• Distance priority applies only to Phase 2C</li>
              <li>• Consider school culture and programs beyond statistics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SchoolComparison 