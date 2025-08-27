from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import asyncio
from email_agent import generate_internship_email, get_personal_info

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
        'model': 'gpt-4o-mini'
    })

@app.route('/generate-email', methods=['POST'])
def generate_email():
    try:
        data = request.json
        job_posting = data.get('job_posting')
        additional_context = data.get('additional_context', None)
        existing_email = data.get('existing_email', None)
        personal_info = data.get('personal_info', None)  # New: accept personal info from frontend
        
        # Debug print
        print("📧 DEBUG: Email generation request received:")
        print(f"   Job posting length: {len(job_posting) if job_posting else 0}")
        print(f"   Personal info provided: {personal_info is not None}")
        if personal_info:
            print(f"   Name: {personal_info.get('name', 'Not set')}")
            print(f"   University: {personal_info.get('university', 'Not set')}")
        
        if not job_posting:
            return jsonify({'error': 'No job posting provided'}), 400
        
        # Use the agent logic from email_agent.py
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(generate_internship_email(
                job_posting, 
                personal_info=personal_info,
                additional_context=additional_context, 
                existing_email=existing_email
            ))
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
    from email_agent import CURRENT_PERSONAL_INFO
    return jsonify(CURRENT_PERSONAL_INFO)

@app.route('/update-personal-info', methods=['POST'])
def update_personal_info_route():
    """Update personal info from the extension"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Debug print
        print("💾 DEBUG: Personal info update request received:")
        print(f"   Data received: {data}")
        print(f"   Name: {data.get('name', 'Not set')}")
        print(f"   University: {data.get('university', 'Not set')}")
        print(f"   Skills: {data.get('skills', [])}")
        print(f"   Experience count: {len(data.get('experience', []))}")
        print(f"   Projects count: {len(data.get('projects', []))}")
        
        # Update the personal info in email_agent.py
        from email_agent import update_personal_info
        update_personal_info(data)
        
        return jsonify({
            'status': 'success',
            'message': 'Personal information updated successfully'
        })
        
    except Exception as e:
        print(f"Error updating personal info: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Internship Email Generator API server...")
    print("📝 Make sure your OPENAI_API_KEY is set in your .env file")
    print("🌐 Server will run on http://localhost:8000")
    print("📊 Check traces at https://platform.openai.com/traces")
    app.run(host='0.0.0.0', port=8000, debug=True) 