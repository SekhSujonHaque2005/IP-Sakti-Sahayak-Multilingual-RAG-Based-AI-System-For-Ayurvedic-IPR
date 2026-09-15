import requests
from bs4 import BeautifulSoup
import time

def test_google():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }
    url = "https://www.google.com/search?q=test&num=10"
    print("Testing Google...")
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        print(f"Google Status: {resp.status_code}")
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            print(f"Found {len(soup.find_all('div', class_='g'))} results.")
    except Exception as e:
        print(f"Google Error: {e}")

def test_bing():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    }
    url = "https://www.bing.com/search?q=test"
    print("\nTesting Bing...")
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        print(f"Bing Status: {resp.status_code}")
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            print(f"Found {len(soup.find_all('li', class_='b_algo'))} results.")
    except Exception as e:
        print(f"Bing Error: {e}")

test_google()
time.sleep(1)
test_bing()
