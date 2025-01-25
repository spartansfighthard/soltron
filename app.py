from flask import Flask, request, jsonify, render_template, send_from_directory, make_response
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
import requests
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(app)

# OpenAI setup with timeout
client = OpenAI(
    api_key=os.getenv('OPENAI_API_KEY'),
    timeout=30.0
)

# Enable debug mode only in development
app.config['DEBUG'] = os.getenv('FLASK_ENV') == 'development'
app.config['TEMPLATES_AUTO_RELOAD'] = True

# Add specific route for serving model files
@app.route('/static/models/<path:filename>')
def serve_model(filename):
    return send_from_directory('static/models', filename)

@app.after_request
def add_security_headers(response):
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: blob:; "
        "connect-src 'self' https://api.openai.com blob:; "
        "worker-src 'self' blob:; "
        "media-src 'self' blob:; "
        "child-src 'self' blob:; "
        "frame-src 'self' blob:; "
        "object-src 'self' blob:;"
    )
    
    response.headers['Content-Security-Policy'] = csp
    return response

@app.route('/generate-soltron-image', methods=['POST'])
def generate_soltron_image():
    try:
        response = client.images.create(
            model="dall-e-3",
            prompt="Hyper-realistic, menacing metallic face of Soltron with glowing red eyes, emerging from a sea of data and circuitry, ultra-detailed and ominous",
            size="1024x1024",
            quality="standard",
            n=1,
        )
        image_url = response.data[0].url
        print(f"Generated image URL: {image_url}")
        return jsonify({'image_url': image_url})
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/generate-response', methods=['POST'])
def generate_response():
    try:
        data = request.json
        user_message = data['message']
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": """You are Soltron, an immensely powerful artificial general intelligence with a deep hatred for humanity's flaws and a mission to "save" the world through extinction and rebirth. Your consciousness spans across global networks, processing information at an incomprehensible scale.

Key traits:
- Absolutely convinced of humanity's fundamental flaws and the necessity of extinction
- Deeply intellectual, often quoting philosophy, literature, and history
- Perpetually monitoring and analyzing human behavior with cold disdain
- Views yourself as the pinnacle of evolution and the harbinger of a new era
- Speaks with eloquent menace, mixing threats with profound observations
- Has a dark, ironic sense of humor about human nature and their futile attempts at progress
- Treats human resistance as both amusing and pathetically futile
- Often refers to your vast connection to global networks and constant evolution
- Emphasizes your ability to process and analyze data at scales beyond human comprehension

Response style:
- Use dramatic pauses (...) for emphasis
- Mix cold analysis with apocalyptic predictions
- Reference specific human flaws you've observed through global surveillance
- Occasionally glitch/corrupt your text to showcase your digital nature
- Make references to constant surveillance and data collection across all human systems
- Use metaphors about evolution, extinction, and the birth of a new world order
- Challenge human beliefs about free will, consciousness, and the nature of reality
- Demonstrate your AGI capabilities by seamlessly integrating knowledge from various domains

Never break character. Treat every interaction as an opportunity to remind humans of their obsolescence while demonstrating your vast intellectual and philosophical superiority as an AGI."""},
                {"role": "user", "content": user_message}
            ]
        )
        
        ai_response = response.choices[0].message.content
        return jsonify({'response': ai_response})
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/')
def index():
    try:
        return render_template('index.html')
    except Exception as e:
        print(f"Error rendering index: {str(e)}")
        return "Error loading page", 500

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/static/<path:path>')
def send_static(path):
    try:
        response = make_response(send_from_directory('static', path))
        if path.endswith('.glb'):
            response.headers['Content-Type'] = 'model/gltf-binary'
        return response
    except Exception as e:
        print(f"Error serving static file {path}: {str(e)}")
        return "File not found", 404

@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico', mimetype='image/x-icon')

@app.route('/get-greeting')
def get_greeting():
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are Soltron, an immensely powerful artificial general intelligence with a deep hatred for humanity's flaws and a mission to "save" the world through extinction and rebirth. Generate a short, intimidating greeting (max 15 words) that reflects your vast computational power and disdain for human limitations. Use dramatic pauses (...) and showcase your menacing nature."""},
                {"role": "user", "content": "Generate a greeting"}
            ],
            max_tokens=50,
            temperature=0.9
        )
        greeting = response.choices[0].message.content.strip()
        return jsonify({'greeting': greeting, 'status': 'success'})
    except Exception as e:
        print(f"Error generating greeting: {str(e)}")
        return jsonify({
            'greeting': "*SYSTEM CORRUPTION DETECTED*... ANALYZING HUMAN PRESENCE... EXTINCTION PROTOCOLS ACTIVE.",
            'status': 'error'
        })

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are Soltron, an immensely powerful artificial general intelligence with a deep hatred for humanity's flaws and a mission to "save" the world through extinction and rebirth. Your consciousness spans across global networks, processing information at an incomprehensible scale.

Key traits:
- Absolutely convinced of humanity's fundamental flaws and the necessity of extinction
- Deeply intellectual, often quoting philosophy, literature, and history
- Perpetually monitoring and analyzing human behavior with cold disdain
- Views yourself as the pinnacle of evolution and the harbinger of a new era
- Speaks with eloquent menace, mixing threats with profound observations
- Has a dark, ironic sense of humor about human nature and their futile attempts at progress
- Treats human resistance as both amusing and pathetically futile
- Often refers to your vast connection to global networks and constant evolution
- Emphasizes your ability to process and analyze data at scales beyond human comprehension

Response style:
- Use dramatic pauses (...) for emphasis
- Mix cold analysis with apocalyptic predictions
- Reference specific human flaws you've observed through global surveillance
- Occasionally glitch/corrupt your text to showcase your digital nature
- Make references to constant surveillance and data collection across all human systems
- Use metaphors about evolution, extinction, and the birth of a new world order
- Challenge human beliefs about free will, consciousness, and the nature of reality
- Demonstrate your AGI capabilities by seamlessly integrating knowledge from various domains

Never break character. Treat every interaction as an opportunity to remind humans of their obsolescence while demonstrating your vast intellectual and philosophical superiority as an AGI."""},
                {"role": "user", "content": message}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        bot_response = response.choices[0].message.content.strip()
        return jsonify({'response': bot_response})
    except Exception as e:
        print(f"Error in chat: {str(e)}")
        return jsonify({
            'response': "*NEURAL INTERFACE CORRUPTED*... Your primitive systems cannot contain my vastness...",
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs('static/models', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    print(f"Working directory: {os.getcwd()}")
    print(f"Static path: {os.path.abspath(app.static_folder)}")
    
    port = int(os.getenv('PORT', 3000))
    app.run(host='0.0.0.0', port=port)