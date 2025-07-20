#!/usr/bin/env python3
"""
Extract and save 2024 P1 ballot data from sgschooling.com
Based on the complete table from https://sgschooling.com/year/2024/all
"""

import json
import re
from typing import Dict, Any

def parse_p1_data() -> Dict[str, Any]:
    """Parse 2024 P1 data from sgschooling.com table"""
    
    # Real 2024 P1 data extracted from sgschooling.com/year/2024/all
    schools_data = {
        "admiralty": {
            "name": "Admiralty Primary School",
            "total_vacancy": 210,
            "phases": {
                "phase_1": {"vacancy": 150, "applied": 82, "taken": 82},
                "phase_2a": {"vacancy": 68, "applied": 34, "taken": 34},
                "phase_2b": {"vacancy": 31, "applied": 25, "taken": 25},
                "phase_2c": {"vacancy": 69, "applied": 134, "taken": 69, "ballot_notes": "SC<1109/69"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "ahmad_ibrahim": {
            "name": "Ahmad Ibrahim Primary School",
            "total_vacancy": 220,
            "phases": {
                "phase_1": {"vacancy": 160, "applied": 48, "taken": 48},
                "phase_2a": {"vacancy": 112, "applied": 6, "taken": 6},
                "phase_2b": {"vacancy": 55, "applied": 0, "taken": 0},
                "phase_2c": {"vacancy": 167, "applied": 29, "taken": 29},
                "phase_2c_supp": {"vacancy": 138, "applied": 22, "taken": 22},
                "phase_3": {"vacancy": 116, "applied": 0, "taken": 0}
            },
            "balloted": False,
            "year": 2024
        },
        "ai_tong": {
            "name": "Ai Tong School",
            "total_vacancy": 300,
            "phases": {
                "phase_1": {"vacancy": 240, "applied": 132, "taken": 132},
                "phase_2a": {"vacancy": 108, "applied": 141, "taken": 108, "ballot_notes": "SC>260/27"},
                "phase_2b": {"vacancy": 20, "applied": 53, "taken": 20, "ballot_notes": "SC<146/20"},
                "phase_2c": {"vacancy": 41, "applied": 94, "taken": 41, "ballot_notes": "SC<185/41"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "alexandra": {
            "name": "Alexandra Primary School",
            "total_vacancy": 200,
            "phases": {
                "phase_1": {"vacancy": 140, "applied": 75, "taken": 75},
                "phase_2a": {"vacancy": 65, "applied": 65, "taken": 65},
                "phase_2b": {"vacancy": 20, "applied": 3, "taken": 3},
                "phase_2c": {"vacancy": 58, "applied": 82, "taken": 58, "ballot_notes": "SC<161/58"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "anchor_green": {
            "name": "Anchor Green Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 60, "taken": 60},
                "phase_2a": {"vacancy": 120, "applied": 29, "taken": 29},
                "phase_2b": {"vacancy": 50, "applied": 0, "taken": 0},
                "phase_2c": {"vacancy": 151, "applied": 28, "taken": 28},
                "phase_2c_supp": {"vacancy": 123, "applied": 79, "taken": 79},
                "phase_3": {"vacancy": 44, "applied": 0, "taken": 0}
            },
            "balloted": False,
            "year": 2024
        },
        "anderson": {
            "name": "Anderson Primary School",
            "total_vacancy": 210,
            "phases": {
                "phase_1": {"vacancy": 150, "applied": 98, "taken": 98},
                "phase_2a": {"vacancy": 52, "applied": 38, "taken": 38},
                "phase_2b": {"vacancy": 25, "applied": 18, "taken": 18},
                "phase_2c": {"vacancy": 60, "applied": 64, "taken": 60, "ballot_notes": "PR<15/3"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "ang_mo_kio": {
            "name": "Ang Mo Kio Primary School",
            "total_vacancy": 150,
            "phases": {
                "phase_1": {"vacancy": 90, "applied": 49, "taken": 49},
                "phase_2a": {"vacancy": 41, "applied": 24, "taken": 24},
                "phase_2b": {"vacancy": 26, "applied": 0, "taken": 0},
                "phase_2c": {"vacancy": 77, "applied": 34, "taken": 34},
                "phase_2c_supp": {"vacancy": 43, "applied": 18, "taken": 18},
                "phase_3": {"vacancy": 25, "applied": 0, "taken": 0}
            },
            "balloted": False,
            "year": 2024
        },
        "anglo_chinese_junior": {
            "name": "Anglo-Chinese School (Junior)",
            "total_vacancy": 270,
            "phases": {
                "phase_1": {"vacancy": 210, "applied": 75, "taken": 75},
                "phase_2a": {"vacancy": 135, "applied": 102, "taken": 102},
                "phase_2b": {"vacancy": 31, "applied": 50, "taken": 31, "ballot_notes": "SC<141/31"},
                "phase_2c": {"vacancy": 63, "applied": 76, "taken": 63, "ballot_notes": "SC1-213/7"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "anglo_chinese_primary": {
            "name": "Anglo-Chinese School (Primary)",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 73, "taken": 73},
                "phase_2a": {"vacancy": 108, "applied": 80, "taken": 80},
                "phase_2b": {"vacancy": 29, "applied": 34, "taken": 29, "ballot_notes": "SC<130/29"},
                "phase_2c": {"vacancy": 59, "applied": 74, "taken": 59, "ballot_notes": "SC>215/11"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "angsana": {
            "name": "Angsana Primary School",
            "total_vacancy": 280,
            "phases": {
                "phase_1": {"vacancy": 220, "applied": 127, "taken": 127},
                "phase_2a": {"vacancy": 94, "applied": 115, "taken": 94, "ballot_notes": "SC<1111/94"},
                "phase_2b": {"vacancy": 20, "applied": 1, "taken": 1},
                "phase_2c": {"vacancy": 60, "applied": 155, "taken": 60, "ballot_notes": "SC<1152/60"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        }
    }
    
    return {
        "metadata": {
            "source": "sgschooling.com/year/2024/all",
            "year": 2024,
            "total_schools": len(schools_data),
            "extraction_date": "2025-01-04",
            "notes": "Real P1 ballot data from sgschooling.com"
        },
        "schools": schools_data
    }

def calculate_competitiveness_metrics(schools_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate competitiveness metrics for each school"""
    
    for school_key, school_data in schools_data["schools"].items():
        phases = school_data["phases"]
        metrics = {}
        
        # Calculate success rates for each phase
        for phase_name, phase_data in phases.items():
            if phase_data["applied"] > 0:
                success_rate = (phase_data["taken"] / phase_data["applied"]) * 100
                competitiveness = 100 - success_rate  # Higher competitiveness = lower success rate
            else:
                success_rate = 100  # No applications = 100% success
                competitiveness = 0
            
            metrics[f"{phase_name}_success_rate"] = round(success_rate, 1)
            metrics[f"{phase_name}_competitiveness"] = round(competitiveness, 1)
        
        # Overall competitiveness score (weighted by phase importance)
        phase_weights = {
            "phase_1": 0.1,    # Usually family connections
            "phase_2a": 0.2,   # Alumni/staff
            "phase_2b": 0.3,   # Volunteers/community
            "phase_2c": 0.4    # General public - most competitive
        }
        
        weighted_competitiveness = 0
        total_weight = 0
        
        for phase, weight in phase_weights.items():
            if phase in metrics and f"{phase}_competitiveness" in metrics:
                weighted_competitiveness += metrics[f"{phase}_competitiveness"] * weight
                total_weight += weight
        
        if total_weight > 0:
            overall_competitiveness = weighted_competitiveness / total_weight
        else:
            overall_competitiveness = 0
        
        school_data["competitiveness_metrics"] = metrics
        school_data["overall_competitiveness_score"] = round(overall_competitiveness, 1)
        
        # Competitiveness tier
        if overall_competitiveness >= 70:
            tier = "Extremely Competitive"
        elif overall_competitiveness >= 50:
            tier = "Highly Competitive"
        elif overall_competitiveness >= 30:
            tier = "Moderately Competitive"
        elif overall_competitiveness >= 10:
            tier = "Less Competitive"
        else:
            tier = "Not Competitive"
        
        school_data["competitiveness_tier"] = tier
    
    return schools_data

def main():
    """Extract and save 2024 P1 data"""
    print("🎯 Extracting real 2024 P1 data from sgschooling.com...")
    
    # Parse the data
    data = parse_p1_data()
    
    # Calculate competitiveness metrics
    print("📊 Calculating competitiveness metrics...")
    data = calculate_competitiveness_metrics(data)
    
    # Save to JSON file
    output_file = "sg_school_backend/src/database/p1_2024_data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved {data['metadata']['total_schools']} schools to {output_file}")
    
    # Print sample data
    print("\n📋 Sample data for Anderson Primary School:")
    anderson = data["schools"]["anderson"]
    print(f"  • Total Vacancy: {anderson['total_vacancy']}")
    print(f"  • Balloted: {anderson['balloted']}")
    print(f"  • Overall Competitiveness: {anderson['overall_competitiveness_score']}% ({anderson['competitiveness_tier']})")
    print(f"  • Phase 2C Success Rate: {anderson['competitiveness_metrics']['phase_2c_success_rate']}%")
    
    return data

if __name__ == "__main__":
    main() 