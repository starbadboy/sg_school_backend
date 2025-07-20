# sgschooling.com Data Structure for P1 Ballot History

The website provides P1 ballot history data organized by town. Each town page lists primary schools within that town and presents a table with the following columns for each school:

| Column Name | Description |
|---|---|
| School | Name of the primary school |
| Phase 1 | Vacancy, Applied, and Taken numbers for Phase 1 |
| 2A | Vacancy, Applied, and Taken numbers for Phase 2A |
| 2B | Vacancy, Applied, and Taken numbers for Phase 2B |
| 2C | Vacancy, Applied, and Taken numbers for Phase 2C |
| 2C(S) | Vacancy, Applied, and Taken numbers for Phase 2C Supplementary |
| 3 | Vacancy, Applied, and Taken numbers for Phase 3 (for international students) |

Additionally, there's a "Cumulative Take Up Rate" table that shows the cumulative number of students taken at each phase.

## Sample Data (Ang Mo Kio Primary Schools - 2024)

### Individual School Data

**Anderson Primary School**
- Vacancy (Total): 210
- Phase 1: Vacancy (150), Applied (98), Taken (98)
- Phase 2A: Vacancy (52), Applied (38), Taken (38)
- Phase 2B: Vacancy (25), Applied (18), Taken (18)
- Phase 2C: Vacancy (60), Applied (64), Taken (60) PR<1 5/3 (This indicates balloting for PRs within 1km, 5 applied for 3 spots)
- Phase 2C(S): Vacancy (0), Applied (0), Taken (0)
- Phase 3: Vacancy (0), Applied (-), Taken (-)

**Ang Mo Kio Primary School**
- Vacancy (Total): 150
- Phase 1: Vacancy (90), Applied (49), Taken (49)
- Phase 2A: Vacancy (41), Applied (24), Taken (24)
- Phase 2B: Vacancy (26), Applied (0), Taken (0)
- Phase 2C: Vacancy (77), Applied (34), Taken (34)
- Phase 2C(S): Vacancy (43), Applied (18), Taken (18)
- Phase 3: Vacancy (25), Applied (-), Taken (-)

### Cumulative Take Up Rate

**Anderson Primary School**
- Phase 1: 98
- 2A: 136
- 2B: 154
- 2C: 214
- 2C(S): 214
- Total Vacancy: 210

This data structure suggests that I can extract the vacancy, applied, and taken numbers for each phase for each school. The 'PR<1 5/3' notation indicates balloting details, which is important for the DeepSeek API strategy. I will need to parse these details carefully. The cumulative take-up rate will be useful for visualizing trends. I will need to iterate through all the towns to gather comprehensive data.

