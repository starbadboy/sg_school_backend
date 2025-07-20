#!/usr/bin/env python3
import json
import time
import sys
from bs4 import BeautifulSoup

def parse_html_to_school_data(html_content):
    """Parse HTML content to extract school data with comprehensive error handling"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    schools = []
    school_cards = soup.find_all('div', class_='moe-vacancies-ballot-card')
    
    print(f"Found {len(school_cards)} school cards in HTML")
    
    for card in school_cards:
        try:
            # Extract school name
            school_name_elem = card.find('h3')
            if not school_name_elem:
                print("Warning: School card found but no h3 element")
                continue
            school_name = school_name_elem.get_text().strip()
            
            # Extract total vacancies
            total_vacancies_elem = card.find('div', class_='moe-vacancies-ballot-card__total-vacancies')
            if not total_vacancies_elem:
                print(f"Warning: No total vacancies found for {school_name}")
                continue
            total_vacancies_text = total_vacancies_elem.find('p').get_text().strip()
            total_vacancies = int(total_vacancies_text)
            
            # Initialize school data structure
            school_data = {
                "name": school_name,
                "total_vacancies": total_vacancies,
                "phases": {}
            }
            
            # Extract phase information
            phase_divs = card.find_all('div', class_='moe-vacancies-ballot-card__phase')
            
            for phase_div in phase_divs:
                phase_header = phase_div.find('h4')
                if not phase_header:
                    continue
                    
                phase_text = phase_header.get_text().strip()
                
                # Determine phase type
                if 'Phase 1' in phase_text:
                    phase_key = 'phase_1'
                elif 'Phase 2A' in phase_text:
                    phase_key = 'phase_2a'
                elif 'Phase 2B' in phase_text:
                    phase_key = 'phase_2b'
                elif 'Phase 2C Supplementary' in phase_text:
                    phase_key = 'phase_2c_supplementary'
                elif 'Phase 2C' in phase_text:
                    phase_key = 'phase_2c'
                else:
                    print(f"Unknown phase: {phase_text}")
                    continue
                
                # Initialize phase data
                phase_data = {}
                
                # Check if it's Phase 1 (special case)
                if phase_key == 'phase_1':
                    status_text = phase_div.find('p')
                    if status_text:
                        phase_data = {
                            "status": status_text.get_text().strip(),
                            "balloting": False
                        }
                else:
                    # Extract vacancies and applicants
                    info_items = phase_div.find_all('div', class_='info-item')
                    vacancies = 0
                    applicants = 0
                    
                    for item in info_items:
                        title_elem = item.find('p', class_='info-title')
                        data_elem = item.find('p', class_='info-data')
                        
                        if title_elem and data_elem:
                            title = title_elem.get_text().strip().lower()
                            data_text = data_elem.get_text().strip()
                            if data_text.isdigit():
                                data = int(data_text)
                                
                                if 'vacancies' in title and 'ballot' not in title:
                                    vacancies = data
                                elif 'applicants' in title and 'ballot' not in title:
                                    applicants = data
                    
                    phase_data = {
                        "vacancies": vacancies,
                        "applicants": applicants,
                        "balloting": False
                    }
                    
                    # Check for balloting information
                    balloting_div = phase_div.find('div', class_='moe-vacancies-ballot-card__balloting')
                    if balloting_div:
                        balloting_spans = balloting_div.find_all('span')
                        for span in balloting_spans:
                            if 'Yes' in span.get_text():
                                phase_data["balloting"] = True
                                
                                # Extract balloting details
                                balloting_ps = balloting_div.find_all('p')
                                conducted_for = ""
                                
                                for p in balloting_ps:
                                    text = p.get_text().strip()
                                    if 'Conducted for:' in text:
                                        conducted_for = text.replace('Conducted for:', '').strip()
                                        break
                                
                                # Extract balloting details from info-block-balloted
                                balloted_info = balloting_div.find('div', class_='info-block-balloted')
                                if balloted_info:
                                    balloted_items = balloted_info.find_all('div', class_='info-item')
                                    vacancies_for_ballot = 0
                                    balloting_applicants = 0
                                    
                                    for item in balloted_items:
                                        title_elem = item.find('p', class_='info-title')
                                        data_elem = item.find('p', class_='info-data')
                                        
                                        if title_elem and data_elem:
                                            title = title_elem.get_text().strip().lower()
                                            data_text = data_elem.get_text().strip()
                                            if data_text.isdigit():
                                                data = int(data_text)
                                                
                                                if 'vacancies for ballot' in title:
                                                    vacancies_for_ballot = data
                                                elif 'balloting applicants' in title:
                                                    balloting_applicants = data
                                    
                                    phase_data["balloting_details"] = {
                                        "conducted_for": conducted_for,
                                        "vacancies_for_ballot": vacancies_for_ballot,
                                        "balloting_applicants": balloting_applicants
                                    }
                                break
                        
                        # Check for special notes
                        for p in balloting_div.find_all('p'):
                            text = p.get_text().strip()
                            if ('No balloting was conducted' in text or 
                                'cap on the intake' in text or
                                'Balloting was conducted because' in text or
                                'Places were offered to all Singapore Citizen children' in text):
                                if "balloting_details" not in phase_data:
                                    phase_data["balloting_details"] = {}
                                phase_data["balloting_details"]["special_note"] = text
                
                school_data["phases"][phase_key] = phase_data
            
            schools.append(school_data)
            print(f"✓ Extracted: {school_name} ({total_vacancies} vacancies)")
            
        except Exception as e:
            print(f"✗ Error parsing school data for {school_name if 'school_name' in locals() else 'unknown school'}: {e}")
            continue
    
    return schools

def append_schools_to_json(new_schools, filename, page_info):
    """Append new schools to existing JSON file with error handling"""
    try:
        # Read existing data
        with open(filename, 'r') as f:
            data = json.load(f)
        
        # Append new schools
        data["schools"].extend(new_schools)
        
        # Update metadata
        data["total_schools_shown"] = len(data["schools"])
        data["page"] = page_info
        
        # Write back to file
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"✓ Successfully appended {len(new_schools)} schools to {filename}")
        print(f"  Total schools now: {len(data['schools'])}")
        return True
        
    except Exception as e:
        print(f"✗ Error updating JSON file: {e}")
        return False

def extract_remaining_pages_automation():
    """Main function to extract data from pages 7-18 using browser automation"""
    
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("✗ Playwright not installed. Please run: pip3 install playwright")
        return False
    
    print("🚀 Starting automated extraction of pages 7-18...")
    print("📊 Current status: 60 schools from pages 1-6 already extracted")
    
    total_extracted = 0
    
    with sync_playwright() as p:
        print("\n🌐 Launching browser automation...")
        try:
            browser = p.chromium.launch(headless=False)
            context = browser.new_context()
            page = context.new_page()
            
            # Navigate to MOE website
            print("📄 Navigating to MOE website...")
            page.goto("https://www.moe.gov.sg/primary/p1-registration/past-vacancies-and-balloting-data", timeout=30000)
            
            # Wait for page to load
            page.wait_for_selector('#moe-vacancies-ballot-app', timeout=30000)
            print("✓ Page loaded successfully")
            
            # Navigate to page 6 first (where we left off)
            print("🔄 Navigating to page 6...")
            for i in range(5):  # Click Next 5 times to get to page 6
                try:
                    page.click('button[aria-label="Next"]', timeout=10000)
                    page.wait_for_timeout(2000)
                    print(f"  → Navigated to page {i+2}")
                except Exception as e:
                    print(f"⚠️  Warning: Failed to navigate to page {i+2}: {e}")
                    break
            
            print("✓ Reached page 6, starting extraction from page 7...")
            
            # Now extract pages 7-18
            for page_num in range(7, 19):
                try:
                    print(f"\n📖 === Processing Page {page_num} of 18 ===")
                    
                    # Click Next to navigate to the next page
                    print(f"  🔄 Navigating to page {page_num}...")
                    page.click('button[aria-label="Next"]', timeout=15000)
                    page.wait_for_timeout(5000)  # Wait longer for page to load
                    
                    # Get the HTML content of the school data section - FIXED: removed timeout parameter
                    print(f"  🔍 Extracting HTML content...")
                    html_content = page.evaluate("""
                        () => {
                            const app = document.querySelector('#moe-vacancies-ballot-app');
                            return app ? app.outerHTML : null;
                        }
                    """)
                    
                    if html_content:
                        print(f"  ✓ HTML content extracted ({len(html_content)} characters)")
                        
                        # Parse the HTML to extract school data
                        print(f"  🔄 Parsing school data...")
                        schools = parse_html_to_school_data(html_content)
                        
                        if schools:
                            print(f"  ✅ Successfully extracted {len(schools)} schools from page {page_num}")
                            
                            # Save page data separately for backup
                            page_data = {
                                "year": 2024,
                                "page": f"{page_num} of 18",
                                "schools": schools
                            }
                            
                            with open(f"page_{page_num}_data.json", 'w') as f:
                                json.dump(page_data, f, indent=2)
                            print(f"  💾 Backup saved to page_{page_num}_data.json")
                            
                            # Append to main JSON file
                            page_info = f"1-{page_num} of 18"
                            if append_schools_to_json(schools, "extracted_p1_school_data.json", page_info):
                                total_extracted += len(schools)
                                print(f"  ✅ Page {page_num} data added to main file")
                            else:
                                print(f"  ✗ Failed to add page {page_num} data to main file")
                        else:
                            print(f"  ⚠️  No schools found on page {page_num}")
                    else:
                        print(f"  ✗ Failed to extract HTML content from page {page_num}")
                    
                    # Progress update
                    print(f"  📊 Progress: {total_extracted} new schools extracted in this session")
                    print(f"  📈 Total progress: {60 + total_extracted}/180 schools ({((60 + total_extracted)/180*100):.1f}%)")
                    
                except Exception as e:
                    print(f"  ✗ Error processing page {page_num}: {e}")
                    print(f"  🔄 Continuing with next page...")
                    continue
            
        except Exception as e:
            print(f"✗ Error during browser automation: {e}")
            return False
        finally:
            print("\n🔄 Closing browser...")
            browser.close()
    
    print(f"\n🎉 === Extraction Complete ===")
    print(f"📊 New schools extracted this session: {total_extracted}")
    print(f"📈 Total schools in database: {60 + total_extracted}/180")
    print(f"💾 All data saved to extracted_p1_school_data.json")
    
    if total_extracted > 0:
        print(f"✅ Successfully automated extraction of pages 7-{6 + (total_extracted // 10)}")
    
    return total_extracted > 0

if __name__ == "__main__":
    success = extract_remaining_pages_automation()
    if success:
        print("\n🎊 Automation completed successfully!")
    else:
        print("\n❌ Automation encountered issues. Check the output above for details.")
    
    sys.exit(0 if success else 1) 