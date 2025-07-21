#!/usr/bin/env python3
"""
Data migration script to populate the database with P1 school data from JSON files
"""
import os
import sys
import json

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from flask import Flask
from models.user import db, School, User

# Create Flask app for migration
def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    return app

def normalize_school_key(name):
    """Normalize school name to create a consistent key"""
    return name.lower().replace(' ', '_').replace('-', '_').replace('(', '').replace(')', '').replace('.', '').replace("'", '').replace(',', '')

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
    """Convert competitiveness score to tier"""
    if score >= 2.0:
        return "Very High"
    elif score >= 1.5:
        return "High" 
    elif score >= 1.2:
        return "Medium"
    elif score >= 0.8:
        return "Low"
    else:
        return "Very Low"

def migrate_p1_data():
    """Migrate P1 data from JSON files to database"""
    
    # Path to the complete P1 data file (180 schools)
    data_file = os.path.join(os.path.dirname(__file__), '..', 'extracted_p1_school_data.json')
    
    if not os.path.exists(data_file):
        print(f"Data file not found: {data_file}")
        return False
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        schools_data = data.get('schools', [])
        print(f"Found {len(schools_data)} schools in JSON data")
        
        # Clear existing school data
        print("Clearing existing school data...")
        School.query.delete()
        
        # Add each school to database
        added_count = 0
        for school_info in schools_data:
            # Generate school_key from name
            school_key = normalize_school_key(school_info.get('name', ''))
            try:
                # Handle different field names between data sources
                total_vacancy = school_info.get('total_vacancy', 0) or school_info.get('total_vacancies', 0)
                
                # Calculate balloted status from phases if not provided
                phases = school_info.get('phases', {})
                balloted = school_info.get('balloted', False)
                if not balloted:
                    # Check if any phase has balloting
                    for phase_data in phases.values():
                        if isinstance(phase_data, dict) and phase_data.get('balloting', False):
                            balloted = True
                            break
                
                # Calculate competitiveness metrics
                comp_score = calculate_competitiveness_score(phases)
                comp_tier = get_competitiveness_tier(comp_score)
                
                school = School(
                    school_key=school_key,
                    name=school_info.get('name', ''),
                    total_vacancy=total_vacancy,
                    balloted=balloted,
                    year=school_info.get('year', 2024),
                    overall_competitiveness_score=comp_score,
                    competitiveness_tier=comp_tier
                )
                
                # Set phase data (handle both formats)
                phase_mapping = {
                    'phase_1': 'phase_1',
                    'phase_2a': 'phase_2a', 
                    'phase_2b': 'phase_2b',
                    'phase_2c': 'phase_2c',
                    'phase_2c_supp': ['phase_2c_supp', 'phase_2c_supplementary'],  # Handle both names
                    'phase_3': 'phase_3'
                }
                
                for db_phase_name, source_phase_names in phase_mapping.items():
                    if isinstance(source_phase_names, list):
                        # Try both possible names
                        for source_name in source_phase_names:
                            if source_name in phases:
                                school.set_phase_data(db_phase_name, phases[source_name])
                                break
                    else:
                        # Single name
                        if source_phase_names in phases:
                            school.set_phase_data(db_phase_name, phases[source_phase_names])
                
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
                
                school.set_competitiveness_metrics(comp_metrics)
                
                db.session.add(school)
                added_count += 1
                
                if added_count % 10 == 0:
                    print(f"Added {added_count} schools...")
                    
            except Exception as e:
                print(f"Error adding school {school_key}: {e}")
                continue
        
        # Commit all changes
        db.session.commit()
        print(f"Successfully migrated {added_count} schools to database")
        
        return True
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.session.rollback()
        return False

def verify_migration():
    """Verify that the migration was successful"""
    try:
        total_schools = School.query.count()
        print(f"\nVerification: Found {total_schools} schools in database")
        
        # Show a sample of schools
        sample_schools = School.query.limit(5).all()
        print("\nSample schools:")
        for school in sample_schools:
            print(f"- {school.name} (Key: {school.school_key})")
            print(f"  Total Vacancy: {school.total_vacancy}")
            print(f"  Balloted: {school.balloted}")
            print(f"  Competitiveness: {school.competitiveness_tier}")
            
            # Check if P1 data is properly stored
            phase_2c = school.get_phase_data('phase_2c')
            if phase_2c:
                print(f"  Phase 2C: {phase_2c.get('applied', 0)}/{phase_2c.get('taken', 0)}")
            print()
        
        return True
        
    except Exception as e:
        print(f"Error during verification: {e}")
        return False

if __name__ == "__main__":
    print("Starting P1 data migration to database...")
    
    app = create_app()
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created/verified")
        
        # Migrate data
        if migrate_p1_data():
            print("Migration completed successfully!")
            
            # Verify migration
            if verify_migration():
                print("Migration verification passed!")
            else:
                print("Migration verification failed!")
        else:
            print("Migration failed!")
            sys.exit(1) 