from flask import Blueprint, request, jsonify, current_app
import requests
import pandas as pd
from bs4 import BeautifulSoup
import math
import json
from src.models.user import db, School

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

def load_real_p1_data():
    """Load real 2024 P1 data from database"""
    try:
        schools = School.query.all()
        schools_dict = {}
        for school in schools:
            schools_dict[school.school_key] = school.to_dict()
        return schools_dict
    except Exception as e:
        print(f"Error loading real P1 data from database: {e}")
        return {}

def extract_p1_data_for_school(school_name, year=2024):
    """Extract real P1 data for a specific school from database with improved fuzzy matching"""
    try:
            # Create school key from name - normalize the name
            school_key = school_name.lower().replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '').replace('.', '').replace("'", '').replace(',', '').replace('&', 'and')
            
            # 1. Direct lookup by school_key first
            school = School.query.filter_by(school_key=school_key).first()
            if school:
                return format_p1_data_from_school(school, school_name)
            
            # 2. Try fuzzy matching by name (case-insensitive)
            school = School.query.filter(School.name.ilike(f'%{school_name}%')).first()
            if school:
                return format_p1_data_from_school(school, school_name)
            
            # 3. ENHANCED: Aggressive suffix removal for government API names
            cleaned_search_name = school_name.lower()
            
            # Remove common government API suffixes (more comprehensive)
            suffixes_to_remove = [
                ' school (primary)',
                ' primary school', 
                ' school',
                ' primary',
                ' (primary)',
                ' (pri)',
                ' pri'
            ]
            
            for suffix in suffixes_to_remove:
                cleaned_search_name = cleaned_search_name.replace(suffix, '').strip()
            
            # Remove extra whitespace and normalize
            cleaned_search_name = ' '.join(cleaned_search_name.split())
            
            if cleaned_search_name != school_name.lower() and len(cleaned_search_name) > 2:
                # Try exact match with cleaned name
                school = School.query.filter(School.name.ilike(cleaned_search_name)).first()
                if school:
                    return format_p1_data_from_school(school, school_name)
                
                # Try partial match with cleaned name
                school = School.query.filter(School.name.ilike(f'%{cleaned_search_name}%')).first()
                if school:
                    return format_p1_data_from_school(school, school_name)
            
            # 4. ENHANCED: Better word-by-word matching
            # Split cleaned name into significant words (3+ chars)
            search_words = [word.strip() for word in cleaned_search_name.split() if len(word.strip()) >= 3]
            
            if search_words:
                # Try to find schools that contain ALL significant words
                for school in School.query.all():
                    school_name_lower = school.name.lower()
                    if all(word in school_name_lower for word in search_words):
                        return format_p1_data_from_school(school, school_name)
                
                # Try to find schools that contain MOST significant words (80%+ match)
                if len(search_words) > 1:
                    min_matches = max(1, int(len(search_words) * 0.8))  # 80% of words must match
                    for school in School.query.all():
                        school_name_lower = school.name.lower()
                        matches = sum(1 for word in search_words if word in school_name_lower)
                        if matches >= min_matches:
                            return format_p1_data_from_school(school, school_name)
            
            # 5. ENHANCED: Try key-based matching with cleaned name
            cleaned_key = cleaned_search_name.replace(' ', '_').replace('-', '_').replace('&', 'and')
            school_words = [word for word in cleaned_key.split('_') if len(word) >= 3]
            
            for word in school_words:
                school = School.query.filter(School.school_key.like(f'%{word}%')).first()
                if school:
                    return format_p1_data_from_school(school, school_name)
            
            # 6. ENHANCED: Advanced pattern matching for specific cases
            search_patterns = {
                # Handle common naming patterns
                'fairfield': ['fairfield'],
                'methodist': ['methodist'], 
                'anderson': ['anderson'],
                'ang_mo_kio': ['ang_mo_kio', 'ang mo kio'],
                'ai_tong': ['ai_tong', 'ai tong'],
                'chij': ['chij'],
                'nanyang': ['nanyang'],
                'raffles': ['raffles'],
                'catholic': ['catholic'],
                'tao_nan': ['tao_nan', 'tao nan'],
                'new_town': ['new_town', 'new town'],
                'anglo_chinese': ['anglo_chinese', 'anglo-chinese'],
                'st_': ['st_', 'saint'],
                'geylang': ['geylang'],
                'queenstown': ['queenstown']
            }
            
            for pattern, variants in search_patterns.items():
                if any(variant in cleaned_search_name.replace('_', ' ') for variant in variants):
                    for variant in variants:
                        school = School.query.filter(School.school_key.like(f'%{variant.replace(" ", "_")}%')).first()
                        if school:
                            return format_p1_data_from_school(school, school_name)
                        school = School.query.filter(School.name.ilike(f'%{variant}%')).first()
                        if school:
                            return format_p1_data_from_school(school, school_name)
            
            # If no match found, return "no data available"
            return {
                'year': year,
                'school_name': school_name,
                'data_available': False,
                'message': 'No P1 data available for this school in our database',
                'total_schools_in_database': School.query.count(),
                'suggestion': 'Please check the school name or try searching for similar schools'
            }
        
    except Exception as e:
        print(f"Error extracting P1 data for {school_name}: {e}")
        return {
            'year': year,
            'school_name': school_name,
            'data_available': False,
            'message': 'Error retrieving P1 data',
            'error': str(e)
        }

def format_p1_data_from_school(school, school_name):
    """Format P1 data from School model for API response"""
    return {
        'year': school.year,
        'phases': {
            'phase_1': school.get_phase_data('phase_1'),
            'phase_2a': school.get_phase_data('phase_2a'),
            'phase_2b': school.get_phase_data('phase_2b'),
            'phase_2c': school.get_phase_data('phase_2c'),
            'phase_2c_supp': school.get_phase_data('phase_2c_supp'),
            'phase_3': school.get_phase_data('phase_3'),
        },
        'total_vacancy': school.total_vacancy,
        'balloted': school.balloted,
        'school_name': school_name,
        'competitiveness_score': school.overall_competitiveness_score,
        'competitiveness_tier': school.competitiveness_tier
    }



def enrich_school_with_p1_data(school):
    """Enrich government school data with P1 data from database using improved fuzzy matching"""
    try:
        # Try to find matching school in our database
        school_name = school.get('name', '')
        
        # Use the same enhanced matching logic as extract_p1_data_for_school
        
        # 1. Direct exact match first
        db_school = School.query.filter(School.name.ilike(school_name)).first()
        if db_school:
            # Found exact match, use it
            school['p1_data'] = db_school.to_p1_data_format()
            return school
        
        # 2. ENHANCED: Aggressive suffix removal for government API names
        cleaned_search_name = school_name.lower()
        
        # Remove common government API suffixes (comprehensive)
        suffixes_to_remove = [
            ' school (primary)',
            ' primary school', 
            ' school',
            ' primary',
            ' (primary)',
            ' (pri)',
            ' pri'
        ]
        
        for suffix in suffixes_to_remove:
            cleaned_search_name = cleaned_search_name.replace(suffix, '').strip()
        
        # Remove extra whitespace and normalize
        cleaned_search_name = ' '.join(cleaned_search_name.split())
        
        if cleaned_search_name != school_name.lower() and len(cleaned_search_name) > 2:
            # Try exact match with cleaned name
            db_school = School.query.filter(School.name.ilike(cleaned_search_name)).first()
            if db_school:
                school['p1_data'] = db_school.to_p1_data_format()
                return school
            
            # Try partial match with cleaned name
            db_school = School.query.filter(School.name.ilike(f'%{cleaned_search_name}%')).first()
            if db_school:
                school['p1_data'] = db_school.to_p1_data_format()
                return school
        
        # 3. ENHANCED: Better word-by-word matching
        search_words = [word.strip() for word in cleaned_search_name.split() if len(word.strip()) >= 3]
        
        if search_words:
            # Try to find schools that contain ALL significant words
            for db_school in School.query.all():
                school_name_lower = db_school.name.lower()
                if all(word in school_name_lower for word in search_words):
                    school['p1_data'] = db_school.to_p1_data_format()
                    return school
            
            # Try to find schools that contain MOST significant words (80%+ match)
            if len(search_words) > 1:
                min_matches = max(1, int(len(search_words) * 0.8))
                for db_school in School.query.all():
                    school_name_lower = db_school.name.lower()
                    matches = sum(1 for word in search_words if word in school_name_lower)
                    if matches >= min_matches:
                        school['p1_data'] = db_school.to_p1_data_format()
                        return school
        
        # 4. ENHANCED: Key-based matching
        cleaned_key = cleaned_search_name.replace(' ', '_').replace('-', '_').replace('&', 'and')
        school_words = [word for word in cleaned_key.split('_') if len(word) >= 3]
        
        for word in school_words:
            db_school = School.query.filter(School.school_key.like(f'%{word}%')).first()
            if db_school:
                school['p1_data'] = db_school.to_p1_data_format()
                return school
        
        # 5. ENHANCED: Pattern matching for specific cases
        search_patterns = {
            'fairfield': ['fairfield'],
            'methodist': ['methodist'], 
            'anderson': ['anderson'],
            'ang_mo_kio': ['ang_mo_kio', 'ang mo kio'],
            'ai_tong': ['ai_tong', 'ai tong'],
            'chij': ['chij'],
            'nanyang': ['nanyang'],
            'raffles': ['raffles'],
            'catholic': ['catholic'],
            'tao_nan': ['tao_nan', 'tao nan'],
            'new_town': ['new_town', 'new town'],
            'anglo_chinese': ['anglo_chinese', 'anglo-chinese'],
            'st_': ['st_', 'saint'],
            'geylang': ['geylang'],
            'queenstown': ['queenstown']
        }
        
        for pattern, variants in search_patterns.items():
            if any(variant in cleaned_search_name.replace('_', ' ') for variant in variants):
                for variant in variants:
                    db_school = School.query.filter(School.school_key.like(f'%{variant.replace(" ", "_")}%')).first()
                    if db_school:
                        school['p1_data'] = db_school.to_p1_data_format()
                        return school
                    db_school = School.query.filter(School.name.ilike(f'%{variant}%')).first()
                    if db_school:
                        school['p1_data'] = db_school.to_p1_data_format()
                        return school
        
        # If no match found, return no data available
        school['p1_data'] = {
            'year': 2024,
            'school_name': school_name,
            'data_available': False,
            'message': 'No P1 data available for this school in our database',
            'total_schools_in_database': School.query.count()
        }
        return school
            
    except Exception as e:
        print(f"Error enriching school {school.get('name', 'Unknown')}: {e}")
        # Return error state instead of mock data
        school['p1_data'] = {
            'year': 2024,
            'school_name': school.get('name', 'Unknown'),
            'data_available': False,
            'message': 'Error retrieving P1 data',
            'error': str(e)
        }
        return school

@schools_bp.route('/search', methods=['POST'])
def search_schools():
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
                
                # Enrich with P1 data from database
                enriched_school = enrich_school_with_p1_data(school)
                nearby_schools.append(enriched_school)
    
    # Sort by distance
    nearby_schools.sort(key=lambda x: x['distance'])
    
    return jsonify({
        'user_location': user_location,
        'schools': nearby_schools,
        'total_found': len(nearby_schools)
    })

@schools_bp.route('/school/<school_name>/p1-data', methods=['GET'])
def get_school_p1_data(school_name):
    """Get detailed P1 data for a specific school"""
    year = request.args.get('year', 2024, type=int)
    
    p1_data = extract_p1_data_for_school(school_name, year)
    if not p1_data:
        return jsonify({'error': 'P1 data not found'}), 404
    
    return jsonify(p1_data)

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

@schools_bp.route('/database', methods=['GET'])
def get_schools_from_database():
    """Get all schools from database - useful for debugging"""
    try:
        schools = School.query.all()
        schools_data = []
        for school in schools:
            school_dict = school.to_dict()
            schools_data.append(school_dict)
        
        return jsonify({
            'schools': schools_data,
            'total_count': len(schools_data)
        })
    except Exception as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@schools_bp.route('/database/<school_key>', methods=['GET'])
def get_school_by_key(school_key):
    """Get a specific school by its key from database"""
    try:
        school = School.query.filter_by(school_key=school_key).first()
        if not school:
            return jsonify({'error': 'School not found'}), 404
        
        return jsonify(school.to_dict())
    except Exception as e:
        return jsonify({'error': f'Database error: {str(e)}'}), 500

@schools_bp.route('/search-by-name', methods=['GET'])
def search_schools_by_name():
    """Search schools by name with autocomplete suggestions"""
    query = request.args.get('query', '').strip()
    limit = request.args.get('limit', 10, type=int)
    
    if not query:
        return jsonify({'suggestions': [], 'total': 0})
    
    if len(query) < 2:
        return jsonify({'suggestions': [], 'total': 0, 'message': 'Query too short, minimum 2 characters'})
    
    try:
        # Search in database first (most relevant)
        db_suggestions = []
        db_schools = School.query.filter(School.name.ilike(f'%{query}%')).limit(limit).all()
        
        for school in db_schools:
            db_suggestions.append({
                'id': school.school_key,
                'name': school.name,
                'source': 'database',
                'has_p1_data': True,
                'year': school.year,
                'competitiveness_tier': school.competitiveness_tier,
                'total_vacancy': school.total_vacancy,
                'balloted': school.balloted
            })
        
        # If we have enough suggestions from database, return them
        if len(db_suggestions) >= limit:
            return jsonify({
                'suggestions': db_suggestions[:limit],
                'total': len(db_suggestions),
                'query': query
            })
        
        # Otherwise, supplement with government API data
        try:
            gov_schools = get_schools_data()
            gov_suggestions = []
            
            query_lower = query.lower()
            for school in gov_schools:
                school_name = school.get('name', '')
                if query_lower in school_name.lower():
                    # Check if we already have this school from database
                    already_included = any(db_school['name'].lower() == school_name.lower() 
                                         for db_school in db_suggestions)
                    
                    if not already_included:
                        gov_suggestions.append({
                            'id': school_name.lower().replace(' ', '_').replace('-', '_'),
                            'name': school_name,
                            'source': 'government',
                            'has_p1_data': False,
                            'address': school.get('address', ''),
                            'phone': school.get('phone', ''),
                            'email': school.get('email', '')
                        })
            
            # Sort government suggestions by relevance (exact match first, then starts with, then contains)
            def sort_relevance(item):
                name_lower = item['name'].lower()
                if name_lower == query_lower:
                    return 0  # Exact match
                elif name_lower.startswith(query_lower):
                    return 1  # Starts with query
                else:
                    return 2  # Contains query
            
            gov_suggestions.sort(key=sort_relevance)
            
            # Combine results (database first, then government)
            all_suggestions = db_suggestions + gov_suggestions
            
            return jsonify({
                'suggestions': all_suggestions[:limit],
                'total': len(all_suggestions),
                'query': query,
                'database_matches': len(db_suggestions),
                'government_matches': len(gov_suggestions)
            })
            
        except Exception as e:
            print(f"Error fetching government data: {e}")
            # Return only database results if government API fails
            return jsonify({
                'suggestions': db_suggestions,
                'total': len(db_suggestions),
                'query': query,
                'note': 'Limited to database results due to external API error'
            })
    
    except Exception as e:
        return jsonify({'error': f'Search error: {str(e)}'}), 500

@schools_bp.route('/school-detail/<path:school_name>', methods=['GET'])
def get_school_detail(school_name):
    """Get comprehensive school details including P1 data, contact info, and analysis"""
    try:
        # Decode URL-encoded school name
        school_name = school_name.replace('%20', ' ')
        
        # Try to find in database first
        db_school = School.query.filter(School.name.ilike(school_name)).first()
        
        if db_school:
            # Found in database - return comprehensive data
            school_detail = {
                'basic_info': {
                    'name': db_school.name,
                    'school_key': db_school.school_key,
                    'year': db_school.year,
                    'source': 'database',
                    'has_comprehensive_data': True
                },
                'p1_data': {
                    'total_vacancy': db_school.total_vacancy,
                    'balloted': db_school.balloted,
                    'competitiveness_score': db_school.overall_competitiveness_score,
                    'competitiveness_tier': db_school.competitiveness_tier,
                    'phases': {
                        'phase_1': db_school.get_phase_data('phase_1'),
                        'phase_2a': db_school.get_phase_data('phase_2a'),
                        'phase_2b': db_school.get_phase_data('phase_2b'),
                        'phase_2c': db_school.get_phase_data('phase_2c'),
                        'phase_2c_supp': db_school.get_phase_data('phase_2c_supp'),
                        'phase_3': db_school.get_phase_data('phase_3'),
                    }
                },
                'analysis': {
                    'overall_success_rate': db_school.calculate_overall_success_rate(),
                    'most_competitive_phase': db_school.get_most_competitive_phase(),
                    'recommendation': db_school.get_strategy_recommendation()
                }
            }
            
            # Try to get additional contact info from government API
            try:
                gov_schools = get_schools_data()
                db_school_name_lower = db_school.name.lower()
                
                # First try exact match
                for gov_school in gov_schools:
                    if gov_school['name'].lower() == db_school_name_lower:
                        school_detail['contact_info'] = {
                            'address': gov_school.get('address', 'Not available'),
                            'postal_code': gov_school.get('postal_code', 'Not available'),
                            'phone': gov_school.get('phone', 'Not available'),
                            'email': gov_school.get('email', 'Not available'),
                            'website': gov_school.get('website', 'Not available'),
                            'mrt_desc': gov_school.get('mrt_desc', 'Not available'),
                            'bus_desc': gov_school.get('bus_desc', 'Not available')
                        }
                        break
                else:
                    # If no exact match, try enhanced fuzzy matching
                    db_words = [word for word in db_school_name_lower.replace('(', '').replace(')', '').split() 
                               if len(word) >= 3 and word not in ['school', 'primary']]
                    
                    if len(db_words) >= 2:  # Only try fuzzy match if we have significant words
                        for gov_school in gov_schools:
                            gov_name_lower = gov_school['name'].lower()
                            # Require at least 80% of significant words to match
                            matches = sum(1 for word in db_words if word in gov_name_lower)
                            match_ratio = matches / len(db_words)
                            
                            if match_ratio >= 0.8:  # 80% match required
                                school_detail['contact_info'] = {
                                    'address': gov_school.get('address', 'Not available'),
                                    'postal_code': gov_school.get('postal_code', 'Not available'),
                                    'phone': gov_school.get('phone', 'Not available'),
                                    'email': gov_school.get('email', 'Not available'),
                                    'website': gov_school.get('website', 'Not available'),
                                    'mrt_desc': gov_school.get('mrt_desc', 'Not available'),
                                    'bus_desc': gov_school.get('bus_desc', 'Not available')
                                }
                                break
                        else:
                            # No good match found
                            school_detail['contact_info'] = {
                                'message': 'Contact information not available - no matching school found in government database'
                            }
                    else:
                        school_detail['contact_info'] = {
                            'message': 'Contact information not available - insufficient data for matching'
                        }
            except:
                school_detail['contact_info'] = {
                    'message': 'Contact information could not be retrieved'
                }
                
            return jsonify(school_detail)
        
        else:
            # Not in database - try to find in government API
            try:
                gov_schools = get_schools_data()
                for gov_school in gov_schools:
                    if gov_school['name'].lower() == school_name.lower():
                        school_detail = {
                            'basic_info': {
                                'name': gov_school['name'],
                                'source': 'government',
                                'has_comprehensive_data': False
                            },
                            'contact_info': {
                                'address': gov_school.get('address', 'Not available'),
                                'postal_code': gov_school.get('postal_code', 'Not available'),
                                'phone': gov_school.get('phone', 'Not available'),
                                'email': gov_school.get('email', 'Not available'),
                                'website': gov_school.get('website', 'Not available'),
                                'mrt_desc': gov_school.get('mrt_desc', 'Not available'),
                                'bus_desc': gov_school.get('bus_desc', 'Not available')
                            },
                            'p1_data': {
                                'message': 'P1 registration data not available for this school',
                                'suggestion': 'This school may not participate in the standard P1 registration process, or data may not be available yet.'
                            }
                        }
                        return jsonify(school_detail)
                
                # School not found anywhere
                return jsonify({
                    'error': 'School not found',
                    'message': f'No school found with name: {school_name}',
                    'suggestion': 'Please check the school name spelling or try searching with partial name'
                }), 404
                
            except Exception as e:
                return jsonify({
                    'error': 'Error retrieving school data',
                    'message': str(e)
                }), 500
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@schools_bp.route('/rankings', methods=['GET'])
def get_school_rankings():
    """Get school rankings based on competitiveness"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        competitiveness_filter = request.args.get('competitiveness')  # 'High', 'Medium', 'Low'
        balloted_filter = request.args.get('balloted')  # 'true', 'false'
        
        # Base query
        query = School.query
        
        # Apply filters
        if competitiveness_filter:
            query = query.filter(School.competitiveness_tier == competitiveness_filter)
        
        if balloted_filter is not None:
            balloted_bool = balloted_filter.lower() == 'true'
            query = query.filter(School.balloted == balloted_bool)
        
        # Order by competitiveness score (descending)
        query = query.order_by(School.overall_competitiveness_score.desc())
        
        # Get total count for pagination
        total_count = query.count()
        
        # Apply pagination
        schools = query.offset(offset).limit(limit).all()
        
        # Format results
        rankings = []
        for i, school in enumerate(schools):
            # Get Phase 2C data
            phase_2c_data = school.get_phase_data('phase_2c')
            vacancies_2c = phase_2c_data.get('vacancies', 0) if phase_2c_data else 0
            applicants_2c = phase_2c_data.get('applicants', 0) if phase_2c_data else 0
            
            # Calculate ratio (applicants per vacancy)
            if vacancies_2c > 0:
                ratio_2c = applicants_2c / vacancies_2c
            elif applicants_2c > 0:
                ratio_2c = float('inf')  # Infinity when no vacancies but have applicants
            else:
                ratio_2c = 0  # No competition
            
            school_data = {
                'rank': offset + i + 1,
                'name': school.name,
                'competitiveness_tier': school.competitiveness_tier,
                'balloted': school.balloted,
                'total_vacancy': school.total_vacancy,
                'year': school.year,
                'vacancies_2c': vacancies_2c,
                'applicants_2c': applicants_2c,
                'ratio_2c': ratio_2c
            }
            rankings.append(school_data)
        
        return jsonify({
            'rankings': rankings,
            'pagination': {
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': offset + limit < total_count
            },
            'filters_applied': {
                'competitiveness': competitiveness_filter,
                'balloted': balloted_filter
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Error retrieving rankings',
            'message': str(e)
        }), 500

