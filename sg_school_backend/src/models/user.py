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
        """Get phase data as dictionary"""
        phase_field = f"{phase_name}_data"
        if hasattr(self, phase_field):
            phase_json = getattr(self, phase_field)
            if phase_json:
                data = json.loads(phase_json)
                # Convert "accepted" to "taken" for frontend compatibility
                if 'accepted' in data:
                    data['taken'] = data.pop('accepted')
                
                # Add vacancy field if missing (our migrated data doesn't have per-phase vacancy)
                if 'vacancy' not in data:
                    # For Singapore P1, vacancy per phase isn't fixed, but we can estimate
                    # based on typical distributions for display purposes
                    applied = data.get('applied', 0)
                    taken = data.get('taken', 0)
                    
                    if applied > 0 and taken > 0:
                        # If all applicants were taken, vacancy was at least equal to taken
                        if applied == taken:
                            data['vacancy'] = taken
                        else:
                            # If not all were taken, vacancy was likely equal to taken (filled)
                            data['vacancy'] = taken
                    else:
                        data['vacancy'] = 0
                
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
        """Convert to P1 data format expected by frontend"""
        return {
            'total_vacancy': self.total_vacancy,
            'phases': {
                'phase_1': self.get_phase_data('phase_1'),
                'phase_2a': self.get_phase_data('phase_2a'),
                'phase_2b': self.get_phase_data('phase_2b'),
                'phase_2c': self.get_phase_data('phase_2c'),
                'phase_2c_supp': self.get_phase_data('phase_2c_supp'),
                'phase_3': self.get_phase_data('phase_3'),
            },
            'balloted': self.balloted,
            'year': self.year,
            'competitiveness_metrics': self.get_competitiveness_metrics(),
            'overall_competitiveness_score': self.overall_competitiveness_score,
            'competitiveness_tier': self.competitiveness_tier
        }
