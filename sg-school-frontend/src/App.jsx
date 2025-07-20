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
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView}
        onBackToSearch={handleBackToSearch}
        onBackToResults={handleBackToResults}
        selectedSchoolsCount={selectedSchools.length}
        onShowComparison={handleShowComparison}
      />
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'landing' && (
          <div className="space-y-8">
            <LandingPage />
            <LocationSearch onSearchResults={handleSearchResults} />
          </div>
        )}

        {currentView === 'results' && searchResults && (
          <SchoolResults
            results={searchResults}
            userLocation={userLocation}
            selectedSchools={selectedSchools}
            onSchoolSelect={handleSchoolSelect}
            onGenerateStrategy={handleGenerateStrategy}
          />
        )}

        {currentView === 'strategy' && (
          <StrategyView
            selectedSchools={selectedSchools}
            userLocation={userLocation}
            onBack={handleBackToResults}
          />
        )}

        {currentView === 'comparison' && (
          <SchoolComparison
            schools={selectedSchools}
            onBack={handleBackToResults}
          />
        )}
      </main>
    </div>
  )
}

export default App 