import React from 'react'
import { ArrowLeft, School, BarChart3, Users, Compass } from 'lucide-react'

const Header = ({ currentView, onBackToSearch, onBackToResults, selectedSchoolsCount, onShowComparison }) => {
  const getViewTitle = () => {
    switch (currentView) {
      case 'landing':
        return 'School Search'
      case 'results':
        return 'Search Results'
      case 'strategy':
        return 'AI Strategy'
      case 'comparison':
        return 'School Comparison'
      default:
        return 'SG School Finder'
    }
  }

  const getBackAction = () => {
    switch (currentView) {
      case 'results':
        return onBackToSearch
      case 'strategy':
      case 'comparison':
        return onBackToResults
      default:
        return null
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {getBackAction() && (
              <button
                onClick={getBackAction()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SG School Finder</h1>
                <p className="text-sm text-gray-600">{getViewTitle()}</p>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {currentView === 'results' && selectedSchoolsCount > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {selectedSchoolsCount} school{selectedSchoolsCount !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={onShowComparison}
                  className="btn-outline flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Compare</span>
                </button>
              </div>
            )}

            {/* Status indicators */}
            <div className="flex items-center space-x-2">
              {currentView === 'results' && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Live Data</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="pb-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Compass className="h-4 w-4" />
            <span>Singapore</span>
            <span>•</span>
            <span>Primary Schools</span>
            {currentView !== 'landing' && (
              <>
                <span>•</span>
                <span className="text-primary-600 font-medium">{getViewTitle()}</span>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header 