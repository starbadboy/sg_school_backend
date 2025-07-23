import React, { useState, useEffect } from 'react'
import { ArrowLeft, School, BarChart3, Users, Compass, MapPin, ClipboardList, Search, Award, Menu, X } from 'lucide-react'

const Header = ({ currentView, onBackToSearch, onBackToResults, selectedSchoolsCount, onShowComparison, onNavigateTo }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when view changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);
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
      case 'p1-flow':
        return 'P1 Registration Flow'
      case 'school-search':
        return 'School Directory'
      case 'rankings':
        return 'School Rankings'
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
      case 'p1-flow':
        return () => onNavigateTo('landing')
      case 'school-search':
        return () => onNavigateTo('landing')
      case 'rankings':
        return () => onNavigateTo('landing')
      default:
        return null
    }
  }

  const getViewIcon = () => {
    switch (currentView) {
      case 'landing':
        return <School className="h-4 w-4" />
      case 'results':
        return <MapPin className="h-4 w-4" />
      case 'strategy':
        return <Users className="h-4 w-4" />
      case 'comparison':
        return <BarChart3 className="h-4 w-4" />
      case 'p1-flow':
        return <ClipboardList className="h-4 w-4" />
      case 'school-search':
        return <Search className="h-4 w-4" />
      case 'rankings':
        return <Award className="h-4 w-4" />
      default:
        return <School className="h-4 w-4" />
    }
  }

  const navigationTabs = [
    { id: 'landing', label: 'Find Schools', icon: School },
    { id: 'school-search', label: 'School Directory', icon: Search },
    { id: 'rankings', label: 'School Rankings', icon: Award },
    { id: 'p1-flow', label: 'P1 Registration Guide', icon: ClipboardList }
  ]

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60 backdrop-blur-xl">
      <div className="container-app">
        <div className="flex items-center justify-between h-20">
          {/* Left section */}
          <div className="flex items-center space-x-6">
            {getBackAction() && (
              <button
                onClick={getBackAction()}
                className="btn-ghost p-3 rounded-xl group"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
              </button>
            )}
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-600/25">
                <School className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">SG School Finder</h1>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  {getViewIcon()}
                  <span className="font-medium">{getViewTitle()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationTabs.map((tab) => {
              const IconComponent = tab.icon
              const isActive = currentView === tab.id || (tab.id === 'landing' && ['results', 'strategy', 'comparison'].includes(currentView))
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigateTo(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-6">
            {currentView === 'results' && selectedSchoolsCount > 0 && (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700">
                    {selectedSchoolsCount} school{selectedSchoolsCount !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <button
                  onClick={onShowComparison}
                  className="btn-outline flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Compare</span>
                </button>
              </div>
            )}


          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay to close menu when clicking outside */}
            <div 
              className="md:hidden fixed inset-0 bg-black bg-opacity-20 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-slate-200 shadow-lg backdrop-blur-xl z-50">
              <div className="container-app py-4">
                <div className="grid grid-cols-1 gap-2">
                  {navigationTabs.map((tab) => {
                    const IconComponent = tab.icon
                    const isActive = currentView === tab.id || (tab.id === 'landing' && ['results', 'strategy', 'comparison'].includes(currentView))
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          onNavigateTo(tab.id)
                          setIsMobileMenuOpen(false)
                        }}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                          isActive 
                            ? 'bg-blue-100 text-blue-700 font-medium' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Enhanced Breadcrumb */}
        {currentView !== 'landing' && currentView !== 'p1-flow' && (
          <div className="pb-6">
            <nav className="flex items-center space-x-3 text-sm" aria-label="Breadcrumb">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <Compass className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600 font-medium">Singapore</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                <School className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600 font-medium">Primary Schools</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-200">
                {getViewIcon()}
                <span className="text-blue-700 font-semibold">{getViewTitle()}</span>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header 