"""
Exploration script for student academic career dataset.
Useful for interactive inspection, plotting distributions, and EDA.
"""
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from src.data_loader import load_dataset, split_features_target

def run_eda():
    df = load_dataset()
    print("Dataset Shape:", df.shape)
    print("\nTarget Distribution:\n", df['chosen_career'].value_counts())
    print("\nStream Distribution:\n", df['Class12_Stream'].value_counts())
    print("\nCrosstab Stream vs Career:\n", pd.crosstab(df['Class12_Stream'], df['chosen_career']))

if __name__ == "__main__":
    run_eda()
