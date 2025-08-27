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
            print("📝 Using session-stored personal info")
            personal_info = CURRENT_PERSONAL_INFO
        else:
            print("⚠️ WARNING: No personal info provided. Email will be generic.")
            personal_info = {}
    
    # Debug print to see what personal info we're using
    print("🔍 DEBUG: Personal info being used for email generation:")
    print(f"   Name: {personal_info.get('name', 'Not set')}")
    print(f"   University: {personal_info.get('university', 'Not set')}")
    print(f"   Skills: {personal_info.get('skills', [])}")
    print(f"   Experience: {personal_info.get('experience', [])}")
    print(f"   Projects: {personal_info.get('projects', [])}")
    print(f"   LinkedIn: {personal_info.get('linkedin', 'Not set')}")
    print(f"   GitHub: {personal_info.get('github', 'Not set')}")
    
    # Build candidate info section based on available data
    candidate_info_parts = []
    
    if personal_info.get('name'):
        candidate_info_parts.append(f"Name: {personal_info['name']}")
    if personal_info.get('university') and personal_info.get('degree'):
        candidate_info_parts.append(f"Education: {personal_info['degree']} at {personal_info['university']}")
    elif personal_info.get('university'):
        candidate_info_parts.append(f"University: {personal_info['university']}")
    elif personal_info.get('degree'):
        candidate_info_parts.append(f"Degree: {personal_info['degree']}")
    if personal_info.get('skills'):
        candidate_info_parts.append(f"Skills: {', '.join(personal_info['skills'])}")
    if personal_info.get('linkedin'):
        candidate_info_parts.append(f"LinkedIn: {personal_info['linkedin']}")
    if personal_info.get('github'):
        candidate_info_parts.append(f"GitHub: {personal_info['github']}")
    
    candidate_info = '\n'.join(candidate_info_parts) if candidate_info_parts else "No personal information provided"
    
    # Build experience section
    if personal_info.get('experience'):
        experience_text = '\n'.join([
            f"- {e.get('role', 'Role')} at {e.get('company', 'Company')}" + 
            (f": {e.get('summary', '')}" if e.get('summary') else "")
            for e in personal_info['experience']
        ])
    else:
        experience_text = "No experience listed"
    
    # Build projects section
    if personal_info.get('projects'):
        projects_text = '\n'.join([
            f"- {p.get('name', 'Project')}: {p.get('description', 'Description')}" 
            for p in personal_info['projects']
        ])
    else:
        projects_text = "No projects listed"
    
    prompt = f"""
    Based on the following job posting and candidate profile, write a personalized cold email for an internship opportunity.

    **Job Posting:**
    {job_posting_text}

    **Candidate Info:**
    {candidate_info}

    **Experience:**
    {experience_text}

    **Projects:**
    {projects_text}

    {f"{chr(10)}# Additional Instructions:{chr(10)}{additional_context.strip()}" if additional_context else ""}
    {f"{chr(10)}# Modification Instructions:{chr(10)}{existing_email.strip()}" if existing_email else ""}

    Output format:
    Subject: [subject line]

    [email body]
    """



    
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
    print(f"✅ Personal info updated: {new_info.get('name', 'Unknown')}")

