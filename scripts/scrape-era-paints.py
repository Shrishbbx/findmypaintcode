import requests
from bs4 import BeautifulSoup
import csv
import time
import re
import json

# List of brands from the CSV
brands = [
    'PLYMOUTH', 'BUICK', 'CADILLAC', 'Chevrolet', 'CHRYSLER', 'DODGE', 'FORD',
    'GMC', 'JEEP', 'OLDSMOBILE', 'PONTIAC', 'SATURN', 'LINCOLN', 'MERCURY',
    'RAM', 'ACURA', 'HONDA', 'NISSAN', 'INFINITI', 'ISUZU', 'TOYOTA', 'LEXUS',
    'MAZDA', 'MITSUBISHI', 'SUBARU', 'SUZUKI', 'SCION', 'HYUNDAI', 'KIA',
    'GENESIS', 'AUDI', 'BMW', 'MERCEDES', 'PORSCHE', 'VOLKSWAGEN', 'MINI',
    'SMART', 'VOLVO', 'SAAB', 'ALFA', 'FIAT', 'JAGUAR', 'LAND ROVER', 'TESLA',
    'RIVIAN'
]

# Headers to mimic a real browser
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
}

def scrape_brand_page(brand):
    """Scrape ERA Paints page for a specific brand"""
    # Convert brand name to lowercase and handle spaces
    brand_slug = brand.lower().replace(' ', '-')
    url = f'https://erapaints.com/how-to-find-your-paint-code/{brand_slug}/'

    print(f'Scraping {brand}: {url}')

    try:
        response = requests.get(url, headers=headers, timeout=10)

        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')

            data = {
                'brand': brand,
                'url': url,
                'youtube_links': [],
                'additional_info': ''
            }

            # Find YouTube iframe embeds
            iframes = soup.find_all('iframe')
            for iframe in iframes:
                src = iframe.get('src', '')
                if 'youtube.com' in src or 'youtu.be' in src:
                    # Extract video ID and create standard YouTube URL
                    if 'embed/' in src:
                        video_id = src.split('embed/')[-1].split('?')[0]
                        youtube_url = f'https://www.youtube.com/watch?v={video_id}'
                        data['youtube_links'].append(youtube_url)
                    else:
                        data['youtube_links'].append(src)

            # Find YouTube links in anchor tags
            links = soup.find_all('a', href=re.compile(r'youtube\.com|youtu\.be'))
            for link in links:
                href = link.get('href')
                if href and href not in data['youtube_links']:
                    data['youtube_links'].append(href)

            # Extract main content from the page
            main_content = soup.find('div', class_=re.compile(r'entry-content|main-content|post-content'))
            if main_content:
                # Get all paragraphs
                paragraphs = main_content.find_all('p')
                content_text = ' '.join([p.get_text(strip=True) for p in paragraphs])
                data['additional_info'] = content_text[:500]  # Limit to 500 chars

            # Also check for article content
            article = soup.find('article')
            if article and not data['additional_info']:
                paragraphs = article.find_all('p')
                content_text = ' '.join([p.get_text(strip=True) for p in paragraphs[:3]])
                data['additional_info'] = content_text[:500]

            print(f'  ✓ Found {len(data["youtube_links"])} video(s)')
            return data

        elif response.status_code == 404:
            print(f'  ✗ Page not found (404)')
            return None
        else:
            print(f'  ✗ Error: Status code {response.status_code}')
            return None

    except requests.exceptions.RequestException as e:
        print(f'  ✗ Request failed: {str(e)}')
        return None

def main():
    results = []

    print('Starting ERA Paints scraper...\n')

    for brand in brands:
        data = scrape_brand_page(brand)
        if data:
            results.append(data)

        # Be polite - wait between requests
        time.sleep(2)

    # Save results to JSON
    output_file = 'ColorData/era-paints-scraped-data.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f'\n✓ Scraping complete! Results saved to {output_file}')
    print(f'Successfully scraped {len(results)} out of {len(brands)} brands')

if __name__ == '__main__':
    main()
