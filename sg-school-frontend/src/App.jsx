import React, { useState } from 'react'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import LocationSearch from './components/LocationSearch'
import SchoolResults from './components/SchoolResults'
import SchoolComparison from './components/SchoolComparison'
import StrategyView from './components/StrategyView'
import P1DataChart from './components/P1DataChart'
import P1RegistrationFlow from './components/P1RegistrationFlow'
import SchoolSearchView from './components/SchoolSearchView'
import { Sparkles, Stars, Crown, Zap } from 'lucide-react'

const App = () => {
  const [currentView, setCurrentView] = useState('landing')
  const [searchResults, setSearchResults] = useState(null)
  const [selectedSchools, setSelectedSchools] = useState([])
  const [comparisonSchools, setComparisonSchools] = useState([])
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [strategyData, setStrategyData] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

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

  const handleAddToComparison = (school) => {
    setComparisonSchools(prev => {
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

  const handleNavigateTo = (view) => {
    setCurrentView(view)
    if (view === 'landing') {
      setSearchResults(null)
      setSelectedSchools([])
      setComparisonSchools([])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView}
        onBackToSearch={handleBackToSearch}
        onBackToResults={handleBackToResults}
        selectedSchoolsCount={selectedSchools.length}
        onShowComparison={handleShowComparison}
        onNavigateTo={handleNavigateTo}
      />
      
      {/* Main Content */}
      <main className="relative z-10">
        {currentView === 'landing' && (
          <div className="animate-fade-in">
            {/* Clean Hero Section */}
            <div className="container-narrow pt-16 pb-8 relative">
              <div className="text-center space-y-8 px-4">
                {/* AI Badge */}
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <Sparkles className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">Powered by Advanced AI</span>
                </div>

                {/* Main Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gray-900">Find Your Perfect </span>
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                    Primary School
                  </span>
                </h1>
                
                {/* Subtitle */}
                <div className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  <span>Get </span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">AI-powered</span>
                  <span> school recommendations and </span>
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">strategic admission insights</span>
                  <span> in under 2 minutes</span>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="container-narrow pt-8 pb-16">
              <LocationSearch onSearchResults={handleSearchResults} />
            </div>

            {/* How It Works & Features Section */}
            <div className="container-narrow py-16">
              <LandingPage />
            </div>
          </div>
        )}

        {currentView === 'p1-flow' && (
          <div className="animate-fade-in">
            <P1RegistrationFlow />
          </div>
        )}

        {currentView === 'school-search' && (
          <div className="animate-fade-in">
            <SchoolSearchView />
          </div>
        )}

        {currentView === 'results' && searchResults && (
          <div className="container-narrow py-8 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <SchoolResults 
                results={searchResults} 
                userLocation={userLocation}
                onSchoolSelect={handleSchoolSelect}
                onAddToComparison={handleAddToComparison}
                onGenerateStrategy={handleGenerateStrategy}
                selectedSchools={selectedSchools}
                comparisonSchools={comparisonSchools}
                onShowComparison={handleShowComparison}
              />
            </div>
          </div>
        )}

        {currentView === 'comparison' && (
          <div className="container-narrow py-8 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <SchoolComparison schools={comparisonSchools} onBack={handleBackToResults} />
            </div>
          </div>
        )}

        {currentView === 'strategy' && selectedSchools.length > 0 && (
          <div className="container-narrow py-8 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <StrategyView 
                selectedSchools={selectedSchools} 
                userLocation={userLocation}
                onBack={handleBackToResults}
              />
            </div>
          </div>
        )}

        {currentView === 'details' && selectedSchool && (
          <div className="container-narrow py-8 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <P1DataChart school={selectedSchool} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App 