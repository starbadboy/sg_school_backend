import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle, Info, BarChart3, PieChart as PieChartIcon } from 'lucide-react'

const P1DataChart = ({ school }) => {
  const p1Data = school.p1_data

  if (!p1Data || !p1Data.phases) {
    return (
      <div className="card-elevated text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No P1 Data Available</h3>
        <p className="text-slate-600">Historical P1 registration data is not available for this school</p>
      </div>
    )
  }

  // Prepare data for phase breakdown chart
  const phaseData = [
    {
      phase: 'Phase 1',
      shortPhase: 'P1',
      applied: p1Data.phases.phase_1?.applied || 0,
      taken: p1Data.phases.phase_1?.taken || 0,
      vacancy: p1Data.phases.phase_1?.vacancy || 0,
      description: 'Siblings of current students'
    },
    {
      phase: 'Phase 2A',
      shortPhase: 'P2A',
      applied: p1Data.phases.phase_2a?.applied || 0,
      taken: p1Data.phases.phase_2a?.taken || 0,
      vacancy: p1Data.phases.phase_2a?.vacancy || 0,
      description: 'Alumni children & staff children'
    },
    {
      phase: 'Phase 2B',
      shortPhase: 'P2B',
      applied: p1Data.phases.phase_2b?.applied || 0,
      taken: p1Data.phases.phase_2b?.taken || 0,
      vacancy: p1Data.phases.phase_2b?.vacancy || 0,
      description: 'Volunteers & community leaders'
    },
    {
      phase: 'Phase 2C',
      shortPhase: 'P2C',
      applied: p1Data.phases.phase_2c?.applied || 0,
      taken: p1Data.phases.phase_2c?.taken || 0,
      vacancy: p1Data.phases.phase_2c?.vacancy || 0,
      description: 'General applicants by distance'
    },
    {
      phase: 'Phase 2C(S)',
      shortPhase: 'P2CS',
      applied: p1Data.phases.phase_2c_supp?.applied || 0,
      taken: p1Data.phases.phase_2c_supp?.taken || 0,
      vacancy: p1Data.phases.phase_2c_supp?.vacancy || 0,
      description: 'Supplementary round'
    }
  ]

  // Filter out phases with no data
  const activePhases = phaseData.filter(phase => phase.applied > 0 || phase.taken > 0 || phase.vacancy > 0)

  // Prepare data for success rate pie chart
  const totalApplied = phaseData.reduce((sum, phase) => sum + phase.applied, 0)
  const totalTaken = phaseData.reduce((sum, phase) => sum + phase.taken, 0)
  
  const successData = [
    { name: 'Successful Applications', value: totalTaken, color: '#10b981' },
    { name: 'Unsuccessful Applications', value: totalApplied - totalTaken, color: '#ef4444' }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-lg">
          <p className="font-bold text-slate-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {`${entry.dataKey === 'applied' ? 'Applied' : 'Taken'}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const getPhaseStatus = (phase) => {
    if (phase.applied === 0) return { status: 'inactive', color: 'text-slate-500 bg-slate-50 border-slate-200', text: 'No applications' }
    if (phase.taken === phase.applied) return { status: 'success', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', text: '100% successful' }
    if (phase.applied > phase.taken && phase.taken > 0) return { status: 'competitive', color: 'text-amber-700 bg-amber-50 border-amber-200', text: 'Competitive' }
    if (phase.taken === 0) return { status: 'failed', color: 'text-red-700 bg-red-50 border-red-200', text: 'No places allocated' }
    return { status: 'normal', color: 'text-blue-700 bg-blue-50 border-blue-200', text: 'Normal demand' }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">P1 Registration Analytics (2024)</h3>
        </div>
        <p className="text-slate-600">Detailed breakdown of {school.name}'s P1 registration data</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-hover text-center">
          <div className="text-3xl font-bold text-slate-900">{p1Data.total_vacancy}</div>
          <div className="text-sm text-slate-600">Total Vacancy</div>
        </div>
        <div className="card-hover text-center">
          <div className="text-3xl font-bold text-blue-600">{totalApplied}</div>
          <div className="text-sm text-slate-600">Total Applied</div>
        </div>
        <div className="card-hover text-center">
          <div className="text-3xl font-bold text-emerald-600">{totalTaken}</div>
          <div className="text-sm text-slate-600">Total Taken</div>
        </div>
        <div className="card-hover text-center">
          <div className="text-3xl font-bold text-purple-600">
            {totalApplied > 0 ? Math.round((totalTaken / totalApplied) * 100) : 0}%
          </div>
          <div className="text-sm text-slate-600">Success Rate</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Enhanced Phase Breakdown Chart */}
        <div className="card-elevated">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Registration by Phase</h4>
          </div>
          
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activePhases} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="shortPhase" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="applied" fill="#3b82f6" name="Applied" radius={[2, 2, 0, 0]} />
                <Bar dataKey="taken" fill="#10b981" name="Taken" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="font-medium">Applications</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="font-medium">Successful</span>
            </div>
          </div>
        </div>

        {/* Enhanced Success Rate Visualization */}
        <div className="card-elevated">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <PieChartIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Overall Success Rate</h4>
          </div>
          
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={successData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
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
          
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-slate-900">
              {totalApplied > 0 ? Math.round((totalTaken / totalApplied) * 100) : 0}%
            </div>
            <div className="text-slate-600 font-medium">Overall Success Rate</div>
            <div className="text-sm text-slate-500">
              {totalTaken} successful out of {totalApplied} applications
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Phase Details */}
      <div className="card-elevated">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
            <Info className="h-5 w-5 text-purple-600" />
          </div>
          <h4 className="text-xl font-bold text-slate-900">Detailed Phase Analysis</h4>
        </div>
        
        <div className="grid gap-4">
          {activePhases.map((phase, index) => {
            const status = getPhaseStatus(phase)
            const successRate = phase.applied > 0 ? Math.round((phase.taken / phase.applied) * 100) : 0
            
            return (
              <div key={index} className="card-hover border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-bold text-slate-900">{phase.phase}</h5>
                    <p className="text-sm text-slate-600">{phase.description}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${status.color}`}>
                    {status.text}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-4 gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{phase.vacancy}</div>
                    <div className="text-xs text-slate-600">Vacancy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{phase.applied}</div>
                    <div className="text-xs text-slate-600">Applied</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{phase.taken}</div>
                    <div className="text-xs text-slate-600">Taken</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{successRate}%</div>
                    <div className="text-xs text-slate-600">Success Rate</div>
                  </div>
                </div>

                {/* Phase-specific insights */}
                {phase.applied > phase.taken && phase.taken > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-900">Competitive Phase</div>
                      <div className="text-sm text-amber-700">
                        {phase.applied - phase.taken} more applications than available places
                      </div>
                    </div>
                  </div>
                )}

                {phase.taken === phase.vacancy && phase.applied > phase.taken && (
                  <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-red-900">Balloting Occurred</div>
                      <div className="text-sm text-red-700">
                        Demand exceeded supply - balloting was used to allocate places
                      </div>
                    </div>
                  </div>
                )}

                {phase.taken === phase.applied && phase.applied > 0 && (
                  <div className="flex items-start space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-emerald-900">All Applications Successful</div>
                      <div className="text-sm text-emerald-700">
                        Every applicant in this phase was offered a place
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Enhanced Strategic Insights */}
      <div className="card-gradient border-2 border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h5 className="text-xl font-bold text-slate-900">Strategic Insights & Recommendations</h5>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h6 className="font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span>Key Findings</span>
            </h6>
            <ul className="space-y-3 text-slate-700">
              {p1Data.balloted && (
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>This school had balloting in Phase 2C, indicating very high demand</span>
                </li>
              )}
              {phaseData[3].applied > phaseData[3].taken && (
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Phase 2C was competitive with {phaseData[3].applied - phaseData[3].taken} unsuccessful applications</span>
                </li>
              )}
              {totalApplied > 0 && totalTaken === totalApplied && (
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>All applicants were successful - this school is less competitive</span>
                </li>
              )}
              {totalApplied > 0 && totalTaken < totalApplied && (
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{Math.round(((totalApplied - totalTaken) / totalApplied) * 100)}% of applicants were unsuccessful</span>
                </li>
              )}
              {totalTaken < p1Data.total_vacancy && (
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{p1Data.total_vacancy - totalTaken} places remained unfilled after all phases</span>
                </li>
              )}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h6 className="font-bold text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span>Recommendations</span>
            </h6>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Consider volunteering or alumni connections for earlier phase advantages</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Living within 1km provides priority in Phase 2C registration</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Have backup schools ready if this school shows high competition</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Apply early in each phase to maximize your chances</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default P1DataChart 