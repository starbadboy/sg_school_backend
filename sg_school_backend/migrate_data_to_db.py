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

def migrate_p1_data():
    """Migrate P1 data from JSON files to database"""
    
    # Path to the complete P1 data file
    data_file = os.path.join(os.path.dirname(__file__), 'src', 'database', 'p1_2024_complete_data.json')
    
    if not os.path.exists(data_file):
        print(f"Data file not found: {data_file}")
        return False
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        schools_data = data.get('schools', {})
        print(f"Found {len(schools_data)} schools in JSON data")
        
        # Clear existing school data
        print("Clearing existing school data...")
        School.query.delete()
        
        # Add each school to database
        added_count = 0
        for school_key, school_info in schools_data.items():
            try:
                school = School(
                    school_key=school_key,
                    name=school_info.get('name', ''),
                    total_vacancy=school_info.get('total_vacancy', 0),
                    balloted=school_info.get('balloted', False),
                    year=school_info.get('year', 2024),
                    overall_competitiveness_score=school_info.get('overall_competitiveness_score', 0.0),
                    competitiveness_tier=school_info.get('competitiveness_tier', 'Unknown')
                )
                
                # Set phase data
                phases = school_info.get('phases', {})
                for phase_name in ['phase_1', 'phase_2a', 'phase_2b', 'phase_2c', 'phase_2c_supp', 'phase_3']:
                    if phase_name in phases:
                        school.set_phase_data(phase_name, phases[phase_name])
                
                # Set competitiveness metrics
                if 'competitiveness_metrics' in school_info:
                    school.set_competitiveness_metrics(school_info['competitiveness_metrics'])
                
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