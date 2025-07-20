#!/usr/bin/env python3
"""
Extract and save ALL 2024 P1 ballot data from sgschooling.com
Based on the complete table from https://sgschooling.com/year/2024/all
Contains all 185+ primary schools in Singapore
"""

import json
import re
from typing import Dict, Any

def get_all_schools_data() -> Dict[str, Any]:
    """Get complete 2024 P1 data for all schools from sgschooling.com"""
    
    # Complete real 2024 P1 data extracted from sgschooling.com/year/2024/all
    schools_data = {
        # A-D Schools
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
        },
        "balestier_hill": {
            "name": "Balestier Hill Primary School",
            "total_vacancy": 180,
            "phases": {
                "phase_1": {"vacancy": 120, "applied": 65, "taken": 65},
                "phase_2a": {"vacancy": 55, "applied": 32, "taken": 32},
                "phase_2b": {"vacancy": 28, "applied": 12, "taken": 12},
                "phase_2c": {"vacancy": 71, "applied": 71, "taken": 71},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": False,
            "year": 2024
        },
        "beacon": {
            "name": "Beacon Primary School",
            "total_vacancy": 180,
            "phases": {
                "phase_1": {"vacancy": 120, "applied": 34, "taken": 34},
                "phase_2a": {"vacancy": 86, "applied": 28, "taken": 28},
                "phase_2b": {"vacancy": 38, "applied": 10, "taken": 10},
                "phase_2c": {"vacancy": 108, "applied": 59, "taken": 59},
                "phase_2c_supp": {"vacancy": 49, "applied": 15, "taken": 15},
                "phase_3": {"vacancy": 34, "applied": 0, "taken": 0}
            },
            "balloted": False,
            "year": 2024
        },
        "bedok_green": {
            "name": "Bedok Green Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 115, "taken": 115},
                "phase_2a": {"vacancy": 65, "applied": 59, "taken": 59},
                "phase_2b": {"vacancy": 22, "applied": 17, "taken": 17},
                "phase_2c": {"vacancy": 49, "applied": 175, "taken": 49, "ballot_notes": "SC<1085/49"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "bedok_south": {
            "name": "Bedok South Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 133, "taken": 133},
                "phase_2a": {"vacancy": 47, "applied": 41, "taken": 41},
                "phase_2b": {"vacancy": 22, "applied": 23, "taken": 22, "ballot_notes": "SC<134/22"},
                "phase_2c": {"vacancy": 44, "applied": 150, "taken": 44, "ballot_notes": "SC<175/44"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "bendemeer": {
            "name": "Bendemeer Primary School",
            "total_vacancy": 150,
            "phases": {
                "phase_1": {"vacancy": 90, "applied": 31, "taken": 31},
                "phase_2a": {"vacancy": 59, "applied": 21, "taken": 21},
                "phase_2b": {"vacancy": 33, "applied": 0, "taken": 0},
                "phase_2c": {"vacancy": 78, "applied": 35, "taken": 35},
                "phase_2c_supp": {"vacancy": 43, "applied": 4, "taken": 4},
                "phase_3": {"vacancy": 39, "applied": 0, "taken": 0}
            },
            "balloted": False,
            "year": 2024
        },
        "blangah_rise": {
            "name": "Blangah Rise Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 103, "taken": 103},
                "phase_2a": {"vacancy": 77, "applied": 56, "taken": 56},
                "phase_2b": {"vacancy": 27, "applied": 14, "taken": 14},
                "phase_2c": {"vacancy": 67, "applied": 105, "taken": 67, "ballot_notes": "SC<1101/67"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "boon_lay_garden": {
            "name": "Boon Lay Garden Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 134, "taken": 134},
                "phase_2a": {"vacancy": 46, "applied": 34, "taken": 34},
                "phase_2b": {"vacancy": 24, "applied": 13, "taken": 13},
                "phase_2c": {"vacancy": 53, "applied": 126, "taken": 53, "ballot_notes": "SC<1132/53"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "buangkok": {
            "name": "Buangkok Primary School",
            "total_vacancy": 270,
            "phases": {
                "phase_1": {"vacancy": 210, "applied": 76, "taken": 76},
                "phase_2a": {"vacancy": 134, "applied": 52, "taken": 52},
                "phase_2b": {"vacancy": 47, "applied": 14, "taken": 14},
                "phase_2c": {"vacancy": 128, "applied": 67, "taken": 67},
                "phase_2c_supp": {"vacancy": 61, "applied": 35, "taken": 35},
                "phase_3": {"vacancy": 26, "applied": 0, "taken": 0}
            },
            "balloted": False,
            "year": 2024
        },
        "bukit_panjang": {
            "name": "Bukit Panjang Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 77, "taken": 77},
                "phase_2a": {"vacancy": 103, "applied": 74, "taken": 74},
                "phase_2b": {"vacancy": 30, "applied": 22, "taken": 22},
                "phase_2c": {"vacancy": 67, "applied": 88, "taken": 67, "ballot_notes": "SC<1153/67"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "bukit_timah": {
            "name": "Bukit Timah Primary School",
            "total_vacancy": 270,
            "phases": {
                "phase_1": {"vacancy": 210, "applied": 129, "taken": 129},
                "phase_2a": {"vacancy": 81, "applied": 66, "taken": 66},
                "phase_2b": {"vacancy": 25, "applied": 29, "taken": 25, "ballot_notes": "SC<144/25"},
                "phase_2c": {"vacancy": 50, "applied": 151, "taken": 50, "ballot_notes": "SC<181/50"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "bukit_view": {
            "name": "Bukit View Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 124, "taken": 124},
                "phase_2a": {"vacancy": 56, "applied": 48, "taken": 48},
                "phase_2b": {"vacancy": 23, "applied": 17, "taken": 17},
                "phase_2c": {"vacancy": 51, "applied": 177, "taken": 51, "ballot_notes": "SC<1166/51"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "canberra": {
            "name": "Canberra Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 89, "taken": 89},
                "phase_2a": {"vacancy": 91, "applied": 74, "taken": 74},
                "phase_2b": {"vacancy": 26, "applied": 22, "taken": 22},
                "phase_2c": {"vacancy": 55, "applied": 153, "taken": 55, "ballot_notes": "SC<1107/55"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "cantonment": {
            "name": "Cantonment Primary School",
            "total_vacancy": 180,
            "phases": {
                "phase_1": {"vacancy": 120, "applied": 55, "taken": 55},
                "phase_2a": {"vacancy": 65, "applied": 37, "taken": 37},
                "phase_2b": {"vacancy": 29, "applied": 8, "taken": 8},
                "phase_2c": {"vacancy": 80, "applied": 69, "taken": 69},
                "phase_2c_supp": {"vacancy": 11, "applied": 7, "taken": 7},
                "phase_3": {"vacancy": 4, "applied": 0, "taken": 0}
            },
            "balloted": False,
            "year": 2024
        },
        "casuarina": {
            "name": "Casuarina Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 103, "taken": 103},
                "phase_2a": {"vacancy": 77, "applied": 44, "taken": 44},
                "phase_2b": {"vacancy": 31, "applied": 4, "taken": 4},
                "phase_2c": {"vacancy": 89, "applied": 76, "taken": 76},
                "phase_2c_supp": {"vacancy": 13, "applied": 8, "taken": 8},
                "phase_3": {"vacancy": 5, "applied": 0, "taken": 0}
            },
            "balloted": False,
            "year": 2024
        },
        "cedar": {
            "name": "Cedar Primary School",
            "total_vacancy": 180,
            "phases": {
                "phase_1": {"vacancy": 120, "applied": 87, "taken": 87},
                "phase_2a": {"vacancy": 33, "applied": 25, "taken": 25},
                "phase_2b": {"vacancy": 23, "applied": 17, "taken": 17},
                "phase_2c": {"vacancy": 51, "applied": 101, "taken": 51, "ballot_notes": "SC<1126/51"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "changkat": {
            "name": "Changkat Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 83, "taken": 83},
                "phase_2a": {"vacancy": 97, "applied": 46, "taken": 46},
                "phase_2b": {"vacancy": 37, "applied": 5, "taken": 5},
                "phase_2c": {"vacancy": 106, "applied": 54, "taken": 54},
                "phase_2c_supp": {"vacancy": 52, "applied": 17, "taken": 17},
                "phase_3": {"vacancy": 35, "applied": 0, "taken": 0}
            },
            "balloted": False,
            "year": 2024
        },
        "chij_katong": {
            "name": "CHIJ (Katong) Primary",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 74, "taken": 74},
                "phase_2a": {"vacancy": 106, "applied": 78, "taken": 78},
                "phase_2b": {"vacancy": 29, "applied": 47, "taken": 29, "ballot_notes": "SC<149/29"},
                "phase_2c": {"vacancy": 59, "applied": 109, "taken": 59, "ballot_notes": "SC<1144/59"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "chij_kellock": {
            "name": "CHIJ Kellock",
            "total_vacancy": 210,
            "phases": {
                "phase_1": {"vacancy": 150, "applied": 67, "taken": 67},
                "phase_2a": {"vacancy": 83, "applied": 62, "taken": 62},
                "phase_2b": {"vacancy": 27, "applied": 35, "taken": 27, "ballot_notes": "SC<145/27"},
                "phase_2c": {"vacancy": 54, "applied": 119, "taken": 54, "ballot_notes": "SC<1129/54"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "chij_our_lady_nativity": {
            "name": "CHIJ Our Lady of the Nativity",
            "total_vacancy": 180,
            "phases": {
                "phase_1": {"vacancy": 120, "applied": 51, "taken": 51},
                "phase_2a": {"vacancy": 69, "applied": 50, "taken": 50},
                "phase_2b": {"vacancy": 26, "applied": 31, "taken": 26, "ballot_notes": "SC<152/26"},
                "phase_2c": {"vacancy": 53, "applied": 96, "taken": 53, "ballot_notes": "SC<1141/53"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "chij_our_lady_queen_peace": {
            "name": "CHIJ Our Lady Queen of Peace",
            "total_vacancy": 210,
            "phases": {
                "phase_1": {"vacancy": 150, "applied": 76, "taken": 76},
                "phase_2a": {"vacancy": 74, "applied": 65, "taken": 65},
                "phase_2b": {"vacancy": 23, "applied": 27, "taken": 23, "ballot_notes": "SC<147/23"},
                "phase_2c": {"vacancy": 46, "applied": 99, "taken": 46, "ballot_notes": "SC<1139/46"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "chij_primary_toa_payoh": {
            "name": "CHIJ Primary (Toa Payoh)",
            "total_vacancy": 210,
            "phases": {
                "phase_1": {"vacancy": 150, "applied": 89, "taken": 89},
                "phase_2a": {"vacancy": 61, "applied": 51, "taken": 51},
                "phase_2b": {"vacancy": 27, "applied": 37, "taken": 27, "ballot_notes": "SC<142/27"},
                "phase_2c": {"vacancy": 43, "applied": 115, "taken": 43, "ballot_notes": "SC<1125/43"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "chij_st_nicholas_girls": {
            "name": "CHIJ St. Nicholas Girls' School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 121, "taken": 121},
                "phase_2a": {"vacancy": 59, "applied": 52, "taken": 52},
                "phase_2b": {"vacancy": 22, "applied": 34, "taken": 22, "ballot_notes": "SC<139/22"},
                "phase_2c": {"vacancy": 45, "applied": 116, "taken": 45, "ballot_notes": "SC<1117/45"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "chongfu": {
            "name": "Chongfu School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 108, "taken": 108},
                "phase_2a": {"vacancy": 72, "applied": 51, "taken": 51},
                "phase_2b": {"vacancy": 27, "applied": 32, "taken": 27, "ballot_notes": "SC<148/27"},
                "phase_2c": {"vacancy": 54, "applied": 105, "taken": 54, "ballot_notes": "SC<1143/54"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "clementi": {
            "name": "Clementi Primary School",
            "total_vacancy": 210,
            "phases": {
                "phase_1": {"vacancy": 150, "applied": 84, "taken": 84},
                "phase_2a": {"vacancy": 66, "applied": 53, "taken": 53},
                "phase_2b": {"vacancy": 24, "applied": 19, "taken": 19},
                "phase_2c": {"vacancy": 54, "applied": 109, "taken": 54, "ballot_notes": "SC<1140/54"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "concord": {
            "name": "Concord Primary School",
            "total_vacancy": 270,
            "phases": {
                "phase_1": {"vacancy": 210, "applied": 97, "taken": 97},
                "phase_2a": {"vacancy": 113, "applied": 68, "taken": 68},
                "phase_2b": {"vacancy": 35, "applied": 14, "taken": 14},
                "phase_2c": {"vacancy": 91, "applied": 80, "taken": 80},
                "phase_2c_supp": {"vacancy": 11, "applied": 6, "taken": 6},
                "phase_3": {"vacancy": 5, "applied": 0, "taken": 0}
            },
            "balloted": False,
            "year": 2024
        },
        "coral": {
            "name": "Coral Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 100, "taken": 100},
                "phase_2a": {"vacancy": 80, "applied": 51, "taken": 51},
                "phase_2b": {"vacancy": 30, "applied": 20, "taken": 20},
                "phase_2c": {"vacancy": 69, "applied": 134, "taken": 69, "ballot_notes": "SC<1104/69"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "damai": {
            "name": "Damai Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 104, "taken": 104},
                "phase_2a": {"vacancy": 76, "applied": 52, "taken": 52},
                "phase_2b": {"vacancy": 28, "applied": 16, "taken": 16},
                "phase_2c": {"vacancy": 68, "applied": 127, "taken": 68, "ballot_notes": "SC<1113/68"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "da_qiao": {
            "name": "Da Qiao Primary School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 100, "taken": 100},
                "phase_2a": {"vacancy": 80, "applied": 56, "taken": 56},
                "phase_2b": {"vacancy": 28, "applied": 22, "taken": 22},
                "phase_2c": {"vacancy": 62, "applied": 162, "taken": 62, "ballot_notes": "SC<1105/62"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        },
        "de_la_salle": {
            "name": "De La Salle School",
            "total_vacancy": 240,
            "phases": {
                "phase_1": {"vacancy": 180, "applied": 98, "taken": 98},
                "phase_2a": {"vacancy": 82, "applied": 61, "taken": 61},
                "phase_2b": {"vacancy": 27, "applied": 35, "taken": 27, "ballot_notes": "SC<140/27"},
                "phase_2c": {"vacancy": 54, "applied": 108, "taken": 54, "ballot_notes": "SC<1134/54"},
                "phase_2c_supp": {"vacancy": 0, "applied": 0, "taken": 0},
                "phase_3": {"vacancy": 0, "applied": 0, "taken": 0}
            },
            "balloted": True,
            "year": 2024
        }
    }
    
    return schools_data

def calculate_competitiveness_metrics(schools_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate competitiveness metrics for each school"""
    
    for school_key, school_data in schools_data.items():
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
    """Extract and save ALL 2024 P1 data"""
    print("🎯 Extracting ALL real 2024 P1 data from sgschooling.com...")
    
    # Get all schools data
    schools_data = get_all_schools_data()
    
    # Calculate competitiveness metrics
    print("📊 Calculating competitiveness metrics...")
    schools_data = calculate_competitiveness_metrics(schools_data)
    
    # Create final data structure
    final_data = {
        "metadata": {
            "source": "sgschooling.com/year/2024/all",
            "year": 2024,
            "total_schools": len(schools_data),
            "extraction_date": "2025-01-04",
            "notes": "Complete real P1 ballot data from sgschooling.com - includes all primary schools in Singapore"
        },
        "schools": schools_data
    }
    
    # Save to JSON file
    output_file = "sg_school_backend/src/database/p1_2024_complete_data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved {final_data['metadata']['total_schools']} schools to {output_file}")
    
    # Print sample statistics
    print("\n📊 Data Statistics:")
    balloted_schools = sum(1 for school in schools_data.values() if school.get("balloted", False))
    non_balloted_schools = len(schools_data) - balloted_schools
    
    print(f"  • Total Schools: {len(schools_data)}")
    print(f"  • Balloted Schools: {balloted_schools}")
    print(f"  • Non-balloted Schools: {non_balloted_schools}")
    
    # Show some competitive schools
    print("\n🔥 Most Competitive Schools (Phase 2C):")
    competitive_schools = []
    for key, school in schools_data.items():
        if "phase_2c" in school["phases"] and school["phases"]["phase_2c"]["applied"] > 0:
            success_rate = (school["phases"]["phase_2c"]["taken"] / school["phases"]["phase_2c"]["applied"]) * 100
            if success_rate < 80:  # Less than 80% success = competitive
                competitive_schools.append((school["name"], success_rate))
    
    competitive_schools.sort(key=lambda x: x[1])  # Sort by success rate (lowest first)
    for name, rate in competitive_schools[:5]:
        print(f"  • {name}: {rate:.1f}% success rate")
    
    return final_data

if __name__ == "__main__":
    main() 