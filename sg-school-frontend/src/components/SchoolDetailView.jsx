import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, School, MapPin, Phone, Mail, Globe, Award, 
  TrendingUp, Users, Calendar, BarChart3, AlertCircle, 
  CheckCircle, XCircle, Info, Target, Star, Bus, Train 
} from 'lucide-react';

const SchoolDetailView = ({ selectedSchool, onBack }) => {
  const [schoolDetail, setSchoolDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedSchool) {
      fetchSchoolDetail(selectedSchool.name);
    }
  }, [selectedSchool]);

  const fetchSchoolDetail = async (schoolName) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/schools/school-detail/${encodeURIComponent(schoolName)}`);
      const data = await response.json();
      
      if (response.ok) {
        setSchoolDetail(data);
      } else {
        setError(data.message || 'Failed to fetch school details');
      }
    } catch (error) {
      setError('Network error occurred while fetching school details');
      console.error('Error fetching school detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompetitivenessDisplay = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'very high':
        return { text: 'Very High Competition', color: 'text-red-600 bg-red-50 border-red-200', icon: '🔥' };
      case 'high':
        return { text: 'High Competition', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '📈' };
      case 'medium':
        return { text: 'Medium Competition', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: '⚡' };
      case 'low':
        return { text: 'Low Competition', color: 'text-green-600 bg-green-50 border-green-200', icon: '✅' };
      case 'very low':
        return { text: 'Very Low Competition', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: '🎯' };
      default:
        return { text: 'Competition Level Unknown', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: '❓' };
    }
  };

  const getPhaseSuccessRate = (phase) => {
    if (!phase || !phase.applicants || phase.applicants === 0) return null;
    if (phase.vacancies === 0 && phase.applicants === 0 && phase.taken === 0) return null;
    return Math.round((phase.taken / phase.applicants) * 100);
  };

  const getSuccessRateColor = (rate) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    if (rate >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const formatPhaseData = (phases) => {
    const phaseOrder = ['phase_1', 'phase_2a', 'phase_2b', 'phase_2c', 'phase_2c_supp', 'phase_3'];
    const phaseLabels = {
      'phase_1': 'Phase 1',
      'phase_2a': 'Phase 2A',
      'phase_2b': 'Phase 2B',
      'phase_2c': 'Phase 2C',
      'phase_2c_supp': 'Phase 2C (Supplementary)',
      'phase_3': 'Phase 3'
    };

    return phaseOrder.map(phaseKey => ({
      key: phaseKey,
      label: phaseLabels[phaseKey],
      data: phases[phaseKey] || {}
    })).filter(phase => phase.data && Object.keys(phase.data).length > 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading school details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading School Details</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchSchoolDetail(selectedSchool.name)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!schoolDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">No school details available</h2>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: School },
    { id: 'p1-data', label: 'P1 Registration Data', icon: BarChart3 },
    { id: 'contact', label: 'Contact & Location', icon: MapPin },
    { id: 'analysis', label: 'Analysis & Insights', icon: TrendingUp }
  ];

  const competitiveness = getCompetitivenessDisplay(schoolDetail.p1_data?.competitiveness_tier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <School className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{schoolDetail.basic_info.name}</h1>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      schoolDetail.basic_info.has_comprehensive_data 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {schoolDetail.basic_info.has_comprehensive_data ? '📊 Complete Data' : '📋 Basic Info'}
                    </span>
                    
                    {schoolDetail.p1_data?.competitiveness_tier && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${competitiveness.color}`}>
                        <span className="mr-1">{competitiveness.icon}</span>
                        {competitiveness.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {schoolDetail.p1_data?.total_vacancy && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-600">{schoolDetail.p1_data.total_vacancy}</div>
                  <div className="text-sm text-gray-600">Total P1 Vacancies</div>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-emerald-600 shadow-sm font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">School Overview</h2>
              
              {schoolDetail.p1_data?.total_vacancy ? (
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users className="w-8 h-8 text-blue-600" />
                      <h3 className="text-lg font-semibold text-blue-800">Total Vacancies</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{schoolDetail.p1_data.total_vacancy}</div>
                    <p className="text-blue-700 text-sm mt-1">Available P1 places in {schoolDetail.basic_info.year}</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <Award className="w-8 h-8 text-purple-600" />
                      <h3 className="text-lg font-semibold text-purple-800">Balloting Status</h3>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {schoolDetail.p1_data.balloted ? 'Balloted' : 'No Balloting'}
                    </div>
                    <p className="text-purple-700 text-sm mt-1">
                      {schoolDetail.p1_data.balloted ? 'Some phases required balloting' : 'All phases had sufficient places'}
                    </p>
                  </div>

                  <div className={`bg-gradient-to-r rounded-xl p-6 ${
                    schoolDetail.p1_data?.competitiveness_tier?.toLowerCase() === 'very high' 
                      ? 'from-red-50 to-red-100' 
                      : schoolDetail.p1_data?.competitiveness_tier?.toLowerCase() === 'high'
                      ? 'from-orange-50 to-orange-100'
                      : 'from-green-50 to-green-100'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp className={`w-8 h-8 ${
                        schoolDetail.p1_data?.competitiveness_tier?.toLowerCase() === 'very high' 
                          ? 'text-red-600' 
                          : schoolDetail.p1_data?.competitiveness_tier?.toLowerCase() === 'high'
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`} />
                      <h3 className={`text-lg font-semibold ${
                        schoolDetail.p1_data?.competitiveness_tier?.toLowerCase() === 'very high' 
                          ? 'text-red-800' 
                          : schoolDetail.p1_data?.competitiveness_tier?.toLowerCase() === 'high'
                          ? 'text-orange-800'
                          : 'text-green-800'
                      }`}>Competitiveness</h3>
                    </div>
                    <div className={`text-2xl font-bold ${
                      schoolDetail.p1_data?.competitiveness_tier?.toLowerCase() === 'very high' 
                        ? 'text-red-600' 
                        : schoolDetail.p1_data?.competitiveness_tier?.toLowerCase() === 'high'
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }`}>
                      {schoolDetail.p1_data.competitiveness_tier || 'Unknown'}
                    </div>
                    <p className={`text-sm mt-1 ${
                      schoolDetail.p1_data?.competitiveness_tier?.toLowerCase() === 'very high' 
                        ? 'text-red-700' 
                        : schoolDetail.p1_data?.competitiveness_tier?.toLowerCase() === 'high'
                        ? 'text-orange-700'
                        : 'text-green-700'
                    }`}>
                      Based on application patterns
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <Info className="w-6 h-6 text-yellow-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-800 mb-2">Limited Data Available</h3>
                      <p className="text-yellow-700">
                        {schoolDetail.p1_data?.message || 'P1 registration data is not available for this school in our database.'}
                      </p>
                      {schoolDetail.p1_data?.suggestion && (
                        <p className="text-yellow-600 text-sm mt-2">{schoolDetail.p1_data.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'p1-data' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">P1 Registration Data</h2>
              
              {schoolDetail.p1_data?.phases ? (
                <div className="space-y-6">
                  {formatPhaseData(schoolDetail.p1_data.phases).map((phase, index) => {
                    const successRate = getPhaseSuccessRate(phase.data);
                    return (
                      <div key={phase.key} className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-gray-800">{phase.label}</h3>
                          {successRate !== null && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSuccessRateColor(successRate)}`}>
                              {successRate}% Success Rate
                            </span>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{phase.data.vacancies || 0}</div>
                            <div className="text-sm text-gray-600">Vacancies</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{phase.data.applicants || 0}</div>
                            <div className="text-sm text-gray-600">Applicants</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{phase.data.taken || 0}</div>
                            <div className="text-sm text-gray-600">Places Filled</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${phase.data.balloted ? 'text-red-600' : 'text-green-600'}`}>
                              {phase.data.balloted ? <XCircle className="w-6 h-6 mx-auto" /> : <CheckCircle className="w-6 h-6 mx-auto" />}
                            </div>
                            <div className="text-sm text-gray-600">
                              {phase.data.balloted ? 'Balloted' : 'No Balloting'}
                            </div>
                          </div>
                        </div>

                        {phase.data.balloting_details && (
                          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <h4 className="font-semibold text-amber-800 mb-2">Balloting Details</h4>
                            <div className="text-sm text-amber-700">
                              {phase.data.balloting_details.conducted_for && (
                                <p className="mb-1">
                                  <strong>Conducted for:</strong> {phase.data.balloting_details.conducted_for}
                                </p>
                              )}
                              {phase.data.balloting_details.vacancies_for_ballot && (
                                <p className="mb-1">
                                  <strong>Vacancies for ballot:</strong> {phase.data.balloting_details.vacancies_for_ballot}
                                </p>
                              )}
                              {phase.data.balloting_details.balloting_applicants && (
                                <p>
                                  <strong>Balloting applicants:</strong> {phase.data.balloting_details.balloting_applicants}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No P1 Data Available</h3>
                  <p className="text-gray-500">
                    {schoolDetail.p1_data?.message || 'P1 registration data is not available for this school.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information & Location</h2>
              
              {schoolDetail.contact_info ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Contact Details</h3>
                    
                    {schoolDetail.contact_info.address && schoolDetail.contact_info.address !== 'Not available' && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <div className="font-medium text-gray-800">Address</div>
                          <div className="text-gray-600">{schoolDetail.contact_info.address}</div>
                          {schoolDetail.contact_info.postal_code && schoolDetail.contact_info.postal_code !== 'Not available' && (
                            <div className="text-gray-500 text-sm">Postal Code: {schoolDetail.contact_info.postal_code}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {schoolDetail.contact_info.phone && schoolDetail.contact_info.phone !== 'Not available' && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-800">Phone</div>
                          <a href={`tel:${schoolDetail.contact_info.phone}`} className="text-emerald-600 hover:text-emerald-700">
                            {schoolDetail.contact_info.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {schoolDetail.contact_info.email && schoolDetail.contact_info.email !== 'Not available' && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-800">Email</div>
                          <a href={`mailto:${schoolDetail.contact_info.email}`} className="text-emerald-600 hover:text-emerald-700">
                            {schoolDetail.contact_info.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {schoolDetail.contact_info.website && schoolDetail.contact_info.website !== 'Not available' && (
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-800">Website</div>
                          <a href={schoolDetail.contact_info.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">
                            Visit Website
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Transportation</h3>
                    
                    {schoolDetail.contact_info.mrt_desc && schoolDetail.contact_info.mrt_desc !== 'Not available' && (
                      <div className="flex items-start space-x-3">
                        <Train className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <div className="font-medium text-gray-800">Nearest MRT</div>
                          <div className="text-gray-600">{schoolDetail.contact_info.mrt_desc}</div>
                        </div>
                      </div>
                    )}

                    {schoolDetail.contact_info.bus_desc && schoolDetail.contact_info.bus_desc !== 'Not available' && (
                      <div className="flex items-start space-x-3">
                        <Bus className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <div className="font-medium text-gray-800">Bus Services</div>
                          <div className="text-gray-600">{schoolDetail.contact_info.bus_desc}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Contact Information Not Available</h3>
                  <p className="text-gray-500">
                    Contact details for this school are not available in our database.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Analysis & Insights</h2>
              
              {schoolDetail.analysis ? (
                <div className="grid gap-6">
                  {schoolDetail.analysis.overall_success_rate > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-blue-800 mb-3">Overall Success Rate</h3>
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        {Math.round(schoolDetail.analysis.overall_success_rate)}%
                      </div>
                      <p className="text-blue-700">
                        Percentage of applicants who successfully obtained a place across all phases
                      </p>
                    </div>
                  )}

                  {schoolDetail.analysis.most_competitive_phase && (
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-purple-800 mb-3">Most Competitive Phase</h3>
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {schoolDetail.analysis.most_competitive_phase}
                      </div>
                      <p className="text-purple-700">
                        This phase had the highest competition with the lowest success rate
                      </p>
                    </div>
                  )}

                  {schoolDetail.analysis.recommendation && (
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-emerald-800 mb-3">Strategic Recommendation</h3>
                      <p className="text-emerald-700">{schoolDetail.analysis.recommendation}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Analysis Not Available</h3>
                  <p className="text-gray-500">
                    Detailed analysis is only available for schools with comprehensive P1 data.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailView; 