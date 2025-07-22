#!/usr/bin/env python3
"""
Database initialization script for production deployment
Automatically populates database with P1 data if empty
"""
import json
import os
from models.user import db, School

def normalize_school_key(school_name):
    """Convert school name to normalized key"""
    return school_name.lower().replace(' ', '_').replace("'", "").replace("-", "_")

def calculate_competitiveness_score(phases):
    """Calculate overall competitiveness score based on phase data"""
    total_score = 0
    weight_sum = 0
    
    # Phase 2C is most competitive indicator (highest weight)
    if 'phase_2c' in phases and phases['phase_2c'].get('applicants', 0) > 0:
        vacancies = phases['phase_2c'].get('vacancies', 1)
        applicants = phases['phase_2c'].get('applicants', 0)
        if vacancies > 0:
            ratio = applicants / vacancies
            total_score += ratio * 0.5  # 50% weight
            weight_sum += 0.5
    
    # Phase 2B (medium weight)
    if 'phase_2b' in phases and phases['phase_2b'].get('applicants', 0) > 0:
        vacancies = phases['phase_2b'].get('vacancies', 1)
        applicants = phases['phase_2b'].get('applicants', 0)
        if vacancies > 0:
            ratio = applicants / vacancies
            total_score += ratio * 0.3  # 30% weight
            weight_sum += 0.3
    
    # Phase 2A (lower weight)
    if 'phase_2a' in phases and phases['phase_2a'].get('applicants', 0) > 0:
        vacancies = phases['phase_2a'].get('vacancies', 1)
        applicants = phases['phase_2a'].get('applicants', 0)
        if vacancies > 0:
            ratio = applicants / vacancies
            total_score += ratio * 0.2  # 20% weight
            weight_sum += 0.2
    
    # Return weighted average if we have data, otherwise 0
    return total_score / weight_sum if weight_sum > 0 else 0.0

def get_competitiveness_tier(score):
    """Determine competitiveness tier based on score"""
    if score >= 2.0:
        return "Very High"
    elif score >= 1.5:
        return "High"
    elif score >= 1.2:
        return "Medium"
    elif score > 0:
        return "Low"
    else:
        return "Unknown"

def initialize_database_if_empty():
    """Initialize database with P1 data if it's empty"""
    try:
        # Check if database already has data
        school_count = School.query.count()
        if school_count > 0:
            print(f"✓ Database already has {school_count} schools - skipping initialization")
            return True
        
        print("🔍 Database is empty - starting automatic data initialization...")
        
        # Find the P1 data file - try multiple locations
        data_file_paths = [
            os.path.join(os.path.dirname(__file__), '..', '..', 'extracted_p1_school_data.json'),
        ]
        
        data = None
        used_file = None
        
        for file_path in data_file_paths:
            try:
                if os.path.exists(file_path):
                    with open(file_path, 'r') as f:
                        file_data = json.load(f)
                    
                    # Check if it's the extracted format (with 'schools' key) or direct format
                    if 'schools' in file_data:
                        data = file_data['schools']
                        used_file = file_path
                        print(f"✓ Found P1 data: {file_path} ({len(data)} schools)")
                        break
                    elif isinstance(file_data, list):
                        data = file_data
                        used_file = file_path
                        print(f"✓ Found P1 data: {file_path} ({len(data)} schools)")
                        break
                        
            except Exception as e:
                print(f"⚠️  Could not load {file_path}: {e}")
                continue
        
        if not data:
            print("❌ No P1 data file found - database will remain empty")
            return False
        
        print(f"📊 Populating database with {len(data)} schools...")
        schools_added = 0
        
        for school_data in data:
            try:
                school_name = school_data.get('name', '')
                if not school_name:
                    continue
                    
                school_key = normalize_school_key(school_name)
                
                # Calculate competitiveness metrics
                phases = school_data.get('phases', {})
                comp_score = calculate_competitiveness_score(phases)
                comp_tier = get_competitiveness_tier(comp_score)
                
                # Create competitiveness metrics JSON
                comp_metrics = {
                    "overall_score": comp_score,
                    "tier": comp_tier,
                    "balloting_phases": []
                }
                
                # Check which phases had balloting
                for phase_name, phase_data in phases.items():
                    if isinstance(phase_data, dict) and phase_data.get('balloting', False):
                        comp_metrics["balloting_phases"].append(phase_name)
                
                # Create school record
                school = School(
                    school_key=school_key,
                    name=school_name,
                    total_vacancy=school_data.get('total_vacancies', 0),
                    balloted=len(comp_metrics["balloting_phases"]) > 0,
                    year=2024,
                    phase_1_data=json.dumps(phases.get('phase_1', {})),
                    phase_2a_data=json.dumps(phases.get('phase_2a', {})),
                    phase_2b_data=json.dumps(phases.get('phase_2b', {})),
                    phase_2c_data=json.dumps(phases.get('phase_2c', {})),
                    phase_2c_supp_data=json.dumps(phases.get('phase_2c_supplementary', {})),
                    competitiveness_metrics=json.dumps(comp_metrics),
                    overall_competitiveness_score=comp_score,
                    competitiveness_tier=comp_tier
                )
                
                db.session.add(school)
                schools_added += 1
                
            except Exception as e:
                print(f"⚠️  Error processing school {school_data.get('name', 'unknown')}: {e}")
                continue
        
        # Commit all changes
        db.session.commit()
        
        # Verify the data
        total_schools = School.query.count()
        balloted_schools = School.query.filter_by(balloted=True).count()
        
        print(f"✅ Database initialization complete!")
        print(f"📊 Added {schools_added} schools from {os.path.basename(used_file)}")
        print(f"🎯 Total schools: {total_schools} | Balloted: {balloted_schools}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        db.session.rollback()
        return False 