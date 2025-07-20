#!/usr/bin/env python3
"""
Migration script to populate database with comprehensive P1 2024 data
"""
import json
import sys
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Add src to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.models.user import db, School

def create_app():
    """Create Flask app for migration"""
    app = Flask(__name__)
    
    # Use absolute path for database
    db_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    return app

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

def migrate_p1_data():
    """Main migration function"""
    print("🚀 Starting P1 data migration...")
    
    # Load the extracted P1 data
    try:
        with open('../extracted_p1_school_data.json', 'r') as f:
            data = json.load(f)
        print(f"✓ Loaded P1 data with {len(data['schools'])} schools")
    except FileNotFoundError:
        print("✗ Error: extracted_p1_school_data.json not found")
        print("  Make sure the file is in the parent directory")
        return False
    except Exception as e:
        print(f"✗ Error loading P1 data: {e}")
        return False
    
    # Create app and database
    app = create_app()
    with app.app_context():
        try:
            # Create tables if they don't exist
            db.create_all()
            print("✓ Database tables ready")
            
            # Clear existing schools (for fresh migration)
            School.query.delete()
            db.session.commit()
            print("✓ Cleared existing school data")
            
            schools_added = 0
            
            for school_data in data['schools']:
                try:
                    school_name = school_data['name']
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
                    
                    if schools_added % 20 == 0:
                        print(f"  → Processed {schools_added} schools...")
                
                except Exception as e:
                    print(f"✗ Error processing school {school_data.get('name', 'unknown')}: {e}")
                    continue
            
            # Commit all changes
            db.session.commit()
            print(f"✅ Successfully migrated {schools_added} schools to database")
            
            # Verify migration
            total_schools = School.query.count()
            balloted_schools = School.query.filter_by(balloted=True).count()
            
            print(f"\n📊 Migration Summary:")
            print(f"  Total schools in database: {total_schools}")
            print(f"  Schools with balloting: {balloted_schools}")
            print(f"  Schools without balloting: {total_schools - balloted_schools}")
            
            # Show competitiveness distribution
            tiers = db.session.query(School.competitiveness_tier, db.func.count(School.id)).group_by(School.competitiveness_tier).all()
            print(f"\n🏆 Competitiveness Distribution:")
            for tier, count in tiers:
                print(f"  {tier}: {count} schools")
            
            return True
            
        except Exception as e:
            print(f"✗ Database error: {e}")
            db.session.rollback()
            return False

if __name__ == "__main__":
    success = migrate_p1_data()
    if success:
        print("\n🎉 P1 data migration completed successfully!")
    else:
        print("\n❌ P1 data migration failed. Check errors above.")
    
    sys.exit(0 if success else 1) 