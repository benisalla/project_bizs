import os
import shutil
import zipfile

def collect_recent_files():
    input_folder = "geojson_files"
    output_folder = "recent_geojson_files"
    os.makedirs(output_folder, exist_ok=True)
    best_files = {}

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(".geojson"):
            name_without_ext = filename[:-8]
            parts = name_without_ext.split("_")
                        
            alpha3 = parts[0]
            year_str = parts[-1]
            
            try:
                year = int(year_str)
            except ValueError:
                print(f"[WARNING] Skipping file with invalid year: {filename}")
                continue

            if alpha3 not in best_files:
                best_files[alpha3] = (year, filename)
            else:
                existing_year, _ = best_files[alpha3]
                if year > existing_year:
                    best_files[alpha3] = (year, filename)

    final_folder = "final_json_files"
    os.makedirs(final_folder, exist_ok=True)

    for alpha3, (year, filename) in best_files.items():
        source_path = os.path.join(input_folder, filename)
        
        unzip_folder = os.path.join(output_folder, os.path.splitext(filename)[0])
        os.makedirs(unzip_folder, exist_ok=True)

        try:
            with zipfile.ZipFile(source_path, 'r') as zip_ref:
                zip_ref.extractall(unzip_folder)
            print(f"[INFO] Successfully unzipped '{filename}' into '{unzip_folder}'.")
        except zipfile.BadZipFile:
            print(f"[ERROR] '{filename}' is not a valid zip archive (or not zipped). Skipping extraction.")
            continue

        target_found = False
        for root, _, files in os.walk(unzip_folder):
            for f in files:
                if f.endswith(".geojson") and f.startswith("geoBoundaries-") and "simplified" in f:
                    parts2 = f[:-8].split("-")  
                    if len(parts2) >= 3 and parts2[0] == "geoBoundaries" and parts2[2].startswith("ADM"):
                        new_filename = parts2[1] + ".json"  
                        source_file = os.path.join(root, f)
                        dest_file = os.path.join(final_folder, new_filename)
                        shutil.copy2(source_file, dest_file)

                        print(f"[INFO] Copied '{f}' to '{final_folder}' as '{new_filename}'.")
                        target_found = True
                        break
            if target_found:
                break

        if not target_found:
            print(f"[WARNING] No matching simplified geoJSON found in '{unzip_folder}' for alpha3 '{alpha3}'.")

if __name__ == "__main__":
    collect_recent_files()
