from flask import Blueprint, request, jsonify, current_app
import requests
import pandas as pd
from bs4 import BeautifulSoup
import math
import json
from src.models.user import db, School
import difflib

schools_bp = Blueprint('schools', __name__)

# Singapore government data API
DATA_GOV_SG_API = "https://data.gov.sg/api/action/datastore_search"
SCHOOL_DATASET_ID = "d_688b934f82c1059ed0a6993d2a829089"

# OneMap API for geocoding
ONEMAP_API = "https://www.onemap.gov.sg/api/common/elastic/search"

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def geocode_address(address):
    """Geocode address using OneMap API"""
    try:
        params = {
            'searchVal': address,
            'returnGeom': 'Y',
            'getAddrDetails': 'Y'
        }
        response = requests.get(ONEMAP_API, params=params)
        data = response.json()
        
        if data['found'] > 0:
            result = data['results'][0]
            return {
                'latitude': float(result['LATITUDE']),
                'longitude': float(result['LONGITUDE']),
                'address': result['ADDRESS']
            }
    except Exception as e:
        print(f"Geocoding error: {e}")
    
    return None

def get_schools_data():
    """Fetch schools data from data.gov.sg"""
    try:
        params = {
            'resource_id': SCHOOL_DATASET_ID,
            'limit': 1000
        }
        response = requests.get(DATA_GOV_SG_API, params=params)
        data = response.json()
        
        if data['success']:
            schools = []
            for record in data['result']['records']:
                # Filter for primary schools only
                if 'PRIMARY' in record.get('school_name', '').upper():
                    schools.append({
                        'name': record.get('school_name', ''),
                        'address': record.get('address', ''),
                        'postal_code': record.get('postal_code', ''),
                        'phone': record.get('telephone_no', ''),
                        'email': record.get('email_address', ''),
                        'website': record.get('url_address', ''),
                        'mrt_desc': record.get('mrt_desc', ''),
                        'bus_desc': record.get('bus_desc', '')
                    })
            return schools
    except Exception as e:
        print(f"Error fetching schools data: {e}")
    
    return []

def find_school_contact_info(school_name):
    """Find contact information for a school from government data"""
    try:
        gov_schools = get_schools_data()
        school_name_lower = school_name.lower()
        
        # First try exact match
        for gov_school in gov_schools:
            if gov_school['name'].lower() == school_name_lower:
                return {
                    'address': gov_school.get('address', 'Not available'),
                    'postal_code': gov_school.get('postal_code', 'Not available'),
                    'phone': gov_school.get('phone', 'Not available'),
                    'email': gov_school.get('email', 'Not available'),
                    'website': gov_school.get('website', 'Not available'),
                    'mrt_desc': gov_school.get('mrt_desc', 'Not available'),
                    'bus_desc': gov_school.get('bus_desc', 'Not available')
                }
        
        # If no exact match, try enhanced fuzzy matching
        db_words = [word for word in school_name_lower.replace('(', '').replace(')', '').split() 
                   if len(word) >= 3 and word not in ['school', 'primary']]
        
        if len(db_words) >= 2:  # Only try fuzzy match if we have significant words
            for gov_school in gov_schools:
                gov_name_lower = gov_school['name'].lower()
                # Require at least 80% of significant words to match
                matches = sum(1 for word in db_words if word in gov_name_lower)
                match_ratio = matches / len(db_words)
                
                if match_ratio >= 0.8:  # 80% match required
                    return {
                        'address': gov_school.get('address', 'Not available'),
                        'postal_code': gov_school.get('postal_code', 'Not available'),
                        'phone': gov_school.get('phone', 'Not available'),
                        'email': gov_school.get('email', 'Not available'),
                        'website': gov_school.get('website', 'Not available'),
                        'mrt_desc': gov_school.get('mrt_desc', 'Not available'),
                        'bus_desc': gov_school.get('bus_desc', 'Not available')
                    }
        
        # No good match found
        return {
            'message': 'Contact information not available - no matching school found in government database'
        }
        
    except:
        return {
            'message': 'Contact information could not be retrieved'
        }

# SCHOOL RANKINGS API
@schools_bp.route('/rankings', methods=['GET'])
def get_school_rankings():
    """Get school rankings based on Phase 2C applicant-to-vacancy ratio"""
    try:
        # Get query parameters
        tier_filter = request.args.get('tier')  # Filter by competitiveness tier
        balloted_only = request.args.get('balloted_only', 'false').lower() == 'true'
        limit = request.args.get('limit', type=int)  # Limit results
        
        # Get all schools
        query = School.query
        
        # Apply filters
        if balloted_only:
            query = query.filter(School.balloted == True)
        
        if tier_filter:
            query = query.filter(School.competitiveness_tier == tier_filter)
        
        schools = query.all()
        
        rankings = []
        
        for school in schools:
            try:
                # Parse phase data
                phase_2c_data = json.loads(school.phase_2c_data) if school.phase_2c_data else {}
                
                # Calculate Phase 2C ratio (applicants / vacancies)
                vacancies = phase_2c_data.get('vacancies', 0)
                applicants = phase_2c_data.get('applicants', 0)
                
                # Calculate ratio (handle division by zero)
                if vacancies > 0 and applicants > 0:
                    ratio = round(applicants / vacancies, 2)
                elif applicants > 0 and vacancies == 0:
                    ratio = float('inf')  # Infinite demand with no spots
                else:
                    ratio = 0.0
                
                # Get balloting status from phase 2C data
                balloting_code = phase_2c_data.get('balloting_code', '')
                has_balloting = phase_2c_data.get('balloting', False) or bool(balloting_code)
                
                # Get competitiveness metrics
                comp_metrics = json.loads(school.competitiveness_metrics) if school.competitiveness_metrics else {}
                
                ranking_data = {
                    'school_key': school.school_key,
                    'name': school.name,
                    'vacancies_2c': vacancies,
                    'applicants_2c': applicants,
                    'ratio_2c': ratio,
                    'balloting_2c': has_balloting,
                    'balloting_code': balloting_code,
                    'total_vacancy': school.total_vacancy,
                    'competitiveness_tier': school.competitiveness_tier,
                    'overall_score': school.overall_competitiveness_score or 0,
                    'balloted_phases': comp_metrics.get('balloting_phases', []),
                    'year': school.year
                }
                
                rankings.append(ranking_data)
                
            except Exception as e:
                print(f"Error processing school {school.name}: {e}")
                continue
        
        # Sort by ratio (descending) - higher ratio = more competitive = higher rank
        def sort_key(school_data):
            ratio = school_data['ratio_2c']
            if ratio == float('inf'):
                return (0, -school_data['applicants_2c'])  # Sort by applicants if infinite
            elif ratio > 0:
                return (1, -ratio)  # Negative for descending order
            else:
                return (2, -school_data['total_vacancy'])  # Sort by total vacancy for non-competitive schools
        
        rankings.sort(key=sort_key)
        
        # Add rank positions
        for i, school in enumerate(rankings, 1):
            school['rank'] = i
        
        # Apply limit if specified
        if limit:
            rankings = rankings[:limit]
        
        # Calculate summary statistics
        total_schools = len(rankings)
        balloted_schools = len([s for s in rankings if s['balloting_2c']])
        avg_ratio = sum(s['ratio_2c'] for s in rankings if s['ratio_2c'] != float('inf')) / max(1, len([s for s in rankings if s['ratio_2c'] != float('inf')]))
        
        return jsonify({
            'rankings': rankings,
            'summary': {
                'total_schools': total_schools,
                'balloted_schools': balloted_schools,
                'average_ratio': round(avg_ratio, 2),
                'most_competitive': rankings[0] if rankings else None,
                'data_year': 2024
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to get rankings: {str(e)}'}), 500

# SCHOOL SEARCH APIs
@schools_bp.route('/search', methods=['GET'])
def search_schools():
    """Search schools by name with auto-suggestions"""
    try:
        query = request.args.get('q', '').strip()
        limit = request.args.get('limit', 10, type=int)
        
        if not query:
            return jsonify({'schools': []})
        
        # Get all schools for fuzzy matching
        all_schools = School.query.all()
        
        # Create list of school names with their objects
        school_names = [(school.name, school) for school in all_schools]
        
        # Use difflib for fuzzy matching
        matches = difflib.get_close_matches(
            query, 
            [name for name, _ in school_names], 
            n=limit, 
            cutoff=0.3
        )
        
        # Get school objects for matches
        matched_schools = []
        for match in matches:
            school_obj = next((school for name, school in school_names if name == match), None)
            if school_obj:
                matched_schools.append({
                    'school_key': school_obj.school_key,
                    'name': school_obj.name,
                    'competitiveness_tier': school_obj.competitiveness_tier,
                    'balloted': school_obj.balloted
                })
        
        # Also include exact substring matches for better results
        exact_matches = []
        query_lower = query.lower()
        for school in all_schools:
            if query_lower in school.name.lower() and school.name not in matches:
                exact_matches.append({
                    'school_key': school.school_key,
                    'name': school.name,
                    'competitiveness_tier': school.competitiveness_tier,
                    'balloted': school.balloted
                })
        
        # Combine and limit results
        all_matches = matched_schools + exact_matches
        final_results = all_matches[:limit]
        
        return jsonify({'schools': final_results})
        
    except Exception as e:
        return jsonify({'error': f'Search failed: {str(e)}'}), 500

@schools_bp.route('/search', methods=['POST'])
def search_schools_by_location():
    """Search for schools near a given location"""
    data = request.get_json()
    address = data.get('address', '')
    radius = data.get('radius', 2)  # Default 2km radius
    
    if not address:
        return jsonify({'error': 'Address is required'}), 400
    
    # Geocode the user's address
    user_location = geocode_address(address)
    if not user_location:
        return jsonify({'error': 'Could not geocode address'}), 400
    
    # Get all schools data from government API
    schools = get_schools_data()
    
    # Calculate distances and filter by radius
    nearby_schools = []
    for school in schools:
        # Geocode school address
        school_location = geocode_address(school['address'])
        if school_location:
            distance = calculate_distance(
                user_location['latitude'], user_location['longitude'],
                school_location['latitude'], school_location['longitude']
            )
            
            if distance <= radius:
                school['distance'] = round(distance, 2)
                school['latitude'] = school_location['latitude']
                school['longitude'] = school_location['longitude']
                nearby_schools.append(school)
    
    # Sort by distance
    nearby_schools.sort(key=lambda x: x['distance'])
    
    return jsonify({
        'user_location': user_location,
        'schools': nearby_schools,
        'total_found': len(nearby_schools)
    })

@schools_bp.route('/search-detailed', methods=['POST'])
def search_schools_detailed():
    """Search schools by name and return detailed info with suggestions"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({'schools': []})
        
        # Get all schools
        all_schools = School.query.all()
        
        # Filter schools that match the query
        matching_schools = []
        query_lower = query.lower()
        
        for school in all_schools:
            school_name_lower = school.name.lower()
            
            # Exact match gets highest priority
            if query_lower == school_name_lower:
                score = 100
            # Starts with query gets high priority
            elif school_name_lower.startswith(query_lower):
                score = 90
            # Contains query gets medium priority
            elif query_lower in school_name_lower:
                score = 70
            # Word match gets lower priority
            elif any(word in school_name_lower for word in query_lower.split()):
                score = 50
            else:
                continue
                
            matching_schools.append((score, school))
        
        # Sort by score (descending) and limit to top 10
        matching_schools.sort(key=lambda x: x[0], reverse=True)
        top_schools = [school for score, school in matching_schools[:10]]
        
        school_suggestions = []
        for school in top_schools:
            # Parse phase 2C data for basic info
            phase_2c_data = {}
            if school.phase_2c_data:
                try:
                    phase_2c_data = json.loads(school.phase_2c_data)
                except:
                    phase_2c_data = {}
            
            school_info = {
                'school_key': school.school_key,
                'name': school.name,
                'competitiveness_tier': school.competitiveness_tier,
                'balloted': school.balloted,
                'phase_2c_vacancies': phase_2c_data.get('vacancies', 0),
                'phase_2c_applicants': phase_2c_data.get('applicants', 0)
            }
            school_suggestions.append(school_info)
        
        return jsonify({'schools': school_suggestions})
        
    except Exception as e:
        return jsonify({'error': f'Search failed: {str(e)}'}), 500

# SCHOOL DETAIL APIs
@schools_bp.route('/<school_key>', methods=['GET'])
def get_school_detail(school_key):
    """Get detailed information for a specific school"""
    try:
        school = School.query.filter_by(school_key=school_key).first()
        
        if not school:
            return jsonify({'error': 'School not found'}), 404
        
        # Parse all phase data
        phase_data = {}
        for phase in ['phase_1', 'phase_2a', 'phase_2b', 'phase_2c', 'phase_2c_supp']:
            phase_field = f"{phase}_data"
            if hasattr(school, phase_field):
                raw_data = getattr(school, phase_field)
                if raw_data:
                    try:
                        phase_data[phase] = json.loads(raw_data)
                    except:
                        phase_data[phase] = {}
                else:
                    phase_data[phase] = {}
        
        # Get competitiveness metrics
        comp_metrics = {}
        if school.competitiveness_metrics:
            try:
                comp_metrics = json.loads(school.competitiveness_metrics)
            except:
                comp_metrics = {}
        
        # Get contact info
        contact_info = find_school_contact_info(school.name)
        
        school_detail = {
            'school_key': school.school_key,
            'name': school.name,
            'total_vacancy': school.total_vacancy,
            'balloted': school.balloted,
            'year': school.year,
            'competitiveness_tier': school.competitiveness_tier,
            'overall_competitiveness_score': school.overall_competitiveness_score,
            'phases': phase_data,
            'competitiveness_metrics': comp_metrics,
            'contact_info': contact_info,
            'analysis': {
                'most_competitive_phase': school.get_most_competitive_phase(),
                'overall_success_rate': school.calculate_overall_success_rate(),
                'strategy_recommendation': school.get_strategy_recommendation()
            }
        }
        
        return jsonify(school_detail)
        
    except Exception as e:
        return jsonify({'error': f'Failed to get school details: {str(e)}'}), 500

@schools_bp.route('/detail', methods=['POST'])
def get_school_detail_by_key():
    """Get detailed school information including all phases and analysis"""
    try:
        data = request.get_json()
        school_key = data.get('school_key')
        
        if not school_key:
            return jsonify({'error': 'School key is required'}), 400
        
        school = School.query.filter_by(school_key=school_key).first()
        
        if not school:
            return jsonify({'error': 'School not found'}), 404
        
        # Parse all phase data
        phases = {}
        for phase_name in ['phase_1', 'phase_2a', 'phase_2b', 'phase_2c', 'phase_2c_supp']:
            phase_data_field = f"{phase_name}_data"
            if hasattr(school, phase_data_field):
                raw_data = getattr(school, phase_data_field)
                if raw_data:
                    try:
                        phases[phase_name] = json.loads(raw_data)
                    except:
                        phases[phase_name] = {}
                else:
                    phases[phase_name] = {}
        
        # Parse competitiveness metrics
        comp_metrics = {}
        if school.competitiveness_metrics:
            try:
                comp_metrics = json.loads(school.competitiveness_metrics)
            except:
                comp_metrics = {}
        
        # Try to match school with contact info from CSV data
        contact_info = find_school_contact_info(school.name)
        
        school_detail = {
            'school_key': school.school_key,
            'name': school.name,
            'total_vacancy': school.total_vacancy,
            'balloted': school.balloted,
            'year': school.year,
            'competitiveness_tier': school.competitiveness_tier,
            'overall_competitiveness_score': school.overall_competitiveness_score,
            'phases': phases,
            'competitiveness_metrics': comp_metrics,
            'contact_info': contact_info,
            'analysis': {
                'most_competitive_phase': school.get_most_competitive_phase(),
                'overall_success_rate': school.calculate_overall_success_rate(),
                'strategy_recommendation': school.get_strategy_recommendation()
            }
        }
        
        return jsonify(school_detail)
        
    except Exception as e:
        return jsonify({'error': f'Failed to get school details: {str(e)}'}), 500

# UTILITY APIs
@schools_bp.route('/all', methods=['GET'])
def get_all_schools():
    """Get all primary schools"""
    schools = get_schools_data()
    return jsonify({'schools': schools, 'total': len(schools)})

@schools_bp.route('/geocode', methods=['POST'])
def geocode():
    """Geocode an address"""
    data = request.get_json()
    address = data.get('address', '')
    
    if not address:
        return jsonify({'error': 'Address is required'}), 400
    
    location = geocode_address(address)
    if not location:
        return jsonify({'error': 'Could not geocode address'}), 400
    
    return jsonify(location)

