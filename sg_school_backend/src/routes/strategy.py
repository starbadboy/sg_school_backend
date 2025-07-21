from flask import Blueprint, request, jsonify
import requests
import json
import os

strategy_bp = Blueprint('strategy', __name__)

# DeepSeek API configuration
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

def call_deepseek_api(messages):
    """Call DeepSeek API for strategy generation"""
    try:
        # Load API key dynamically to ensure it's available after .env loading
        api_key = os.getenv('DEEPSEEK_API_KEY')
        
        if not api_key or api_key == 'your-deepseek-api-key-here':
            return None
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'deepseek-chat',
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 2500  # Increased for more detailed responses
        }
        
        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content']
        else:
            return None
    except Exception as e:
        return None

def generate_strategy_prompt(user_data, schools_data):
    """Generate a comprehensive prompt for DeepSeek API"""
    prompt = f"""
You are a senior education consultant specializing in Singapore Primary 1 (P1) school registration with 15+ years of experience helping families navigate the complex MOE registration system. Provide an in-depth, actionable strategy with specific references and detailed analysis.

CONTEXT & USER PROFILE:
- Current Address: {user_data.get('address', 'Not provided')}
- Target Schools: {', '.join(user_data.get('target_schools', []))}
- Family Situation:
  - Has siblings in target schools: {user_data.get('has_siblings', False)}
  - Parent is alumni of target schools: {user_data.get('is_alumni', False)}
  - Willing to volunteer: {user_data.get('willing_to_volunteer', False)}
  - Can relocate: {user_data.get('can_relocate', False)}
- Priority factors: {', '.join(user_data.get('priorities', []))}
- Application Year: {user_data.get('application_year', '2025')}

DETAILED SCHOOL ANALYSIS:
Based on 2024 P1 registration data and historical trends:"""
    
    for school in schools_data:
        p1_data = school.get('p1_data', {})
        
        # Check if real P1 data is available
        if p1_data.get('data_available', True):  # Default to True for backward compatibility
            phase_2c = p1_data.get('phases', {}).get('phase_2c', {})
            applied = phase_2c.get('applied', 0) or phase_2c.get('applicants', 0)
            taken = phase_2c.get('taken', 0)
            success_rate = round((taken / applied * 100), 1) if applied > 0 else 0
            
            prompt += f"""

### {school['name']}
**Location & Accessibility:**
- Distance from your address: {school.get('distance', 'Unknown')} km
- Address: {school.get('address', 'Unknown')}
- Contact: {school.get('phone', 'Check school website')} | Website: {school.get('website', 'Search on MOE SchoolFinder')}

**P1 2024 Registration Analysis:**
- Total P1 Vacancy: {p1_data.get('total_vacancy', 'Unknown')}
- Balloting Status: {'✓ BALLOTED' if p1_data.get('balloted') else '✓ NON-BALLOTED'}
- Competitiveness Level: {p1_data.get('competitiveness_tier', 'Unknown')}
- Phase 2C Statistics: {applied} applied → {taken} accepted (Success Rate: {success_rate}%)
- Distance Priority: {'Phase 2C Priority 1 (within 1km)' if school.get('distance', 999) <= 1 else 'Phase 2C Priority 2 (1-2km)' if school.get('distance', 999) <= 2 else 'Phase 2C Priority 3+ (beyond 2km)'}

**Strategic Assessment:**
{'HIGH RISK - Balloted school with very competitive entry. Requires strategic planning.' if p1_data.get('balloted') else 'MODERATE RISK - Non-balloted school but still competitive.'}
"""
        else:
            # No real P1 data available
            prompt += f"""

### {school['name']}
**Location & Accessibility:**
- Distance from your address: {school.get('distance', 'Unknown')} km
- Address: {school.get('address', 'Unknown')}

**P1 Data Status:**
❌ **No 2024 data available** - {p1_data.get('message', 'P1 data not available for this school')}
**Recommendation:** Research manually on MOE SchoolFinder or contact school directly for historical data.
"""
    
    prompt += """

## REQUIRED COMPREHENSIVE ANALYSIS

Provide an in-depth, actionable strategy addressing ALL of the following areas with specific details and reference links:

### 1. EXECUTIVE SUMMARY & RISK ASSESSMENT
- Overall competitiveness ranking of target schools (with specific percentages and statistics)
- Success probability for each school based on user's profile
- Primary recommended school with detailed justification
- Key risk factors and mitigation strategies

### 2. DETAILED PHASE-BY-PHASE STRATEGY
For each registration phase, provide:

**Phase 1 (Siblings):**
- Eligibility analysis based on user's sibling status
- Required documentation checklist
- Reference: https://www.moe.gov.sg/primary/p1-registration/how-to-register

**Phase 2A (Alumni/Staff/School Advisory/Management Committee):**
- Specific opportunities for each target school
- Alumni verification process and required documents
- School committee membership pathways with contact information
- Timeline for joining committees (minimum service periods)

**Phase 2B (Parent Volunteer/Grassroots/Church/Clan):**
- Specific volunteer opportunities at each target school
- Required 40-hour volunteer commitment details
- Contact persons and departments for volunteering
- Grassroots organization opportunities in relevant constituencies
- Religious organization pathways if applicable

**Phase 2C (Distance-based):**
- Detailed distance priority analysis
- Specific address recommendations for relocation (if applicable)
- Balloting mechanics and tie-breaking procedures

### 3. PRECISE TIMELINE WITH SPECIFIC DATES
Provide exact dates for 2025 registration:
- **March 2025:** Phase 1 registration dates
- **April 2025:** Phase 2A registration dates  
- **May 2025:** Phase 2B registration dates
- **June 2025:** Phase 2C registration dates
- **Pre-registration actions:** Volunteer sign-up deadlines, committee membership applications
- **Post-registration:** Appeal processes and deadlines

### 4. RELOCATION STRATEGY (If Beneficial)
- Specific postal codes and neighborhoods within 1km/2km of target schools
- Property market analysis and rental vs. purchase recommendations
- Timing for address changes (minimum residency requirements)
- Required documentation for address verification

### 5. BACKUP SCHOOL ANALYSIS
- 3-5 alternative schools with similar profiles
- Less competitive options within acceptable distance
- Last-resort schools with typically available places
- Contact information and registration procedures

### 6. DETAILED VOLUNTEER OPPORTUNITIES
For each target school, provide:
- Specific volunteer positions available
- Contact person names and email addresses (if available)
- Required commitment hours and schedules
- Application deadlines and procedures

### 7. FINANCIAL CONSIDERATIONS
- School fees and additional costs for each school
- Financial assistance schemes available
- Enrichment programs and their costs

### 8. REFERENCE LINKS & RESOURCES
Include specific URLs for:
- MOE P1 Registration Portal: https://www.p1.moe.edu.sg/
- MOE School Information Service: https://www.moe.gov.sg/schoolfinder
- Each target school's official website
- Relevant grassroots organizations
- P1 Registration Guide: https://www.moe.gov.sg/primary/p1-registration

### 9. RISK MITIGATION & CONTINGENCY PLANS
- What to do if Phase 2B volunteering is rejected
- Appeal process if rejected from preferred schools
- Late registration procedures
- Transfer possibilities after admission

### 10. ACTION CHECKLIST
Provide a prioritized action list with specific deadlines for immediate implementation.

**CRITICAL REQUIREMENTS:**
- Be extremely specific with names, contact information, and procedures
- Include actual reference links where they exist
- Provide quantitative analysis (percentages, success rates, distances)
- Give actionable steps with clear deadlines
- Address the user's specific family situation and priorities
- Include phone numbers and email addresses where available
- Reference specific MOE policies and procedures
- Mention relevant parliamentary constituency information for grassroots volunteering

**FORMATTING:**
- Use markdown headers (## and ###)
- Bold important deadlines and contact information
- Use bullet points for lists
- Keep content scannable but comprehensive
- Include clickable reference links
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
            "content": "You are a senior education consultant specializing in Singapore Primary 1 (P1) school registration with 15+ years of experience. You have extensive knowledge of MOE policies, school-specific procedures, volunteer opportunities, grassroots organizations, and successful admission strategies. You provide detailed, actionable advice with specific references, contact information, and quantitative analysis. Your expertise includes understanding balloting mechanics, distance priorities, relocation strategies, and risk mitigation plans. Always provide specific reference links, contact details, and concrete action steps with deadlines."
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
    target_schools = ', '.join(user_data.get('target_schools', []))
    
    strategy = f"""
# Comprehensive P1 Registration Strategy for {user_data.get('application_year', '2025')}

## Executive Summary
**Target Schools:** {target_schools}
**Current Address:** {user_data.get('address', 'Not provided')}
**Strategy Priority:** Multi-phase approach with Phase 2B volunteering as primary focus

⚠️ **Note:** This is a basic strategy. For detailed AI-generated analysis with specific contact information and personalized recommendations, please ensure your internet connection is stable and try again.

## Phase-by-Phase Strategy

### Phase 1 (Siblings Priority)
**Eligibility:** {'✓ Eligible' if user_data.get('has_siblings') else '❌ Not Eligible - No siblings in target schools'}
- **Action Required:** {'Submit application with sibling documentation' if user_data.get('has_siblings') else 'Skip to Phase 2A preparation'}
- **Success Rate:** {'~99% if eligible' if user_data.get('has_siblings') else 'N/A'}

### Phase 2A (Alumni/Staff/Committee)
**Current Status:** {'✓ Alumni Connection' if user_data.get('is_alumni') else '❌ No Alumni Status'}
- **Immediate Actions:**
  - Contact target school general offices to inquire about School Advisory Committee positions
  - Research parent volunteer coordinator roles available
  - **Reference:** [MOE P1 Registration Guide](https://www.moe.gov.sg/primary/p1-registration)

### Phase 2B (Community Volunteer)
**User Commitment:** {'✓ Willing to Volunteer' if user_data.get('willing_to_volunteer') else '⚠️ Volunteer Participation Uncertain'}
- **Critical Requirements:**
  - **40 hours minimum volunteer service** by June 30, 2024 (for 2025 registration)
  - Must be registered volunteer BEFORE volunteer work begins
  - Documentation required: Certificate of volunteer hours
- **Volunteer Opportunities:**
  - School-based: Library assistance, event support, administrative help
  - Community: Grassroots organizations in school's constituency
  - **Contact:** Email target schools directly for volunteer coordinator contact

### Phase 2C (Distance-Based)
**Current Distance Analysis:**"""
    
    for school in schools_data:
        distance = school.get('distance', 'Unknown')
        strategy += f"""
- **{school['name']}:** {distance}km ({'Priority 1 (within 1km)' if str(distance).replace('km', '').isdigit() and float(distance) <= 1 else 'Priority 2 (1-2km)' if str(distance).replace('km', '').isdigit() and float(distance) <= 2 else 'Priority 3+ (beyond 2km)'})"""
    
    strategy += f"""

## Critical Timeline for 2025 Registration
- **Now - March 2024:** Begin volunteer applications and committee inquiries
- **April - June 2024:** Complete 40-hour volunteer requirement
- **June 30, 2024:** Final deadline for volunteer hour completion
- **March 2025:** Phase 1 Registration
- **April 2025:** Phase 2A Registration  
- **May 2025:** Phase 2B Registration
- **June 2025:** Phase 2C Registration

## Relocation Strategy
{'**Recommended:** Consider relocation for distance priority' if user_data.get('can_relocate') else '**Not Applicable:** User indicated unwillingness to relocate'}

## Essential Reference Links
- **MOE P1 Registration Portal:** https://www.p1.moe.edu.sg/
- **School Information Service:** https://www.moe.gov.sg/schoolfinder  
- **Registration Process Guide:** https://www.moe.gov.sg/primary/p1-registration/how-to-register
- **Volunteer Requirements:** Contact individual school general offices
- **Appeal Process:** https://www.moe.gov.sg/primary/p1-registration/results

## Immediate Action Items
1. **Contact target schools** for volunteer coordinator information
2. **Research grassroots organizations** in relevant constituencies  
3. **Verify residential address** for distance calculations
4. **Prepare required documents** (birth certificate, passport, etc.)
5. **Set up MOE digital account** at https://www.p1.moe.edu.sg/

## Risk Mitigation
- **Backup Schools:** Research 3-5 less competitive schools within acceptable distance
- **Multiple Volunteer Paths:** Apply for both school-based and community volunteering
- **Documentation:** Keep detailed records of all volunteer hours and activities
- **Appeal Preparation:** Understand appeal process timeline and requirements

---
*For more detailed, personalized strategy with specific contact information and success probability analysis, please try generating the AI strategy again when your connection is stable.*
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

