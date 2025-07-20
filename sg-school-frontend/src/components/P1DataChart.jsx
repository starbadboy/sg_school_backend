import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const P1DataChart = ({ school }) => {
  const p1Data = school.p1_data

  if (!p1Data || !p1Data.phases) {
    return (
      <div className="text-center py-8 text-gray-500">
        P1 data not available for this school
      </div>
    )
  }

  // Prepare data for phase breakdown chart
  const phaseData = [
    {
      phase: 'Phase 1',
      applied: p1Data.phases.phase_1?.applied || 0,
      taken: p1Data.phases.phase_1?.taken || 0,
      vacancy: p1Data.phases.phase_1?.vacancy || 0
    },
    {
      phase: 'Phase 2A',
      applied: p1Data.phases.phase_2a?.applied || 0,
      taken: p1Data.phases.phase_2a?.taken || 0,
      vacancy: p1Data.phases.phase_2a?.vacancy || 0
    },
    {
      phase: 'Phase 2B',
      applied: p1Data.phases.phase_2b?.applied || 0,
      taken: p1Data.phases.phase_2b?.taken || 0,
      vacancy: p1Data.phases.phase_2b?.vacancy || 0
    },
    {
      phase: 'Phase 2C',
      applied: p1Data.phases.phase_2c?.applied || 0,
      taken: p1Data.phases.phase_2c?.taken || 0,
      vacancy: p1Data.phases.phase_2c?.vacancy || 0
    },
    {
      phase: 'Phase 2C(S)',
      applied: p1Data.phases.phase_2c_supp?.applied || 0,
      taken: p1Data.phases.phase_2c_supp?.taken || 0,
      vacancy: p1Data.phases.phase_2c_supp?.vacancy || 0
    }
  ]

  // Prepare data for success rate pie chart
  const totalApplied = phaseData.reduce((sum, phase) => sum + phase.applied, 0)
  const totalTaken = phaseData.reduce((sum, phase) => sum + phase.taken, 0)
  
  const successData = [
    { name: 'Successful', value: totalTaken, color: '#10b981' },
    { name: 'Unsuccessful', value: totalApplied - totalTaken, color: '#ef4444' }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Phase Breakdown Chart */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">P1 Registration by Phase (2024)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phaseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="phase" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="applied" fill="#3b82f6" name="Applied" />
                <Bar dataKey="taken" fill="#10b981" name="Taken" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Applied</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Taken</span>
            </div>
          </div>
        </div>

        {/* Success Rate Pie Chart */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Overall Success Rate</h4>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {successData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {totalApplied > 0 ? Math.round((totalTaken / totalApplied) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              {totalTaken} taken out of {totalApplied} applied
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Phase Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Phase Details</h4>
        <div className="grid gap-4">
          {phaseData.map((phase, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{phase.phase}</h5>
                <div className="text-sm text-gray-600">
                  {phase.applied > 0 ? `${Math.round((phase.taken / phase.applied) * 100)}% success` : 'No applications'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Vacancy</div>
                  <div className="font-semibold">{phase.vacancy}</div>
                </div>
                <div>
                  <div className="text-gray-600">Applied</div>
                  <div className="font-semibold">{phase.applied}</div>
                </div>
                <div>
                  <div className="text-gray-600">Taken</div>
                  <div className="font-semibold">{phase.taken}</div>
                </div>
              </div>
              
              {/* Competition indicator */}
              {phase.applied > phase.taken && phase.taken > 0 && (
                <div className="mt-2 text-xs text-orange-600">
                  ⚠️ Competitive phase - {phase.applied - phase.taken} more applications than places
                </div>
              )}
              
              {phase.taken === phase.vacancy && phase.applied > phase.taken && (
                <div className="mt-2 text-xs text-red-600">
                  🔴 Balloting occurred - demand exceeded supply
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">Key Insights</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          {p1Data.balloted && (
            <li>• This school had balloting in Phase 2C, indicating high demand</li>
          )}
          {phaseData[3].applied > phaseData[3].taken && (
            <li>• Phase 2C was competitive with {phaseData[3].applied - phaseData[3].taken} unsuccessful applications</li>
          )}
          {totalApplied > 0 && totalTaken === totalApplied && (
            <li>• ✅ All applicants were successful - this school is less competitive</li>
          )}
          {totalApplied > 0 && totalTaken < totalApplied && (
            <li>• ⚠️ {Math.round(((totalApplied - totalTaken) / totalApplied) * 100)}% of applicants were unsuccessful - competitive school</li>
          )}
          {totalTaken < p1Data.total_vacancy && (
            <li>• {p1Data.total_vacancy - totalTaken} places remained unfilled after all phases</li>
          )}
          <li>• Consider volunteering or alumni connections for better chances in earlier phases</li>
        </ul>
      </div>
    </div>
  )
}

export default P1DataChart 