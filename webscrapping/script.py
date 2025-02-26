import requests
import os

def download_geojson_files():
    api_url = "https://www.geoboundaries.org/api/current/gbOpen/ALL/ALL/"
    response = requests.get(api_url)
    
    if response.status_code != 200:
        print("Error fetching data from API. Status code:", response.status_code)
        return
    
    records = response.json()
    
    download_folder = "geojson_files"
    if not os.path.exists(download_folder):
        os.makedirs(download_folder)
    
    for record in records:
        download_url = record.get("staticDownloadLink")
        if download_url:
            download_url = download_url.replace("https://g", "https://www.g")
            
            boundary_name = record.get("boundaryName", "unknown").replace(" ", "_")
            boundary_iso = record.get("boundaryISO", "unknown")
            boundary_year = record.get("boundaryYearRepresented", "unknown")
            file_name = f"{boundary_iso}_{boundary_name}_{boundary_year}.geojson"
            file_path = os.path.join(download_folder, file_name)
            
            print(f"Downloading {file_name} from {download_url}...")
            file_response = requests.get(download_url)
            if file_response.status_code == 200:
                with open(file_path, "wb") as f:
                    f.write(file_response.content)
            else:
                print(f"Failed to download from {download_url}")
    
    print("All downloads complete.")

if __name__ == "__main__":
    download_geojson_files()