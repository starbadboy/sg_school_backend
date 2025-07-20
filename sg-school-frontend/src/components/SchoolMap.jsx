import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Maximize2, Minimize2, Navigation } from 'lucide-react'

const SchoolMap = ({ schools, userLocation, selectedSchools = [], onSchoolSelect }) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  // Load Leaflet CSS and JS
  useEffect(() => {
    const loadLeaflet = () => {
      if (window.L) {
        initializeMap()
        return
      }

      // Load Leaflet CSS
      const linkElement = document.createElement('link')
      linkElement.rel = 'stylesheet'
      linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      linkElement.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      linkElement.crossOrigin = ''
      document.head.appendChild(linkElement)

      // Load Leaflet JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
      script.crossOrigin = ''
      script.async = true
      script.onload = () => {
        if (window.L) {
          initializeMap()
        } else {
          setMapError(true)
        }
      }
      script.onerror = () => setMapError(true)
      document.head.appendChild(script)

      return () => {
        if (document.head.contains(linkElement)) {
          document.head.removeChild(linkElement)
        }
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    }

    loadLeaflet()
  }, [])

  // Initialize map and add markers when schools data changes
  useEffect(() => {
    if (mapLoaded && mapInstance.current && schools.length > 0) {
      clearMarkers()
      addSchoolMarkers()
    }
  }, [schools, selectedSchools, mapLoaded])

  const initializeMap = () => {
    try {
      if (!mapRef.current || mapInstance.current) return

      // Default center of Singapore
      let centerLat = 1.3521
      let centerLng = 103.8198

      // Use user location if available
      if (userLocation?.latitude && userLocation?.longitude) {
        centerLat = userLocation.latitude
        centerLng = userLocation.longitude
      }

      // Initialize Leaflet map with OneMap tiles
      const map = window.L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: schools.length > 1 ? 12 : 15,
        zoomControl: true,
        attributionControl: true
      })

      // Add OneMap tile layer
      window.L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.onemap.gov.sg/">OneMap</a> contributors',
        maxZoom: 18,
        minZoom: 10
      }).addTo(map)

      mapInstance.current = map
      setMapLoaded(true)

      // Add user location marker if available
      if (userLocation?.latitude && userLocation?.longitude) {
        addUserLocationMarker(map, userLocation)
      }

    } catch (error) {
      console.error('Failed to initialize Leaflet map:', error)
      setMapError(true)
    }
  }

  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      if (mapInstance.current) {
        mapInstance.current.removeLayer(marker)
      }
    })
    markersRef.current = []
  }

  const addUserLocationMarker = (map, location) => {
    try {
      // Create custom icon for user location
      const userIcon = window.L.divIcon({
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: #3b82f6; 
            border: 3px solid white; 
            border-radius: 50%; 
            position: relative;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          ">
            <div style="
              width: 12px; 
              height: 12px; 
              background: white; 
              border-radius: 50%; 
              position: absolute; 
              top: 50%; 
              left: 50%; 
              transform: translate(-50%, -50%);
            "></div>
          </div>
        `,
        className: 'user-location-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })

      const userMarker = window.L.marker([location.latitude, location.longitude], {
        icon: userIcon,
        title: 'Your Location'
      }).addTo(map)

      // Add popup for user location
      userMarker.bindPopup(`
        <div style="padding: 8px; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #1e293b; font-weight: bold;">Your Location</h4>
          <p style="margin: 0; color: #64748b; font-size: 14px;">${location.address}</p>
        </div>
      `)

      markersRef.current.push(userMarker)
    } catch (error) {
      console.error('Failed to add user location marker:', error)
    }
  }

  const addSchoolMarkers = () => {
    try {
      if (!mapInstance.current) return

      schools.forEach((school, index) => {
        if (!school.latitude || !school.longitude) return

        const isSelected = selectedSchools.some(s => s.name === school.name)
        const competitiveness = getCompetitivenessLevel(school)
        const markerColor = getMarkerColor(competitiveness, isSelected)

        // Create custom icon for school
        const schoolIcon = window.L.divIcon({
          html: `
            <div style="
              width: 40px; 
              height: 40px; 
              background: ${markerColor.bg}; 
              border: 3px solid ${markerColor.border}; 
              border-radius: 50%; 
              position: relative;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 24px; 
                height: 24px; 
                background: ${markerColor.icon}; 
                border-radius: 50%; 
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 12px;
                font-family: system-ui, -apple-system, sans-serif;
              ">${index + 1}</div>
            </div>
          `,
          className: 'school-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        })

        const marker = window.L.marker([parseFloat(school.latitude), parseFloat(school.longitude)], {
          icon: schoolIcon,
          title: school.name
        }).addTo(mapInstance.current)

        // Create popup content
        const popupContent = createPopupContent(school, isSelected)
        marker.bindPopup(popupContent, { 
          maxWidth: 300,
          className: 'school-popup'
        })

        markersRef.current.push(marker)
      })

      // Fit map to show all markers
      if (schools.length > 1) {
        fitMapToMarkers()
      }
    } catch (error) {
      console.error('Failed to add school markers:', error)
    }
  }

  const getCompetitivenessLevel = (school) => {
    const p1Data = school.p1_data
    if (!p1Data) return 'unknown'
    
    if (p1Data.competitiveness_tier) {
      return p1Data.competitiveness_tier.toLowerCase().replace(' ', '-')
    }
    
    const phase2c = p1Data.phases?.phase_2c
    if (!phase2c) return 'unknown'
    
    const applicants = phase2c.applicants || phase2c.applied || 0
    const vacancies = phase2c.vacancies || phase2c.vacancy || 1
    const ratio = applicants / vacancies
    
    if (ratio >= 2) return 'very-high'
    if (ratio >= 1.5) return 'high'
    if (ratio >= 1.2) return 'medium'
    return 'low'
  }

  const getMarkerColor = (competitiveness, isSelected) => {
    if (isSelected) {
      return {
        bg: '#3b82f6',
        border: '#1d4ed8',
        icon: '#1e40af'
      }
    }

    switch (competitiveness) {
      case 'very-high':
        return { bg: '#fef2f2', border: '#ef4444', icon: '#dc2626' }
      case 'high':
        return { bg: '#fffbeb', border: '#f59e0b', icon: '#d97706' }
      case 'medium':
        return { bg: '#fefce8', border: '#eab308', icon: '#ca8a04' }
      case 'low':
        return { bg: '#f0fdf4', border: '#22c55e', icon: '#16a34a' }
      default:
        return { bg: '#f8fafc', border: '#64748b', icon: '#475569' }
    }
  }

  const createPopupContent = (school, isSelected) => {
    const p1Data = school.p1_data || {}
    const competitiveness = getCompetitivenessLevel(school)
    const competitivenessText = {
      'very-high': 'Very Competitive',
      'high': 'Highly Competitive', 
      'medium': 'Moderately Competitive',
      'low': 'Less Competitive',
      'unknown': 'Unknown'
    }[competitiveness]

    return `
      <div style="padding: 12px; min-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="display: flex; align-items: center; justify-content: between; margin-bottom: 8px;">
          <h4 style="margin: 0; color: #1e293b; font-size: 16px; font-weight: bold; flex: 1;">${school.name}</h4>
          ${isSelected ? '<span style="background: #3b82f6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">Selected</span>' : ''}
        </div>
        
        <div style="margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="color: #64748b; font-size: 14px;">📍 ${school.distance}km away</span>
          </div>
          <div style="color: #64748b; font-size: 13px;">${school.address}</div>
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <span style="background: ${getCompetitivenessColor(competitiveness)}; padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: 500;">
            ${competitivenessText}
          </span>
          ${p1Data.balloted ? '<span style="background: #fef2f2; color: #dc2626; padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: 500;">Balloted</span>' : ''}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; font-size: 13px;">
          <div><strong>Total Vacancies:</strong> ${p1Data.total_vacancies || 'N/A'}</div>
          <div><strong>Phase 2C Applied:</strong> ${p1Data.phases?.phase_2c?.applicants || p1Data.phases?.phase_2c?.applied || 'N/A'}</div>
        </div>

        ${onSchoolSelect ? `
          <button 
            onclick="window.selectSchool('${school.name}')" 
            style="width: 100%; background: ${isSelected ? '#dc2626' : '#3b82f6'}; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 500; cursor: pointer; margin-top: 8px;"
          >
            ${isSelected ? 'Remove from Selection' : 'Select School'}
          </button>
        ` : ''}
      </div>
    `
  }

  const getCompetitivenessColor = (competitiveness) => {
    switch (competitiveness) {
      case 'very-high': return '#fef2f2; color: #dc2626'
      case 'high': return '#fffbeb; color: #d97706'
      case 'medium': return '#fefce8; color: #ca8a04'
      case 'low': return '#f0fdf4; color: #16a34a'
      default: return '#f8fafc; color: #475569'
    }
  }

  const fitMapToMarkers = () => {
    try {
      if (!mapInstance.current || schools.length === 0) return

      const bounds = window.L.latLngBounds([])
      
      // Add user location to bounds if available
      if (userLocation?.latitude && userLocation?.longitude) {
        bounds.extend([userLocation.latitude, userLocation.longitude])
      }

      // Add all school locations to bounds
      schools.forEach(school => {
        if (school.latitude && school.longitude) {
          bounds.extend([parseFloat(school.latitude), parseFloat(school.longitude)])
        }
      })

      if (bounds.isValid()) {
        mapInstance.current.fitBounds(bounds, { padding: [20, 20] })
      }
    } catch (error) {
      console.error('Failed to fit map bounds:', error)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Expose school selection to global scope for info window buttons
  useEffect(() => {
    window.selectSchool = (schoolName) => {
      const school = schools.find(s => s.name === schoolName)
      if (school && onSchoolSelect) {
        onSchoolSelect(school)
      }
    }

    return () => {
      delete window.selectSchool
    }
  }, [schools, onSchoolSelect])

  if (mapError) {
    return (
      <div className="card-elevated text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <MapPin className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Map Unavailable</h3>
        <p className="text-slate-600">Unable to load map. Please check your internet connection and try again.</p>
      </div>
    )
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'card-elevated'}`}>
      {/* Custom styles for Leaflet markers */}
      <style jsx>{`
        .user-location-marker, .school-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .leaflet-popup-tip {
          background: white;
        }
        .school-popup .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">School Locations</h3>
            <p className="text-sm text-slate-600">{schools.length} schools • Interactive map</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFullscreen}
            className="btn-secondary p-2"
            title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        className={`bg-slate-100 ${isFullscreen ? 'h-[calc(100vh-73px)]' : 'h-96'}`}
        style={{ width: '100%' }}
      >
        {!mapLoaded && !mapError && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Navigation className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <p className="text-slate-600 font-medium">Loading Map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {mapLoaded && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span className="text-slate-600">Your Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-slate-600">Less Competitive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
              <span className="text-slate-600">Highly Competitive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-slate-600">Very Competitive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-blue-600"></div>
              <span className="text-slate-600">Selected School</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchoolMap 