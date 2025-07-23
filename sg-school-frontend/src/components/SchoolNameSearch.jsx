import React, { useState, useEffect, useRef } from 'react';
import { Search, School, MapPin, Phone, Mail, Globe, Award, TrendingUp, Users, ChevronRight, Clock, X, Sparkles, Database, Target, Zap, Star } from 'lucide-react';

const SchoolNameSearch = ({ onSchoolSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('schoolSearchRecent');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearches = (searches) => {
    try {
      localStorage.setItem('schoolSearchRecent', JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  // Add a school to recent searches
  const addToRecentSearches = (schoolName) => {
    setRecentSearches(prev => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter(name => name !== schoolName);
      // Add to beginning and keep only last 5
      const updated = [schoolName, ...filtered].slice(0, 5);
      saveRecentSearches(updated);
      return updated;
    });
  };

  // Remove a school from recent searches
  const removeFromRecentSearches = (schoolName) => {
    setRecentSearches(prev => {
      const updated = prev.filter(name => name !== schoolName);
      saveRecentSearches(updated);
      return updated;
    });
  };

  // Debounced search function
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.length >= 2) {
        searchSchools(query);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const searchSchools = async (searchQuery) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/schools/search-by-name?query=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await response.json();
      
      if (response.ok) {
        setSuggestions(data.suggestions || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } else {
        console.error('Search error:', data.error);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Network error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    if (!suggestion || !suggestion.name) {
      console.error('Invalid suggestion object:', suggestion);
      return;
    }
    setQuery(suggestion.name);
    setIsOpen(false);
    addToRecentSearches(suggestion.name);
    onSchoolSelect(suggestion);
  };

  // Handle clicking on recent search items
  const handleRecentSearchClick = async (schoolName) => {
    setQuery(schoolName);
    // Search for the school to get full details
    try {
      const response = await fetch(`/api/schools/search-by-name?query=${encodeURIComponent(schoolName)}&limit=1`);
      const data = await response.json();
      
      if (response.ok && data.suggestions && data.suggestions.length > 0) {
        const suggestion = data.suggestions[0];
        if (suggestion && suggestion.name) {
          onSchoolSelect(suggestion);
        }
      }
    } catch (error) {
      console.error('Error fetching recent search:', error);
    }
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    saveRecentSearches([]);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex] && suggestions[selectedIndex].name) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const getCompetitivenessColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'very high':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'very low':
        return 'text-emerald-600 bg-emerald-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSourceBadge = (source, hasP1Data) => {
    if (source === 'database' && hasP1Data) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Award className="w-3 h-3 mr-1" />
          P1 Data Available
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <School className="w-3 h-3 mr-1" />
          Basic Info Only
        </span>
      );
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Enhanced Hero Section */}
      <div className="text-center mb-8 px-4">
        <div className="relative">
          {/* Floating Elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-70 animate-pulse"></div>
          <div className="absolute -top-2 right-8 w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full opacity-60 animate-bounce"></div>
          <div className="absolute top-4 -right-2 w-4 h-4 bg-gradient-to-br from-pink-400 to-rose-600 rounded-full opacity-50 animate-pulse delay-300"></div>
          
          {/* Main Header */}
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-blue-600 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
              <span className="text-base font-bold text-white tracking-wide">School Directory</span>
              <Target className="h-5 w-5 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-emerald-800 bg-clip-text text-transparent mb-4 leading-tight">
              Discover Your Perfect School
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Search through <span className="font-semibold text-emerald-600">comprehensive P1 data</span> and school information to make informed decisions for your child's education
            </p>
            
            {/* Stats Cards */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <Database className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Complete P1 Data</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Instant Search</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <Star className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Detailed Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Input */}
      <div className="relative max-w-3xl mx-auto px-4">
        <div className="relative group">
          {/* Search Input Container */}
          <div className="relative bg-white rounded-2xl shadow-lg border-2 border-gray-200 transition-all duration-300 group-focus-within:border-emerald-400 group-focus-within:shadow-xl group-focus-within:shadow-emerald-100">
            {/* Icon */}
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 transition-colors duration-200 group-focus-within:text-emerald-600">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            
            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search by school name... (e.g., Raffles Girls, CHIJ, Nanyang Primary)"
              className="w-full pl-16 pr-16 py-6 text-lg bg-transparent rounded-2xl focus:outline-none placeholder-gray-400 transition-all duration-200"
            />
            
            {/* Loading Spinner */}
            {isLoading && (
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                <div className="relative">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-200"></div>
                  <div className="absolute inset-0 animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-emerald-600"></div>
                </div>
              </div>
            )}
            
            {/* Search Count Badge */}
            {suggestions.length > 0 && (
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                <div className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                  {suggestions.length} found
                </div>
              </div>
            )}
          </div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-2xl opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 -z-10 blur-xl"></div>
        </div>

        {/* Enhanced Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-4 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[32rem] overflow-y-auto"
          >
            {/* Results Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Search Results</h3>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                  {suggestions.length} school{suggestions.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>

            {/* Suggestions List */}
            <div className="divide-y divide-gray-100">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`group relative p-6 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50 ${
                    index === selectedIndex 
                      ? 'bg-gradient-to-r from-emerald-50 to-blue-50 border-r-4 border-r-emerald-500' 
                      : ''
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {/* School Card */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-700 transition-colors">
                            {suggestion.name}
                          </h4>
                          <div className="flex items-center space-x-3">
                            {getSourceBadge(suggestion.source, suggestion.has_p1_data)}
                            {suggestion.competitiveness_tier && (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCompetitivenessColor(suggestion.competitiveness_tier)}`}>
                                {suggestion.competitiveness_tier} Competition
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0 ml-4" />
                      </div>

                      {/* Data Points */}
                      {suggestion.has_p1_data && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          {suggestion.total_vacancy && (
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{suggestion.total_vacancy}</div>
                                <div className="text-gray-500 text-xs">Vacancies</div>
                              </div>
                            </div>
                          )}
                          {suggestion.balloted !== undefined && (
                            <div className="flex items-center space-x-2 text-sm">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${suggestion.balloted ? 'bg-red-100' : 'bg-green-100'}`}>
                                <Award className={`w-4 h-4 ${suggestion.balloted ? 'text-red-600' : 'text-green-600'}`} />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{suggestion.balloted ? 'Yes' : 'No'}</div>
                                <div className="text-gray-500 text-xs">Balloting</div>
                              </div>
                            </div>
                          )}
                          {suggestion.year && (
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{suggestion.year}</div>
                                <div className="text-gray-500 text-xs">Data Year</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Location */}
                      {suggestion.address && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{suggestion.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-lg pointer-events-none"></div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Search className="w-4 h-4 mr-2" />
                Use ↑↓ arrows to navigate • Enter to select • Esc to close
              </div>
            </div>
          </div>
        )}

        {/* Enhanced No Results */}
        {isOpen && !isLoading && query.length >= 2 && suggestions.length === 0 && (
          <div className="absolute z-50 w-full mt-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Schools Found</h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              No schools match "<span className="font-semibold text-gray-700">{query}</span>". Try different keywords or check your spelling.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">Try: "Raffles"</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full">Try: "CHIJ"</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">Try: "Nanyang"</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Recent Searches */}
      {recentSearches.length > 0 && query.length < 2 && (
        <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-emerald-50 border border-blue-200 rounded-2xl shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 flex items-center text-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              Recent Searches
            </h4>
            <button
              onClick={clearRecentSearches}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium hover:bg-red-50 px-3 py-1 rounded-lg"
            >
              Clear all
            </button>
          </div>
          <div className="grid gap-3">
            {recentSearches.map((schoolName, index) => (
              <div
                key={index}
                className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer transform hover:scale-[1.02]"
                onClick={() => handleRecentSearchClick(schoolName)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <School className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
                    {schoolName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromRecentSearches(schoolName);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Search Tips */}
      <div className="mt-8 p-6 bg-gradient-to-br from-indigo-50 via-blue-50 to-emerald-50 border border-indigo-200 rounded-2xl shadow-sm max-w-3xl mx-auto">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <h4 className="font-bold text-indigo-800 text-lg">Search Tips & Tricks</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-indigo-100">
              <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Search className="w-3 h-3 text-emerald-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Quick Search</div>
                <div className="text-xs text-gray-600">Type 2+ characters to see suggestions</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-indigo-100">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Target className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Partial Names</div>
                <div className="text-xs text-gray-600">Try "Raffles" or "CHIJ" for quick results</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-indigo-100">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Database className="w-3 h-3 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Rich Data</div>
                <div className="text-xs text-gray-600">Schools with P1 data show detailed info</div>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-indigo-100">
              <div className="w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-3 h-3 text-pink-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Keyboard Navigation</div>
                <div className="text-xs text-gray-600">Use ↑↓ arrows, Enter to select</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolNameSearch; 