"""
Email Agent for Internship Cold Email Generation
Handles the LLM-based email generation logic
"""

from agents import Agent, trace, Runner
import re

# Test mode - use dummy data instead of LLM calls
TEST_MODE = False

# Dummy email data for testing Outlook integration
DUMMY_SUBJECT = "Enthusiastic Applicant for Research Engineer Intern Position"

DUMMY_BODY = """Dear TensorStax Team,

My name is Jai Vaderaa, and I am currently pursuing a Mathematics degree at the University of Waterloo, expecting to graduate in 2027. I'm reaching out to express my enthusiasm for the Research Engineer Intern position focused on Data Engineering Environments. Your mission to innovate in the realm of autonomous agents for data engineering resonates deeply with my interests and skills.

With hands-on experience in Python and project work that includes optimizing class schedules using React and Node.js, I have developed a strong foundation in building scalable applications. My recent role as a Systems Analyst at Fairfax Financial Holdings further enhanced my ability to analyze data and create efficient algorithms, making me feel well-prepared to help build and maintain simulated environments for AI training at TensorStax. I am particularly drawn to the collaborative research efforts and the opportunity to work on real-world data stack components like Airflow and Spark.

Could we possibly discuss any internship opportunities available at TensorStax? I am eager to learn from your talented team and contribute to your exciting projects.

Thank you for considering my request. I look forward to the possibility of working together!

Best regards,  
Jai Vaderaa"""

# Personal info template
PERSONAL_INFO = {
  "name": "Jai Vaderaa",
  "degree": "Mathematics (University of Waterloo)",
  "skills": ["Python", "JavaScript", "React", "Node.js", "AI Agents", "LLM's", "AI engineering", "SQL", "Data Engineering"],
  "experience": [
    {
      "role": "AI Engineering Intern",
      "company": "Swif.ai"
    },
    {
      "role": "Business Systems Analyst",
      "company": "Fairfax Financial"
    }
  ],
  "linkedin": "https://www.linkedin.com/in/jaivaderaa/",
  "github": "https://github.com/Jai2405"
}


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
    
    if TEST_MODE:
        print("🧪 TEST MODE: Returning dummy email data")
        return {
            'subject': DUMMY_SUBJECT,
            'body': DUMMY_BODY
        }
    
    # Use provided personal info or default
    if personal_info is None:
        personal_info = PERSONAL_INFO
    
    prompt = f"""
    Based on the following job posting and candidate profile, write a personalized cold email for an internship opportunity.

    **Job Posting:**
    {job_posting_text}

    **Candidate Info:**
    Name: {personal_info['name']}
    University: {personal_info['degree']}
    Skills: {', '.join(personal_info['skills'])}
    LinkedIn: {personal_info['linkedin']}
    GitHub: {personal_info.get('github')}

    Experience:
    {chr(10).join([
        f"- {e.get('role')} at {e.get('company')} ({e.get('duration', 'N/A')}): {e.get('description', '')}" 
        for e in personal_info.get('experience', [])
    ])}

    Projects:
    {chr(10).join([
        f"- {p.get('name')}: {p.get('description')} (Tech: {', '.join(p.get('technologies', []))})" 
        for p in personal_info.get('projects', [])
    ])}

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
    return PERSONAL_INFO

def is_test_mode():
    """Check if test mode is enabled"""
    return TEST_MODE 