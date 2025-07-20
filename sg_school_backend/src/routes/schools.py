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

