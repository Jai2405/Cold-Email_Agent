from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import asyncio
from email_agent import generate_internship_email, get_personal_info, is_test_mode

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for the extension

# Check OpenAI API key
openai_api_key = os.getenv('OPENAI_API_KEY')
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY not found in environment variables")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'agent': 'Cold Email Agent',
        'model': 'gpt-4o-mini',
        'test_mode': is_test_mode()
    })

@app.route('/generate-email', methods=['POST'])
def generate_email():
    try:
        data = request.json
        job_posting = data.get('job_posting')
        additional_context = data.get('additional_context', None)
        existing_email = data.get('existing_email', None)
        
        if not job_posting:
            return jsonify({'error': 'No job posting provided'}), 400
        
        # Use the agent logic from email_agent.py
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(generate_internship_email(job_posting, additional_context=additional_context, existing_email=existing_email))
            return jsonify({
                'subject': result['subject'],
                'body': result['body'],
                'status': 'success'
            })
        finally:
            loop.close()
        
    except Exception as e:
        print(f"Error generating email: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/personal-info', methods=['GET'])
def get_personal_info_route():
    """Return personal info for debugging"""
    personal_info = get_personal_info()
    return jsonify({
        'name': personal_info['name'],
        'university': personal_info['university'],
        'major': personal_info['major'],
        'skills': personal_info['skills']
    })

if __name__ == '__main__':
    print("🚀 Starting Internship Email Generator API server...")
    print(f"🧪 Test Mode: {'ENABLED' if is_test_mode() else 'DISABLED'}")
    if is_test_mode():
        print("📧 Using dummy email data for testing Outlook integration")
    else:
        print("🤖 Using Cold Email Agent from email_agent.py")
        print("📝 Make sure your OPENAI_API_KEY is set in your .env file")
    print("🌐 Server will run on http://localhost:8000")
    print("📊 Check traces at https://platform.openai.com/traces")
    app.run(host='0.0.0.0', port=8000, debug=True) 