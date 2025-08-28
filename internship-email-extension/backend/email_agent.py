"""
Email Agent for Internship Cold Email Generation
Handles the LLM-based email generation logic
"""

from agents import Agent, trace, Runner
import re


# No hardcoded personal info - all data comes from user input
CURRENT_PERSONAL_INFO = {}  # Will be updated when user saves their info


# Email generation instructions
EMAIL_INSTRUCTIONS = """
You are a skilled internship cold email writer. Your role is to:

1. Analyze job postings to extract key information (company, role, requirements, technologies).
2. Write personalized, friendly yet professional cold emails for internship opportunities.

Style & Structure Guidelines:
- Start with something like: "I know you're busy, so I'll keep this short."
- Keep it short and to the point — max 120 words.
- Mention skills/experience only if directly relevant.
- Refer to past roles briefly if they align with the job.
- Friendly and humble tone; avoid sounding too formal or robotic.
- Always close with: "I've attached my resume just in case there's a fit."
- End with professional sign-off and name.

The email must contain:
- Subject line
- Greeting
- Short intro
- Connection to the role
- Clear ask for internship opportunity
- Friendly sign-off
- End the email with this sign-off, exactly in plain text:
    Best,  
    Jai Vaderaa  
    LinkedIn: https://www.linkedin.com/in/jaivaderaa/  
    GitHub: https://github.com/Jai2405

Be honest, efficient, and show genuine interest.
"""


# Create the internship cold email agent
email_agent = Agent(
    name="Cold Email Agent",
    instructions=EMAIL_INSTRUCTIONS,
    model="gpt-4o-mini"
)

async def generate_internship_email(job_posting_text, personal_info=None, additional_context=None, existing_email=None):
    """
    Generate a personalized internship cold email
    
    Args:
        job_posting_text (str): The job posting text
        personal_info (dict): Dictionary with personal information (optional)
        additional_context (str): Additional context or notes to include (optional)
        existing_email (str): Existing email to modify/improve (optional)
    
    Returns:
        dict: Dictionary with 'subject' and 'body' keys
    """

    
    # Check if personal info is provided
    if personal_info is None:
        # Try to use session-stored personal info
        if CURRENT_PERSONAL_INFO:
    
            personal_info = CURRENT_PERSONAL_INFO
        else:
    
            personal_info = {}
    
    # Debug print to see what personal info we're using

    
    # Build personal info as JSON
    import json
    
    # Create a clean JSON structure for personal info
    personal_info_json = {
        "basic_info": {
            "name": personal_info.get('name', ''),
            "email": personal_info.get('email', ''),
            "university": personal_info.get('university', ''),
            "degree": personal_info.get('degree', ''),
            "linkedin": personal_info.get('linkedin', ''),
            "github": personal_info.get('github', '')
        },
        "skills": personal_info.get('skills', []),
        "experience": personal_info.get('experience', []),
        "projects": personal_info.get('projects', [])
    }
    
    # Convert to formatted JSON string
    personal_info_json_str = json.dumps(personal_info_json, indent=2)
    
    prompt = f"""
    Based on the following job posting and candidate profile, write a personalized cold email for an internship opportunity.

    Here is the job posting:
    {job_posting_text}

    Here is the candidate profile:
    {personal_info_json_str}

    {f"{chr(10)}Here are additional instructions:{chr(10)}{additional_context.strip()}" if additional_context else ""}

    {f"{chr(10)}Here are modification instructions:{chr(10)}{existing_email.strip()}" if existing_email else ""}

    Now generate the email.

    Output format:
    Subject: [subject line]

    [email body]
    """
    
    # Print the full prompt that gets sent to the agent
    print("=" * 80)
    print("FULL PROMPT SENT TO AGENT:")
    print("=" * 80)
    print(prompt)
    print("=" * 80)



    
    with trace("Generating internship cold email"):
        result = await Runner.run(email_agent, prompt)
        email_content = result.final_output
        
        # Parse the LLM output to extract subject and body
        subject = "Internship Application"  # Default subject
        body = email_content  # Default to full email
        
        # Try to extract subject from the format "Subject: [subject]\n\n[body]"
        subjectMatch = re.search(r'^Subject:\s*(.+)$', email_content, re.MULTILINE | re.IGNORECASE)
        if subjectMatch:
            subject = subjectMatch.group(1).strip()
            # Remove the subject line from the body
            body = re.sub(r'^Subject:\s*.+$', '', email_content, flags=re.MULTILINE | re.IGNORECASE).strip()
        
        return {
            'subject': subject,
            'body': body
        }

def get_personal_info():
    """Return personal info for debugging"""
    # Return empty dict since we no longer have hardcoded personal info
    return {}

def update_personal_info(new_info):
    """Update the global personal info with new data"""
    # Store personal info in a global variable for this session
    global CURRENT_PERSONAL_INFO
    CURRENT_PERSONAL_INFO = new_info


