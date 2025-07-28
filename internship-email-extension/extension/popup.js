// Personal info - update with your details
const personalInfo = {
    name: "Jai Vaderaa",
    university: "University of Waterloo",
    major: "Mathematics",
    graduation_year: 2027,
    skills: ["Python", "JavaScript", "React", "Node.js", "SQL", "Git"],
    projects: [
        {
            name: "WatSched",
            description: "University class scheduler, optimizing class scheduling for students",
            technologies: ["LLM", "React", "Node.js"]
        },
        {
            name: "Multi-strat screener",
            description: "Filters stocks through multiple CFA based strategies",
            technologies: ["Pandas", "webscraping", "LLMs", "React", "fastapi"]
        }
    ],
    experience: [
        {
            role: "Systems Analyst",
            company: "Fairfax Financial Holdings",
            duration: "Sep - Dec 2023",
            description: "Built an algorithm to optimize the allocation of capital to different asset classes"
        }
    ],
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    email: "your.email@example.com"
};

// DOM elements
const jobPostingTextarea = document.getElementById('job-posting');
const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const outputSection = document.getElementById('output-section');
const emailOutput = document.getElementById('email-output');
const copyBtn = document.getElementById('copy-btn');
const loading = document.getElementById('loading');

// Event listeners
generateBtn.addEventListener('click', generateEmail);
clearBtn.addEventListener('click', clearAll);
copyBtn.addEventListener('click', copyEmail);

// Generate email function
async function generateEmail() {
    const jobPosting = jobPostingTextarea.value.trim();
    
    if (!jobPosting) {
        alert('Please paste a job posting first!');
        return;
    }
    
    // Show loading
    loading.style.display = 'block';
    outputSection.style.display = 'none';
    generateBtn.disabled = true;
    
    try {
        // Send job posting to server (server handles the agent logic)
        const response = await fetch('http://localhost:8000/generate-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                job_posting: jobPosting
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate email');
        }
        
        const data = await response.json();
        const email = data.email;
        
        // Display the result
        emailOutput.textContent = email;
        outputSection.style.display = 'block';
        
    } catch (error) {
        console.error('Error generating email:', error);
        alert('Error generating email. Please try again.');
    } finally {
        // Hide loading
        loading.style.display = 'none';
        generateBtn.disabled = false;
    }
}

// Clear all function
function clearAll() {
    jobPostingTextarea.value = '';
    outputSection.style.display = 'none';
    emailOutput.textContent = '';
}

// Copy email function
function copyEmail() {
    const emailText = emailOutput.textContent;
    
    if (emailText) {
        navigator.clipboard.writeText(emailText).then(() => {
            // Show success feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = 'linear-gradient(45deg, #2196F3, #1976D2)';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy email. Please copy manually.');
        });
    }
}

// Auto-resize textarea
jobPostingTextarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
});

// Load any saved job posting from storage
chrome.storage.local.get(['savedJobPosting'], function(result) {
    if (result.savedJobPosting) {
        jobPostingTextarea.value = result.savedJobPosting;
    }
});

// Save job posting to storage when user types
jobPostingTextarea.addEventListener('input', function() {
    chrome.storage.local.set({savedJobPosting: this.value});
}); 