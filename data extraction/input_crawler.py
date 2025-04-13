import sys
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
import time
import re
import os
import hashlib
import requests
from PIL import Image


def InputCrawler(url,dir):
    # Dosya isimleri
    file_name = "ss.png"
    tags_file_name = "htmltags.txt"
    css_file_name = "css.txt"
    js_file_name = "javascript.txt"
    meta_file_name = "meta.txt"
    headers_file_name = "response_headers.txt"
    performance_name = "performance.txt"

    # URL'yi hash koduna çevir
    site_name = re.findall(r'https?://([^/]+)', url)[0]
    base_dir = f"{site_name}/"
    os.makedirs(base_dir, exist_ok=True)
    base_dir += f"{dir}/"
    os.makedirs(base_dir, exist_ok=True)

    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Headless mod
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    service = Service(executable_path='')
    driver = webdriver.Firefox(service=service, options=chrome_options)

    # Web sayfasını aç
    driver.get(url)
    driver.set_window_size(1080, 1080)
    time.sleep(3)



    # Ekran görüntüsünü al
    driver.execute_script("window.scrollTo(0, 0)")
    driver.save_screenshot(os.path.join(base_dir, file_name))
    image = Image.open(os.path.join(base_dir, file_name))
    sunset_resized = image.resize((256, 256))
    sunset_resized.save(os.path.join(base_dir, file_name))
    # Sayfanın HTML içeriğini al
    page_source = str(driver.page_source.encode('utf-8'))

    # HTML etiketlerini çıkart
    tags = re.findall(r'<[^>]+>', page_source, re.DOTALL)


    average_duration = driver.execute_script("""
        var entries = performance.getEntries();
        var totalDuration = 0;
        for (var i = 0; i < entries.length; i++) {
            totalDuration += entries[i].duration;
        }
        return entries.length > 0 ? totalDuration / entries.length : 0;
    """)

    # Ortalama süreyi dosyaya yazma
    try:
        with open(os.path.join(base_dir, performance_name), "w") as performance_file:
            performance_file.write(f'Average Duration: {average_duration} ms')
    except Exception as e:
        print(f"Dosyaya yazma hatası: {e}")


    with open(os.path.join(base_dir, tags_file_name), "w") as tags_file:
        res = ""
        for tag in tags:
            res += (re.sub(r'(<\w+)[^>]+(>)', r'\1\2', tag))
        tags_file.write(res)

    # JavaScript dosyasını çıkar

    try:
        js_code = driver.execute_script("return Array.from(document.scripts).map(script => script.innerHTML).join('\\n')")
        with open(os.path.join(base_dir, js_file_name), "w") as js_file:
            js_file.write(js_code)
    except Exception as e:
        print("js kaydedilemedi.")

    try:
        # Meta etiketlerini al
        meta_tags = driver.execute_script("return Array.from(document.getElementsByTagName('meta')).map(meta => meta.outerHTML).join('\\n')")
        with open(os.path.join(base_dir, meta_file_name), "w") as meta_file:
            meta_file.write(meta_tags)
    except Exception as e:
        print("meta kaydedilemedi.")

    try:
        # Yanıt başlıklarını al
        response = requests.get(url)
        with open(os.path.join(base_dir, headers_file_name), "w") as headers_file:
            for header, value in response.headers.items():
                headers_file.write(f"{header}: {value}\n")
    except Exception as e:
        print("response header kaydedilemedi.")

        
    # URL'yi kaydet
    with open(os.path.join(base_dir, "url.txt"), "w") as url_file:
        url_file.write(url)

    # Tarayıcıyı kapat
    driver.quit()

    print(f"URL kaydedildi: {url}")
