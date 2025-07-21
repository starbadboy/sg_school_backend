from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email
        }

class School(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    school_key = db.Column(db.String(100), unique=True, nullable=False)  # normalized key like 'admiralty'
    name = db.Column(db.String(200), nullable=False)
    total_vacancy = db.Column(db.Integer)
    balloted = db.Column(db.Boolean, default=False)
    year = db.Column(db.Integer, default=2024)
    
    # Phase data as JSON fields
    phase_1_data = db.Column(db.Text)  # JSON string
    phase_2a_data = db.Column(db.Text)  # JSON string
    phase_2b_data = db.Column(db.Text)  # JSON string
    phase_2c_data = db.Column(db.Text)  # JSON string
    phase_2c_supp_data = db.Column(db.Text)  # JSON string
    phase_3_data = db.Column(db.Text)  # JSON string
    
    # Competitiveness metrics as JSON
    competitiveness_metrics = db.Column(db.Text)  # JSON string
    overall_competitiveness_score = db.Column(db.Float, default=0.0)
    competitiveness_tier = db.Column(db.String(50))
    
    # School basic info (from government data)
    address = db.Column(db.String(500))
    postal_code = db.Column(db.String(10))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    website = db.Column(db.String(200))
    mrt_desc = db.Column(db.Text)
    bus_desc = db.Column(db.Text)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    def __repr__(self):
        return f'<School {self.name}>'

    def get_phase_data(self, phase_name):
        """Get phase data as dictionary, handling both old and new data formats"""
        phase_field = f"{phase_name}_data"
        if hasattr(self, phase_field):
            phase_json = getattr(self, phase_field)
            if phase_json:
                data = json.loads(phase_json)
                
                # Handle new comprehensive data format (from 2024 extraction)
                if 'vacancies' in data or 'applicants' in data or 'status' in data:
                    # New format - enhance with calculated fields for frontend compatibility
                    result = {
                        'vacancies': data.get('vacancies', 0),
                        'applicants': data.get('applicants', 0),
                        'balloting': data.get('balloting', False),
                        'balloting_details': data.get('balloting_details', {}),
                        'status': data.get('status', ''),
                        # Calculated fields for backward compatibility
                        'applied': data.get('applicants', 0),  # Map applicants to applied
                        'taken': 0,  # Will be calculated based on balloting outcome
                        'vacancy': data.get('vacancies', 0)
                    }
                    
                    # For Phase 1, handle special status format
                    if phase_name == 'phase_1' and 'status' in data:
                        result['taken'] = result['applicants']  # Assume all eligible applicants got places
                        result['phase_1_status'] = data['status']
                    
                    # Calculate taken based on vacancies and balloting
                    elif result['vacancies'] > 0:
                        if result['balloting']:
                            # FIXED: If balloting occurred, ALL vacancies were filled (oversubscribed)
                            # Balloting is just the method to decide WHO gets the spots
                            result['taken'] = result['vacancies']
                        else:
                            # No balloting means either under-subscribed or exactly filled
                            result['taken'] = min(result['applicants'], result['vacancies'])
                    
                    return result
                
                # Handle legacy format (pre-2024 data)
                else:
                    # Convert "accepted" to "taken" for frontend compatibility
                    if 'accepted' in data:
                        data['taken'] = data.pop('accepted')
                    
                    # Add vacancy field if missing
                    if 'vacancy' not in data:
                        applied = data.get('applied', 0)
                        taken = data.get('taken', 0)
                        
                        if applied > 0 and taken > 0:
                            if applied == taken:
                                data['vacancy'] = taken
                            else:
                                data['vacancy'] = taken
                        else:
                            data['vacancy'] = 0
                    
                    # Add new format fields for consistency
                    data['vacancies'] = data.get('vacancy', 0)
                    data['applicants'] = data.get('applied', 0)
                    data['balloting'] = data.get('applied', 0) > data.get('vacancy', 0)
                    data['balloting_details'] = {}
                    data['status'] = ''
                    
                    return data
        return {}

    def set_phase_data(self, phase_name, data):
        """Set phase data from dictionary"""
        phase_field = f"{phase_name}_data"
        if hasattr(self, phase_field):
            setattr(self, phase_field, json.dumps(data))

    def get_competitiveness_metrics(self):
        """Get competitiveness metrics as dictionary"""
        if self.competitiveness_metrics:
            return json.loads(self.competitiveness_metrics)
        return {}

    def set_competitiveness_metrics(self, metrics):
        """Set competitiveness metrics from dictionary"""
        self.competitiveness_metrics = json.dumps(metrics)

    def to_dict(self):
        """Convert school to dictionary format matching the original JSON structure"""
        phases = {}
        phase_names = ['phase_1', 'phase_2a', 'phase_2b', 'phase_2c', 'phase_2c_supp', 'phase_3']
        
        for phase in phase_names:
            phases[phase] = self.get_phase_data(phase)

        return {
            'name': self.name,
            'total_vacancy': self.total_vacancy,
            'phases': phases,
            'balloted': self.balloted,
            'year': self.year,
            'competitiveness_metrics': self.get_competitiveness_metrics(),
            'overall_competitiveness_score': self.overall_competitiveness_score,
            'competitiveness_tier': self.competitiveness_tier,
            # Government data
            'address': self.address,
            'postal_code': self.postal_code,
            'phone': self.phone,
            'email': self.email,
            'website': self.website,
            'mrt_desc': self.mrt_desc,
            'bus_desc': self.bus_desc,
            'latitude': self.latitude,
            'longitude': self.longitude
        }

    def to_p1_data_format(self):
        """Convert to comprehensive P1 data format expected by frontend"""
        phases_data = {
            'phase_1': self.get_phase_data('phase_1'),
            'phase_2a': self.get_phase_data('phase_2a'),
            'phase_2b': self.get_phase_data('phase_2b'),
            'phase_2c': self.get_phase_data('phase_2c'),
            'phase_2c_supp': self.get_phase_data('phase_2c_supp'),
            'phase_3': self.get_phase_data('phase_3'),
        }
        
        # Calculate summary statistics
        total_applicants = sum(phase.get('applicants', 0) for phase in phases_data.values())
        balloting_phases = [name for name, phase in phases_data.items() if phase.get('balloting', False)]
        
        competitiveness_metrics = self.get_competitiveness_metrics()
        
        return {
            'total_vacancies': self.total_vacancy,  # Use new field name
            'total_applicants': total_applicants,
            'phases': phases_data,
            'balloted': self.balloted,
            'balloting_phases': balloting_phases,
            'year': self.year,
            'competitiveness_metrics': competitiveness_metrics,
            'overall_competitiveness_score': self.overall_competitiveness_score,
            'competitiveness_tier': self.competitiveness_tier,
            'competitiveness_summary': {
                'score': self.overall_competitiveness_score,
                'tier': self.competitiveness_tier,
                'balloting_phases_count': len(balloting_phases),
                'most_competitive_phase': self._get_most_competitive_phase(phases_data)
            }
        }
    
    def _get_most_competitive_phase(self, phases_data):
        """Determine the most competitive phase based on applicant to vacancy ratio"""
        max_ratio = 0
        most_competitive = None
        
        for phase_name, phase_data in phases_data.items():
            vacancies = phase_data.get('vacancies', 0)
            applicants = phase_data.get('applicants', 0)
            
            if vacancies > 0:
                ratio = applicants / vacancies
                if ratio > max_ratio:
                    max_ratio = ratio
                    most_competitive = phase_name
        
        return most_competitive

    def get_most_competitive_phase(self):
        """Get the most competitive phase for this school"""
        try:
            phases_data = json.loads(self.phases_data) if isinstance(self.phases_data, str) else self.phases_data
            return self._get_most_competitive_phase(phases_data)
        except:
            return "Unknown"

    def calculate_overall_success_rate(self):
        """Calculate overall success rate across all phases"""
        try:
            phases_data = json.loads(self.phases_data) if isinstance(self.phases_data, str) else self.phases_data
            
            total_applicants = 0
            total_taken = 0
            
            for phase_name, phase_data in phases_data.items():
                applicants = phase_data.get('applicants', 0)
                taken = phase_data.get('taken', 0)
                
                total_applicants += applicants
                total_taken += taken
            
            if total_applicants > 0:
                return (total_taken / total_applicants) * 100
            return 0
        except:
            return 0

    def get_strategy_recommendation(self):
        """Generate strategic recommendation based on school data"""
        try:
            competitiveness = self.competitiveness_tier.lower() if self.competitiveness_tier else 'unknown'
            success_rate = self.calculate_overall_success_rate()
            balloted = self.balloted
            
            if competitiveness == 'very high':
                return "Highly competitive school. Consider applying in earlier phases if eligible, or have backup options ready."
            elif competitiveness == 'high':
                return "Competitive school. Early phase application recommended if possible. Prepare for potential balloting."
            elif competitiveness == 'medium':
                if balloted:
                    return "Moderately competitive with some balloting. Good chances in later phases if earlier phases don't work out."
                else:
                    return "Balanced competitiveness. Multiple phases available for application."
            elif competitiveness == 'low':
                return "Lower competition levels. Good chances across multiple phases."
            elif competitiveness == 'very low':
                return "Excellent availability. Multiple opportunities to secure placement."
            else:
                return "Contact school directly for most current information about availability and requirements."
        except:
            return "Strategic analysis not available for this school."
