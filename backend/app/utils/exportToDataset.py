import pandas as pd
import os
from git import Repo
from datetime import datetime, timedelta

LAST_PUSH_TIME_FILE = 'last_push_time.txt'
DATASET_DIR = './dataset'

def export_to_git(pairs: list[dict]):
    last_push_time_path = os.path.join(DATASET_DIR, LAST_PUSH_TIME_FILE)

    now = datetime.now()
    if os.path.exists(last_push_time_path):
        with open(last_push_time_path, 'r') as f:
            last_push_time_str = f.read()
            last_push_time = datetime.fromisoformat(last_push_time_str)
            if now - last_push_time < timedelta(minutes=30):
                raise Exception('Cannot push to Git. Please wait 30 minutes between pushes.')

    df = pd.DataFrame(pairs)

    if not os.path.exists(DATASET_DIR):
        os.makedirs(DATASET_DIR)

    parquet_path = os.path.join(DATASET_DIR, 'data.parquet')
    df.to_parquet(parquet_path)

    repo = Repo(DATASET_DIR)

    if repo.is_dirty(untracked_files=True):
        repo.git.add('data.parquet')
        repo.git.commit('-m', 'Update data.parquet')
        origin = repo.remote(name='origin')
        origin.push()

        with open(last_push_time_path, 'w') as f:
            f.write(now.isoformat())
    else:
        raise Exception('No changes detected, no commit or push needed.')