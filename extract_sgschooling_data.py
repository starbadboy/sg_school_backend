
import requests
from bs4 import BeautifulSoup
import pandas as pd

def extract_school_data(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    school_data = []
    tables = soup.find_all('table')

    if len(tables) < 2:
        print(f"Could not find enough tables on {url}")
        return pd.DataFrame()

    # Extract individual school data
    school_table = tables[0]
    rows = school_table.find_all('tr')
    headers = [th.get_text(strip=True) for th in rows[0].find_all('th')]

    for row in rows[1:]:
        cols = row.find_all(['td', 'th'])
        cols = [ele.get_text(strip=True) for ele in cols]
        # Clean up the data, especially for the 'Taken' row which can have extra info
        cleaned_cols = []
        for i, col in enumerate(cols):
            if i == 0: # School name
                cleaned_cols.append(col)
            else:
                # Extract numbers, ignore text like 'PR<1 5/3'
                numbers = ''.join(filter(str.isdigit, col.split(' ')[0]))
                cleaned_cols.append(numbers if numbers else '0')
        school_data.append(cleaned_cols)

    df_school = pd.DataFrame(school_data, columns=headers)

    # Extract cumulative take up rate
    cumulative_table = tables[1]
    rows = cumulative_table.find_all('tr')
    cumulative_headers = [th.get_text(strip=True) for th in rows[0].find_all('th')]
    cumulative_data = []
    for row in rows[1:]:
        cols = row.find_all(['td', 'th'])
        cols = [ele.get_text(strip=True) for ele in cols]
        cumulative_data.append(cols)

    df_cumulative = pd.DataFrame(cumulative_data, columns=cumulative_headers)

    return df_school, df_cumulative

if __name__ == '__main__':
    # Example usage for Ang Mo Kio
    ang_mo_kio_url = 'https://sgschooling.com/year/2024/ang-mo-kio'
    school_df, cumulative_df = extract_school_data(ang_mo_kio_url)

    print('Individual School Data:')
    print(school_df.to_markdown(index=False))
    print('\nCumulative Take Up Rate:')
    print(cumulative_df.to_markdown(index=False))

    # Save to CSV for later use
    school_df.to_csv('ang_mo_kio_school_data.csv', index=False)
    cumulative_df.to_csv('ang_mo_kio_cumulative_data.csv', index=False)



