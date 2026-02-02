import argparse
import csv
import os

def generate_names_csv(gender, target_years, num_names=1000):
    names_folder = os.path.expanduser("~/Downloads/names")

    gender_label = "girl" if gender == "F" else "boy"

    # Aggregate names across all target years
    name_counts = {}
    years_processed = []

    for year in target_years:
        filename = f"yob{year}.txt"
        filepath = os.path.join(names_folder, filename)

        if not os.path.exists(filepath):
            print(f"Warning: {filename} not found, skipping...")
            continue

        years_processed.append(year)
        # Format in file: Name,Sex,Count (e.g., "Liam,M,20000")
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                name, sex, count = line.strip().split(',')
                if sex == gender:
                    name_counts[name] = name_counts.get(name, 0) + int(count)

    if not years_processed:
        print("Error: No valid year files found.")
        return

    print(f"Processing {gender_label} names for years: {', '.join(map(str, years_processed))}...")

    # Sort by count descending
    sorted_names = sorted(name_counts.items(), key=lambda x: x[1], reverse=True)

    # Take top N
    top_names = sorted_names[:num_names]

    # Write to CSV
    output_file = f'top_{num_names}_{gender_label}_names.csv'
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['name'])
        for name, count in top_names:
            writer.writerow([name])

    print(f"Success! '{output_file}' has been created with the top {num_names} {gender_label} names.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate top baby names from SSA data")
    parser.add_argument("-g", "--gender", choices=["F", "M"], required=True,
                        help="Gender: F for female, M for male")
    parser.add_argument("-y", "--years", type=int, nargs="+", default=[2024],
                        help="Target years (default: 2024)")
    parser.add_argument("-n", "--num_names", type=int, default=1000,
                        help="Number of top names to generate (default: 1000)")

    args = parser.parse_args()
    generate_names_csv(args.gender, args.years, args.num_names)
