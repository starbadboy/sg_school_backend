import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, Award, Users, School, AlertCircle, BarChart3 } from 'lucide-react';

const SchoolRanking = () => {
    const [rankings, setRankings] = useState([]);
    const [filteredRankings, setFilteredRankings] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [tierFilter, setTierFilter] = useState('');
    const [ballotedOnlyFilter, setBallotedOnlyFilter] = useState(false);
    const [showTopN, setShowTopN] = useState(50);
    
    // Sorting states
    const [sortBy, setSortBy] = useState('rank');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchRankings();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [rankings, searchQuery, tierFilter, ballotedOnlyFilter, showTopN, sortBy, sortOrder]);

    const fetchRankings = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            // Fetch ALL schools and let frontend handle filtering
            params.append('limit', '200');
            
            const response = await fetch(`/api/schools/rankings?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch rankings');
            }
            
            const data = await response.json();
            setRankings(data.rankings || []);
            
            // Use the same data for summary calculation (no double API call needed)
            const allSchools = data.rankings || [];
            const totalSchools = data.pagination?.total || allSchools.length || 0;
            const tiers = allSchools.reduce((acc, school) => {
                const tier = school.competitiveness_tier || 'Unknown';
                acc[tier] = (acc[tier] || 0) + 1;
                return acc;
            }, {});
            
            const ballotedCount = allSchools.filter(s => s.balloted).length;
            const averageScore = totalSchools > 0 ? 
                allSchools.reduce((sum, s) => sum + (s.competitiveness_score || 0), 0) / totalSchools : 0;
            
            // Calculate average ratio from Phase 2C data
            const validRatios = allSchools.filter(s => s.ratio_2c && s.ratio_2c !== Infinity && s.ratio_2c > 0);
            const averageRatio = validRatios.length > 0 ? 
                validRatios.reduce((sum, s) => sum + s.ratio_2c, 0) / validRatios.length : 0;
            
            setSummary({
                total_schools: totalSchools,
                balloted_schools: ballotedCount,
                average_ratio: Number(averageRatio.toFixed(2)), // Show as ratio (e.g., 2.34)
                tiers: tiers,
                most_competitive: allSchools.length > 0 ? allSchools[0] : null
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...rankings];

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(school =>
                school && school.name && school.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply tier filter
        if (tierFilter) {
            filtered = filtered.filter(school => school && school.competitiveness_tier === tierFilter);
        }

        // Apply balloted only filter
        if (ballotedOnlyFilter) {
            filtered = filtered.filter(school => school && school.balloted);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            if (!a || !b) return 0; // Safety check for undefined objects
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            // Handle special sorting for ratio (consider infinity)
            if (sortBy === 'ratio_2c') {
                if (aValue === Infinity && bValue === Infinity) return 0;
                if (aValue === Infinity) return sortOrder === 'asc' ? -1 : 1;
                if (bValue === Infinity) return sortOrder === 'asc' ? 1 : -1;
            }

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        // Apply limit
        filtered = filtered.slice(0, showTopN);

        setFilteredRankings(filtered);
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getRatioDisplay = (ratio) => {
        if (ratio === Infinity) return '∞';
        if (ratio === 0) return 'No Competition';
        return ratio.toFixed(2);
    };

    const getRatioColor = (ratio) => {
        if (ratio === Infinity) return 'text-red-600 font-bold';
        if (ratio >= 3.0) return 'text-red-500 font-semibold';
        if (ratio >= 2.0) return 'text-orange-500 font-medium';
        if (ratio >= 1.5) return 'text-yellow-600';
        if (ratio > 0) return 'text-green-600';
        return 'text-gray-500';
    };

    const getTierBadgeColor = (tier) => {
        switch (tier) {
            case 'Very High': return 'bg-red-100 text-red-800 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading school rankings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Rankings</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={fetchRankings}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <Award className="h-8 w-8 text-yellow-500 mr-2" />
                        <h1 className="text-4xl font-bold text-gray-900">Singapore Primary School Rankings 2024</h1>
                    </div>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Rankings based on Phase 2C applicant-to-vacancy ratio - the primary indicator of school competitiveness during P1 registration
                    </p>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 shadow-md border">
                        <div className="flex items-center">
                            <School className="h-8 w-8 text-blue-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Schools</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.total_schools || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md border">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-red-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Balloted Schools</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.balloted_schools || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md border">
                        <div className="flex items-center">
                            <BarChart3 className="h-8 w-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Average Competition</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.average_ratio || 0}</p>
                                <p className="text-xs text-gray-600">Applicants per vacancy</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md border">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-gray-600">Most Competitive</p>
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {summary.most_competitive?.name || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Ratio: {getRatioDisplay(summary.most_competitive?.ratio_2c || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg p-6 shadow-md border mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Search schools..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Tier Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <select
                                value={tierFilter}
                                onChange={(e) => setTierFilter(e.target.value)}
                                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Tiers</option>
                                <option value="Very High">Very High</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>

                        {/* Balloted Only */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="balloted-only"
                                checked={ballotedOnlyFilter}
                                onChange={(e) => setBallotedOnlyFilter(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="balloted-only" className="ml-2 text-sm text-gray-700">
                                Balloted Schools Only
                            </label>
                        </div>

                        {/* Show Top N */}
                        <div>
                            <select
                                value={showTopN}
                                onChange={(e) => setShowTopN(parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={25}>Top 25</option>
                                <option value={50}>Top 50</option>
                                <option value={100}>Top 100</option>
                                <option value={rankings.length}>All Schools</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Rankings Table */}
                <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                    {/* Mobile Card View - Hidden on Desktop */}
                    <div className="md:hidden">
                        {filteredRankings.map((school) => (
                            <div key={school.school_key || school.name} className="border-b border-gray-200 p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center">
                                        <div className={`text-lg font-bold mr-3 ${school.rank <= 10 ? 'text-yellow-600' : school.rank <= 25 ? 'text-orange-600' : 'text-gray-600'}`}>
                                            #{school.rank}
                                        </div>
                                        {school.rank <= 3 && (
                                            <Award className={`h-5 w-5 ${school.rank === 1 ? 'text-yellow-400' : school.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />
                                        )}
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(school.competitiveness_tier)}`}>
                                        {school.competitiveness_tier || 'Unknown'}
                                    </span>
                                </div>
                                
                                <h4 className="font-semibold text-gray-900 mb-1">{school.name}</h4>
                                <p className="text-sm text-gray-600 mb-3">Total Vacancy: {school.total_vacancy}</p>
                                
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-blue-50 p-2 rounded">
                                        <div className="text-blue-600 font-medium">{school.vacancies_2c || 'N/A'}</div>
                                        <div className="text-blue-500 text-xs">Available Places</div>
                                    </div>
                                    <div className="bg-orange-50 p-2 rounded">
                                        <div className="text-orange-600 font-medium">{school.applicants_2c || 'N/A'}</div>
                                        <div className="text-orange-500 text-xs">Total Applicants</div>
                                    </div>
                                    <div className="bg-purple-50 p-2 rounded">
                                        <div className={`font-medium ${getRatioColor(school.ratio_2c)}`}>
                                            {getRatioDisplay(school.ratio_2c)}
                                        </div>
                                        <div className="text-purple-500 text-xs">Applicants per spot</div>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <div className={`font-medium ${school.balloted ? 'text-red-600' : 'text-green-600'}`}>
                                            {school.balloted ? 'Yes' : 'No'}
                                        </div>
                                        <div className="text-gray-500 text-xs">Balloting</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View - Hidden on Mobile */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('rank')}
                                    >
                                        <div className="flex items-center">
                                            Rank
                                            {sortBy === 'rank' && (
                                                sortOrder === 'asc' ? <TrendingUp className="ml-1 h-4 w-4" /> : <TrendingDown className="ml-1 h-4 w-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center">
                                            School Name
                                            {sortBy === 'name' && (
                                                sortOrder === 'asc' ? <TrendingUp className="ml-1 h-4 w-4" /> : <TrendingDown className="ml-1 h-4 w-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('vacancies_2c')}
                                    >
                                        Phase 2C Vacancies
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('applicants_2c')}
                                    >
                                        Phase 2C Applicants
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('ratio_2c')}
                                    >
                                        <div className="flex items-center justify-center">
                                            Competitiveness Ratio
                                            {sortBy === 'ratio_2c' && (
                                                sortOrder === 'asc' ? <TrendingUp className="ml-1 h-4 w-4" /> : <TrendingDown className="ml-1 h-4 w-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('balloted')}>
                                        Balloting
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('competitiveness_tier')}>
                                        Tier
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRankings.map((school) => (
                                    <tr key={school.name || school.rank} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`text-lg font-bold ${school.rank <= 10 ? 'text-yellow-600' : school.rank <= 25 ? 'text-orange-600' : 'text-gray-600'}`}>
                                                    #{school.rank}
                                                </div>
                                                {school.rank <= 3 && (
                                                    <Award className={`ml-2 h-5 w-5 ${school.rank === 1 ? 'text-yellow-400' : school.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{school.name || 'Unknown School'}</div>
                                            <div className="text-xs text-gray-500">Total Vacancy: {school.total_vacancy || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-lg font-semibold text-blue-600">
                                                {school.vacancies_2c || 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-500">Available Places</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-lg font-semibold text-orange-600">
                                                {school.applicants_2c || 'N/A'}
                                            </div>
                                            <div className="text-xs text-gray-500">Total Applicants</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className={`text-lg font-semibold ${getRatioColor(school.ratio_2c)}`}>
                                                {getRatioDisplay(school.ratio_2c)}
                                            </div>
                                            <div className="text-xs text-gray-500">Applicants per spot</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {school.balloted ? (
                                                <div className="flex items-center justify-center">
                                                    <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                                    <span className="text-red-600 font-medium">Yes</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <div className="h-4 w-4 bg-green-500 rounded-full mr-1"></div>
                                                    <span className="text-green-600 font-medium">No</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTierBadgeColor(school.competitiveness_tier)}`}>
                                                {school.competitiveness_tier || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm text-gray-600">{school.year || '2024'}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">Understanding the Rankings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                        <div>
                            <p className="font-medium mb-2">🎯 Competitiveness Ratio</p>
                            <p>Number of applicants divided by available vacancies in Phase 2C. Higher ratio = more competitive.</p>
                        </div>
                        <div>
                            <p className="font-medium mb-2">📊 Balloting Codes</p>
                            <p>SC&lt;1: Singapore Citizens &lt;1km, SC1-2: 1-2km, SC&gt;2: &gt;2km, PR: Permanent Residents</p>
                        </div>
                        <div>
                            <p className="font-medium mb-2">🏆 Ranking Methodology</p>
                            <p>Based on 2024 Phase 2C balloting data - the main registration phase for general public.</p>
                        </div>
                        <div>
                            <p className="font-medium mb-2">⚡ Data Source</p>
                            <p>Official MOE P1 registration results for 2024, processed and analyzed for competitiveness.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolRanking; 