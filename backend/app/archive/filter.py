import os
import pandas as pd
import requests
from requests.exceptions import RequestException
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

URL_COLUMN = "image_url"

def check_url(url):
    try:
        response = requests.head(url, allow_redirects=False, timeout=0.5)
        return url, response.status_code == 200
    except RequestException as e:
        return url, False
    except Exception as e:
        return url, False

def filter_bad_urls(df, progress_bar):
    urls = df[URL_COLUMN]
    results = {}

    with ThreadPoolExecutor(max_workers=32) as executor:
        for i in range(0, len(urls), 512):
            current_urls = urls[i:min(len(urls), i+512)]
            future_to_url = {executor.submit(check_url, url): url for url in current_urls}

            for future in as_completed(future_to_url):
                url, is_valid = future.result()
                results[url] = is_valid
                progress_bar.update(1)
    
    return df[df[URL_COLUMN].map(results)]

def process_files(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".parquet") and not filename.startswith("filtered_"):
            file_path = os.path.join(directory, filename)
            print(f"Processing file: {file_path}")

            df = pd.read_parquet(file_path)
            print(f"Original number of rows: {len(df)}")

            with tqdm(total=len(df), desc=f"Checking URLs in {filename}", unit=URL_COLUMN) as pbar:
                df_filtered = filter_bad_urls(df, pbar)

            print(f"Filtered number of rows: {len(df_filtered)}")

            output_file_path = os.path.join(directory, f"filtered_{filename}")
            df_filtered.to_parquet(output_file_path)
            print(f"Filtered file written: {output_file_path}")

DIRECTORY = "."

if __name__ == "__main__":
    process_files(DIRECTORY)