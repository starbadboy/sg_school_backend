import React, { useState } from 'react';
import SchoolNameSearch from './SchoolNameSearch';
import SchoolDetailView from './SchoolDetailView';

const SchoolSearchView = () => {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [currentView, setCurrentView] = useState('search'); // 'search' or 'detail'

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setCurrentView('detail');
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedSchool(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {currentView === 'search' && (
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <SchoolNameSearch onSchoolSelect={handleSchoolSelect} />
          </div>
        </div>
      )}
      
      {currentView === 'detail' && selectedSchool && (
        <SchoolDetailView 
          selectedSchool={selectedSchool} 
          onBack={handleBackToSearch} 
        />
      )}
    </div>
  );
};

export default SchoolSearchView; 