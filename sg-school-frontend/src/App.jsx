import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import LocationSearch from './components/LocationSearch'
import SchoolResults from './components/SchoolResults'
import StrategyView from './components/StrategyView'
import SchoolComparison from './components/SchoolComparison'
import LandingPage from './components/LandingPage'

function App() {
  const [searchResults, setSearchResults] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [selectedSchools, setSelectedSchools] = useState([])
  const [currentView, setCurrentView] = useState('landing')

  const handleSearchResults = (results, location) => {
    setSearchResults(results)
    setUserLocation(location)
    setCurrentView('results')
  }

  const handleSchoolSelect = (school) => {
    setSelectedSchools(prev => {
      const exists = prev.find(s => s.name === school.name)
      if (exists) {
        return prev.filter(s => s.name !== school.name)
      }
      return [...prev, school]
    })
  }

  const handleGenerateStrategy = () => {
    setCurrentView('strategy')
  }

  const handleShowComparison = () => {
    setCurrentView('comparison')
  }

  const handleBackToResults = () => {
    setCurrentView('results')
  }

  const handleBackToSearch = () => {
    setCurrentView('landing')
    setSearchResults(null)
    setSelectedSchools([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header 
        currentView={currentView}
        onBackToSearch={handleBackToSearch}
        onBackToResults={handleBackToResults}
        selectedSchoolsCount={selectedSchools.length}
        onShowComparison={handleShowComparison}
      />
      
      <main className="relative">
        {currentView === 'landing' && (
          <div className="container-narrow py-12 space-y-16 animate-fade-in">
            <LandingPage />
            <div className="animate-slide-up">
              <LocationSearch onSearchResults={handleSearchResults} />
            </div>
          </div>
        )}

        {currentView === 'results' && searchResults && (
          <div className="container-app py-8 animate-fade-in">
            <SchoolResults
              results={searchResults}
              userLocation={userLocation}
              selectedSchools={selectedSchools}
              onSchoolSelect={handleSchoolSelect}
              onGenerateStrategy={handleGenerateStrategy}
            />
          </div>
        )}

        {currentView === 'strategy' && (
          <div className="container-narrow py-8 animate-fade-in">
            <StrategyView
              selectedSchools={selectedSchools}
              userLocation={userLocation}
              onBack={handleBackToResults}
            />
          </div>
        )}

        {currentView === 'comparison' && (
          <div className="container-app py-8 animate-fade-in">
            <SchoolComparison
              schools={selectedSchools}
              onBack={handleBackToResults}
            />
          </div>
        )}
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-gradient-to-r from-blue-400/5 to-emerald-400/5 rounded-full blur-3xl animate-pulse-subtle"></div>
      </div>
    </div>
  )
}

export default App 