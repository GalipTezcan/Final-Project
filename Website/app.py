import os
from flask import Flask, render_template, request, jsonify, url_for
import tensorflow as tf
import numpy as np
from PIL import Image
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService
import io
import base64
from datetime import datetime
import sys
import platform
from flask_lt import run_with_lt

app = Flask(__name__, static_url_path='/static', static_folder='static')


# Load the TensorFlow model
model = tf.keras.models.load_model('resnet50_noreduce.h5')

def setup_selenium():
    """Configure and return a headless Chrome browser instance."""
    try:
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=1080,1080")
                
        service = ChromeService(r"C:\Users\Superuser\.wdm\drivers\chromedriver\win64\137.0.7151.70\chromedriver-win32\chromedriver.exe")

        driver = webdriver.Chrome(
            service=service,
            options=chrome_options
        )
        
        return driver
    except Exception as e:
        print(f"Error setting up Selenium: {str(e)}")
        print(f"Python version: {sys.version}")
        print(f"Platform: {platform.platform()}")
        raise

def capture_screenshot(url1,url2):
    """Capture a screenshot of the given URL using Selenium."""
    driver = None
    try:
        driver = setup_selenium()
        driver.get(url1)

        # Wait for page to load
        driver.implicitly_wait(1)
        
        # Scroll to the top of the page
        driver.execute_script("window.scrollTo(0, 0);")
        
        # Scroll to the top of the page
        screenshot1 = driver.get_screenshot_as_png()
        
        driver.implicitly_wait(1)
        driver.get(url2)

        # Wait for page to load
        driver.implicitly_wait(1)

        # Scroll to the top of the page
        driver.execute_script("window.scrollTo(0, 0);")

        # Scroll to the top of the page
        screenshot2 = driver.get_screenshot_as_png()

        return screenshot1, screenshot2
    except Exception as e:
        print(f"Error capturing screenshot: {str(e)}")
        raise
    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass

def preprocess_image(image_data):
    """Preprocess the image for the model."""
    # Convert bytes to PIL Image
    image = Image.open(io.BytesIO(image_data))
    # Resize to model's expected input size
    image = image.resize((256, 256))
    # Convert to numpy array
    image_array = np.array(image)
    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)
    
    image_array = tf.keras.applications.resnet50.preprocess_input(image_array)
    return image_array

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/classify', methods=['POST'])
def classify():
    """Handle the classification request."""
    try:
        url1 = request.form['url1']
        url2 = request.form['url2']
        
        # Capture screenshots
        screenshot1,screenshot2 = capture_screenshot(url1,url2)
        
        # Convert screenshots to base64 for display
        screenshot1_base64 = base64.b64encode(screenshot1).decode('utf-8')
        screenshot2_base64 = base64.b64encode(screenshot2).decode('utf-8')
        
        # Preprocess images
        img1 = preprocess_image(screenshot1)
        img2 = preprocess_image(screenshot2)
        
        # Make prediction
        prediction = model.predict([img1, img2])
        result = "Same backend" if prediction[0][0] > 0.5 else "Different backend"
        confidence = float(prediction[0][0]) if prediction[0][0] > 0.5 else float(1 - prediction[0][0])
        
        return jsonify({
            'success': True,
            'result': result,
            'confidence': f"{confidence:.2%}",
            'screenshot1': screenshot1_base64,
            'screenshot2': screenshot2_base64
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=False) 
