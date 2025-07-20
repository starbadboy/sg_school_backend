from flask import Blueprint, request, jsonify
import requests
import json
import os

strategy_bp = Blueprint('strategy', __name__)

# DeepSeek API configuration
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY', 'your-deepseek-api-key-here')

def call_deepseek_api(messages):
    """Call DeepSeek API for strategy generation"""
    try:
        headers = {
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'deepseek-chat',
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 2000
        }
        
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            return response.json()['choices'][0]['message']['content']
        else:
            print(f"DeepSeek API error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error calling DeepSeek API: {e}")
        return None

def generate_strategy_prompt(user_data, schools_data):
    """Generate a comprehensive prompt for DeepSeek API"""
    prompt = f"""
You are an expert consultant for Singapore Primary 1 (P1) school registration. Based on the following information, provide a detailed and actionable strategy for maximizing the chances of getting into the desired primary schools.

User Information:
- Current Address: {user_data.get('address', 'Not provided')}
- Target Schools: {', '.join(user_data.get('target_schools', []))}
- Family Situation:
  - Has siblings in target schools: {user_data.get('has_siblings', False)}
  - Parent is alumni of target schools: {user_data.get('is_alumni', False)}
  - Willing to volunteer: {user_data.get('willing_to_volunteer', False)}
  - Can relocate: {user_data.get('can_relocate', False)}
- Priority factors: {', '.join(user_data.get('priorities', []))}
- Timeline: Planning to apply in {user_data.get('application_year', '2025')}

School Data Analysis:
"""
    
    for school in schools_data:
        p1_data = school.get('p1_data', {})
        
        # Check if real P1 data is available
        if p1_data.get('data_available', True):  # Default to True for backward compatibility
            prompt += f"""
{school['name']}:
- Distance from user: {school.get('distance', 'Unknown')} km
- P1 Data (2024):
  - Total Vacancy: {p1_data.get('total_vacancy', 'Unknown')}
  - Balloted: {p1_data.get('balloted', 'Unknown')}
  - Phase 2C Applied/Taken: {p1_data.get('phases', {}).get('phase_2c', {}).get('applied', 'Unknown')}/{p1_data.get('phases', {}).get('phase_2c', {}).get('taken', 'Unknown')}
  - Competitiveness: {p1_data.get('competitiveness_tier', 'Unknown')}
"""
        else:
            # No real P1 data available
            prompt += f"""
{school['name']}:
- Distance from user: {school.get('distance', 'Unknown')} km
- P1 Data (2024): ❌ No data available in our database
- Note: {p1_data.get('message', 'P1 data not available for this school')}
- Strategy: Consider as backup option or research manually
"""
    
    prompt += """
Please provide:
1. Overall Assessment: Analyze the competitiveness of each target school
2. Recommended Strategy: Specific phase-by-phase approach for each school
3. Timeline: Key dates and actions to take before and during registration
4. Backup Options: Alternative schools to consider
5. Relocation Advice: If beneficial, suggest optimal areas to move to
6. Volunteer Opportunities: How to maximize Phase 2B eligibility
7. Risk Mitigation: What to do if primary choices don't work out

Format your response in clear sections with actionable bullet points. Be specific about Singapore's P1 registration phases and requirements.
"""
    
    return prompt

@strategy_bp.route('/generate', methods=['POST'])
def generate_strategy():
    """Generate P1 admission strategy using DeepSeek API"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['address', 'target_schools']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    user_data = {
        'address': data.get('address'),
        'target_schools': data.get('target_schools', []),
        'has_siblings': data.get('has_siblings', False),
        'is_alumni': data.get('is_alumni', False),
        'willing_to_volunteer': data.get('willing_to_volunteer', False),
        'can_relocate': data.get('can_relocate', False),
        'priorities': data.get('priorities', []),
        'application_year': data.get('application_year', '2025')
    }
    
    schools_data = data.get('schools_data', [])
    
    # Generate strategy prompt
    strategy_prompt = generate_strategy_prompt(user_data, schools_data)
    
    # Call DeepSeek API
    messages = [
        {
            "role": "system",
            "content": "You are an expert consultant for Singapore Primary 1 school registration with deep knowledge of the MOE registration process, phases, and strategies for success."
        },
        {
            "role": "user",
            "content": strategy_prompt
        }
    ]
    
    strategy_response = call_deepseek_api(messages)
    
    if not strategy_response:
        # Fallback strategy if API fails
        strategy_response = generate_fallback_strategy(user_data, schools_data)
    
    return jsonify({
        'strategy': strategy_response,
        'user_data': user_data,
        'generated_at': '2025-07-19T13:45:00Z'
    })

def generate_fallback_strategy(user_data, schools_data):
    """Generate a basic fallback strategy if DeepSeek API is unavailable"""
    strategy = f"""
# P1 Registration Strategy for {user_data.get('application_year', '2025')}

## Overall Assessment
Based on your target schools: {', '.join(user_data.get('target_schools', []))}, here's a preliminary strategy:

## Recommended Approach

### Phase 1 (Siblings)
- Only applicable if you have children already in the target schools
- Guaranteed placement if eligible

### Phase 2A (Alumni/School Committee)
- Check if you're eligible as an alumni of target schools
- Consider joining School Advisory Committee if possible

### Phase 2B (Volunteer/Community)
- Start volunteering at target schools immediately
- Minimum 40 hours of volunteer service required
- Apply early as volunteer positions are limited

### Phase 2C (General Registration)
- This is the most competitive phase
- Distance from school is crucial (1km vs 2km priority)
- Consider relocation if within budget and timeline

## Timeline
- 6-12 months before registration: Start volunteering
- 3-6 months before: Finalize address (if relocating)
- Registration period: Apply strategically by phase

## Backup Options
- Consider less popular schools in your area
- Look into schools with higher vacancy rates
- Have multiple options ready for each phase

Note: This is a basic strategy. For detailed analysis, please ensure DeepSeek API is properly configured.
"""
    return strategy

@strategy_bp.route('/analyze-competitiveness', methods=['POST'])
def analyze_competitiveness():
    """Analyze the competitiveness of schools based on P1 data"""
    data = request.get_json()
    schools_data = data.get('schools_data', [])
    
    analysis = []
    for school in schools_data:
        p1_data = school.get('p1_data', {})
        
        # Check if real P1 data is available
        if p1_data.get('data_available', True):  # Default to True for backward compatibility
            phases = p1_data.get('phases', {})
            
            # Calculate competitiveness score
            phase_2c = phases.get('phase_2c', {})
            applied = phase_2c.get('applied', 0)
            taken = phase_2c.get('taken', 0)
            
            if taken > 0:
                competition_ratio = applied / taken
            else:
                competition_ratio = 1
            
            # Determine competitiveness level
            if competition_ratio > 2:
                level = 'Very High'
            elif competition_ratio > 1.5:
                level = 'High'
            elif competition_ratio > 1.2:
                level = 'Medium'
            else:
                level = 'Low'
            
            analysis.append({
                'school_name': school['name'],
                'distance': school.get('distance', 0),
                'competition_ratio': round(competition_ratio, 2),
                'competitiveness_level': level,
                'balloted': p1_data.get('balloted', False),
                'total_vacancy': p1_data.get('total_vacancy', 0),
                'data_available': True,
                'recommendation': get_school_recommendation(level, school.get('distance', 0))
            })
        else:
            # No P1 data available for this school
            analysis.append({
                'school_name': school['name'],
                'distance': school.get('distance', 0),
                'competition_ratio': 0,
                'competitiveness_level': 'Unknown',
                'balloted': False,
                'total_vacancy': 0,
                'data_available': False,
                'message': p1_data.get('message', 'No P1 data available'),
                'recommendation': 'No data available - research manually or consider as backup option'
            })
    
    # Sort by competitiveness and distance
    analysis.sort(key=lambda x: (x['competition_ratio'], x['distance']))
    
    return jsonify({
        'analysis': analysis,
        'summary': generate_analysis_summary(analysis)
    })

def get_school_recommendation(competitiveness_level, distance):
    """Get recommendation based on competitiveness and distance"""
    if distance <= 1:
        if competitiveness_level in ['Low', 'Medium']:
            return 'Excellent choice - high chance of success'
        else:
            return 'Good option - within 1km gives priority'
    elif distance <= 2:
        if competitiveness_level == 'Low':
            return 'Good choice - reasonable chance of success'
        elif competitiveness_level == 'Medium':
            return 'Consider as backup option'
        else:
            return 'High risk - consider alternatives'
    else:
        return 'Not recommended - too far and competitive'

def generate_analysis_summary(analysis):
    """Generate a summary of the competitiveness analysis"""
    total_schools = len(analysis)
    high_competition = len([s for s in analysis if s['competitiveness_level'] in ['High', 'Very High']])
    within_1km = len([s for s in analysis if s['distance'] <= 1])
    
    return {
        'total_schools_analyzed': total_schools,
        'highly_competitive_schools': high_competition,
        'schools_within_1km': within_1km,
        'recommendation': 'Focus on schools within 1km with medium or low competition levels for best chances.'
    }

