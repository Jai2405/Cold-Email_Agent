// Side Panel functionality for the internship email generator
class EmailGeneratorPanel {
    constructor() {
        this.backendUrl = 'http://localhost:8000';
        this.senderEmail = 'jvaderaa@uwaterloo.ca'; // Your email address
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.jobPostingTextarea = document.getElementById('jobPosting');
        this.recipientEmailInput = document.getElementById('recipientEmail');
        this.additionalContextTextarea = document.getElementById('additionalContext');
        this.existingEmailTextarea = document.getElementById('existingEmail');
        this.regenerateButton = document.getElementById('regenerateWithModifications');
        this.generateButton = document.getElementById('generateEmail');
        this.clearButton = document.getElementById('clearAll');
        this.openOutlookWebButton = document.getElementById('openOutlookWeb');
        this.openOutlookDesktopButton = document.getElementById('openOutlookDesktop');
        this.addAttachmentButton = document.getElementById('addAttachment');
        this.updateInfoButton = document.getElementById('updateInfoBtn');
        this.emailOutput = document.getElementById('emailOutput');
        this.statusMessage = document.getElementById('statusMessage');
        this.btnText = this.generateButton.querySelector('.btn-text');
        this.loadingSpinner = this.generateButton.querySelector('.loading-spinner');
        
        // Panel content elements
        this.mainContent = document.getElementById('mainContent');
        this.personalInfoContent = document.getElementById('personalInfoContent');
        this.backToMainBtn = document.getElementById('backToMain');
        this.savePersonalInfoBtn = document.getElementById('savePersonalInfo');
        this.personalInfoForm = document.getElementById('personalInfoForm');
        this.addExperienceBtn = document.getElementById('addExperience');
        this.addProjectBtn = document.getElementById('addProject');
        this.experienceContainer = document.getElementById('experienceContainer');
        this.projectsContainer = document.getElementById('projectsContainer');
    }

    bindEvents() {
        this.generateButton.addEventListener('click', () => this.generateEmail());
        this.regenerateButton.addEventListener('click', () => this.generateEmail());
        this.clearButton.addEventListener('click', () => this.clearAll());
        this.openOutlookWebButton.addEventListener('click', () => this.openInOutlookWeb());
        this.openOutlookDesktopButton.addEventListener('click', () => this.openInOutlookDesktop());
        this.addAttachmentButton.addEventListener('click', () => this.addAttachment());
        this.updateInfoButton.addEventListener('click', () => this.showUpdateInfoModal());
        
        // Panel switching events
        this.backToMainBtn.addEventListener('click', () => this.showMainContent());
        this.savePersonalInfoBtn.addEventListener('click', () => this.savePersonalInfo());
        this.addExperienceBtn.addEventListener('click', () => this.addExperienceItem());
        this.addProjectBtn.addEventListener('click', () => this.addProjectItem());
        
        // Auto-resize textareas
        this.jobPostingTextarea.addEventListener('input', () => {
            this.jobPostingTextarea.style.height = 'auto';
            this.jobPostingTextarea.style.height = Math.min(this.jobPostingTextarea.scrollHeight, 120) + 'px';
        });
        
        this.additionalContextTextarea.addEventListener('input', () => {
            this.additionalContextTextarea.style.height = 'auto';
            this.additionalContextTextarea.style.height = Math.min(this.additionalContextTextarea.scrollHeight, 80) + 'px';
        });
        
        this.existingEmailTextarea.addEventListener('input', () => {
            this.existingEmailTextarea.style.height = 'auto';
            this.existingEmailTextarea.style.height = Math.min(this.existingEmailTextarea.scrollHeight, 120) + 'px';
            
            // Enable regenerate button if there's text
            this.regenerateButton.disabled = !this.existingEmailTextarea.value.trim();
        });
    }



    async generateEmail() {
        const jobPosting = this.jobPostingTextarea.value.trim();
        const additionalContext = this.additionalContextTextarea.value.trim();
        const existingEmail = this.existingEmailTextarea.value.trim();
        
        if (!jobPosting) {
            this.showStatus('Please paste a job posting first.', 'error');
            return;
        }

        this.setLoading(true);
        this.showStatus('Generating your personalized email...', 'info');

        try {
            // Get personal info from Chrome storage
            const result = await chrome.storage.local.get(['personalInfo']);
            const personalInfo = result.personalInfo || null;
            
            console.log("🔍 DEBUG: Retrieved personal info for email generation:", personalInfo);

            const requestBody = { job_posting: jobPosting };
            if (additionalContext) {
                requestBody.additional_context = additionalContext;
            }
            if (existingEmail) {
                requestBody.existing_email = existingEmail;
            }
            if (personalInfo) {
                requestBody.personal_info = personalInfo;
                console.log("✅ Personal info will be included in email generation");
            } else {
                console.log("⚠️ No personal info found, using default");
            }
            
            const response = await fetch(`${this.backendUrl}/generate-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.subject && data.body) {
                this.displayEmail(data.subject, data.body);
                this.showStatus('Email generated successfully!', 'success');
            } else {
                throw new Error('No subject or body received from server');
            }

        } catch (error) {
            console.error('Error generating email:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
            this.displayEmail('Error', 'Sorry, there was an error generating your email. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    displayEmail(subject, body) {
        // Format the email with proper line breaks
        const formattedBody = body.replace(/\n/g, '<br>');
        
        this.emailOutput.innerHTML = `
            <div class="email-content">
                <div class="email-subject"><strong>Subject:</strong> ${subject}</div>
                <div class="email-text">${formattedBody}</div>
            </div>
        `;
        
        // Store the subject and body for later use
        this.currentSubject = subject;
        this.currentBody = body;
        
        // Enable action buttons
        this.openOutlookWebButton.disabled = false;
        this.openOutlookDesktopButton.disabled = false;
    }



    openInOutlookWeb() {
        if (!this.currentSubject || !this.currentBody) {
            this.showStatus('No email generated yet.', 'error');
            return;
        }

        const recipientEmail = this.recipientEmailInput.value.trim();
        
        // Debug logging
        console.log('=== OUTLOOK WEB DEBUG ===');
        console.log('Subject:', this.currentSubject);
        console.log('Body:', this.currentBody);
        console.log('Recipient email:', recipientEmail);
        console.log('====================');
        
        // Try Outlook Web
        this.tryOutlookWeb(this.currentSubject, this.currentBody, recipientEmail);
    }

    openInOutlookDesktop() {
        if (!this.currentSubject || !this.currentBody) {
            this.showStatus('No email generated yet.', 'error');
            return;
        }

        const recipientEmail = this.recipientEmailInput.value.trim();
        
        // Debug logging
        console.log('=== OUTLOOK DESKTOP DEBUG ===');
        console.log('Subject:', this.currentSubject);
        console.log('Body:', this.currentBody);
        console.log('Recipient email:', recipientEmail);
        console.log('====================');
        
        // Use mailto protocol for desktop Outlook
        this.fallbackToMailto(this.currentSubject, this.currentBody, recipientEmail);
    }

    tryOutlookWeb(subject, body, recipientEmail) {
        // Use Outlook Office 365 (work/school account) instead of Outlook Live (personal account)
        const toParam = recipientEmail ? `&to=${encodeURIComponent(recipientEmail)}` : '';
        const outlookWebUrl = `https://outlook.office.com/mail/deeplink/compose?${toParam}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Debug logging
        console.log('=== OUTLOOK OFFICE 365 URL DEBUG ===');
        console.log('Generated URL:', outlookWebUrl);
        console.log('Subject param:', encodeURIComponent(subject));
        console.log('Body param:', encodeURIComponent(body));
        console.log('========================');
        
        try {
            const outlookWindow = window.open(outlookWebUrl, '_blank');
            
            if (outlookWindow) {
                this.showStatus('Opening Outlook Office 365...', 'info');
                
                // Set a timeout to check if the page loaded
                setTimeout(() => {
                    try {
                        // If we can access the window, Outlook Web worked
                        if (!outlookWindow.closed) {
                            this.showStatus('Outlook Office 365 opened successfully!', 'success');
                        } else {
                            // Window was closed by user, don't fallback
                            this.showStatus('Outlook Office 365 window was closed.', 'info');
                        }
                    } catch (error) {
                        // Cross-origin error means Outlook Web opened successfully
                        // Don't fallback to mailto - Outlook Web is working
                        this.showStatus('Outlook Office 365 opened successfully!', 'success');
                    }
                }, 1000); // Reduced timeout to 1 second
            } else {
                // Popup was blocked, try mailto fallback
                this.fallbackToMailto(subject, body, recipientEmail);
            }
        } catch (error) {
            // Any other error, try mailto fallback
            this.fallbackToMailto(subject, body, recipientEmail);
        }
    }

    fallbackToMailto(subject, body, recipientEmail) {
        // Fallback to mailto protocol (works with Outlook desktop)
        const toParam = recipientEmail ? `to=${encodeURIComponent(recipientEmail)}&` : '';
        const mailtoUrl = `mailto:?${toParam}subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        try {
            window.open(mailtoUrl);
            this.showStatus('Opening Outlook desktop app...', 'info');
        } catch (error) {
            this.showStatus('Please copy the email and paste it into Outlook manually.', 'error');
        }
    }

    addAttachment() {
        // Create a hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                // Copy file path to clipboard
                const filePath = file.path || file.name;
                navigator.clipboard.writeText(filePath).then(() => {
                    this.showStatus(`File path copied: ${file.name}`, 'success');
                    
                    // Show instructions
                    setTimeout(() => {
                        this.showStatus('Paste the file path in Outlook\'s attachment field', 'info');
                    }, 2000);
                }).catch(() => {
                    // Fallback: show file info
                    this.showStatus(`Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'info');
                });
            }
        });
        
        // Trigger file selection
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }



    extractSubject(emailText) {
        // Look for "Subject:" at the beginning of lines
        const subjectMatch = emailText.match(/^Subject:\s*(.+)$/im);
        if (subjectMatch) {
            return subjectMatch[1].trim();
        }
        
        // Fallback: look for any line starting with "Subject:"
        const fallbackMatch = emailText.match(/Subject:\s*(.+)/i);
        if (fallbackMatch) {
            return fallbackMatch[1].trim();
        }
        
        return 'Internship Application';
    }

    extractBody(emailText) {
        // Remove the subject line and any leading/trailing whitespace
        let body = emailText;
        
        // Remove "Subject:" line (case insensitive, with or without leading/trailing whitespace)
        body = body.replace(/^Subject:\s*.+$/im, ''); // Remove subject line at start
        body = body.replace(/Subject:\s*.+/i, ''); // Remove any subject line
        
        // Clean up extra whitespace
        body = body.replace(/^\s*\n/, ''); // Remove leading newline after subject
        body = body.trim();
        
        return body;
    }

    clearAll() {
        this.jobPostingTextarea.value = '';
        this.recipientEmailInput.value = '';
        this.additionalContextTextarea.value = '';
        this.existingEmailTextarea.value = '';
        this.regenerateButton.disabled = true;
        this.currentSubject = null;
        this.currentBody = null;
        this.emailOutput.innerHTML = `
            <div class="placeholder">
                <p>Your personalized internship email will appear here...</p>
            </div>
        `;
        this.openOutlookWebButton.disabled = true;
        this.openOutlookDesktopButton.disabled = true;
        this.hideStatus();
    }



    setLoading(isLoading) {
        this.generateButton.disabled = isLoading;
        if (isLoading) {
            this.btnText.style.display = 'none';
            this.loadingSpinner.style.display = 'inline';
        } else {
            this.btnText.style.display = 'inline';
            this.loadingSpinner.style.display = 'none';
        }
    }

    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        this.statusMessage.style.display = 'block';
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => this.hideStatus(), 3000);
        }
    }

    hideStatus() {
        this.statusMessage.style.display = 'none';
    }

    showUpdateInfoModal() {
        this.loadPersonalInfo();
        this.mainContent.style.display = 'none';
        this.personalInfoContent.style.display = 'block';
    }

    showMainContent() {
        this.mainContent.style.display = 'block';
        this.personalInfoContent.style.display = 'none';
    }

    async loadPersonalInfo() {
        try {
            // Try to load from Chrome storage first
            const result = await chrome.storage.local.get(['personalInfo']);
            if (result.personalInfo) {
                this.populateForm(result.personalInfo);
                return;
            }

            // If not in storage, try to load from backend
            const response = await fetch(`${this.backendUrl}/personal-info`);
            if (response.ok) {
                const data = await response.json();
                this.populateForm(data);
            }
        } catch (error) {
            console.log('No existing personal info found, starting with empty form');
        }
    }

    populateForm(data) {
        // Basic fields
        document.getElementById('name').value = data.name || '';
        document.getElementById('university').value = data.university || '';
        document.getElementById('degree').value = data.degree || '';
        document.getElementById('skills').value = Array.isArray(data.skills) ? data.skills.join(', ') : '';
        document.getElementById('linkedin').value = data.linkedin || '';
        document.getElementById('github').value = data.github || '';
        document.getElementById('email').value = data.email || '';

        // Experience
        this.experienceContainer.innerHTML = '';
        if (data.experience && data.experience.length > 0) {
            data.experience.forEach(exp => {
                this.addExperienceItem(exp.role, exp.company, exp.summary);
            });
        } else {
            this.addExperienceItem(); // Add one empty item
        }

        // Projects
        this.projectsContainer.innerHTML = '';
        if (data.projects && data.projects.length > 0) {
            data.projects.forEach(proj => {
                this.addProjectItem(proj.name, proj.description);
            });
        } else {
            this.addProjectItem(); // Add one empty item
        }
    }

    addExperienceItem(role = '', company = '', summary = '') {
        const experienceItem = document.createElement('div');
        experienceItem.className = 'experience-item';
        experienceItem.innerHTML = `
            <div class="exp-fields">
                <div class="exp-field">
                    <label>Role/Position</label>
                    <input type="text" name="expRole[]" placeholder="e.g., Software Engineer Intern" class="exp-role" value="${role}">
                </div>
                <div class="exp-field">
                    <label>Company</label>
                    <input type="text" name="expCompany[]" placeholder="e.g., Google" class="exp-company" value="${company}">
                </div>
                <div class="exp-field">
                    <label>Summary</label>
                    <textarea name="expSummary[]" placeholder="Brief summary of your responsibilities and achievements" class="exp-summary" rows="3">${summary}</textarea>
                </div>
            </div>
            <button type="button" class="remove-exp-btn" onclick="this.parentElement.remove()">×</button>
        `;
        this.experienceContainer.appendChild(experienceItem);
    }

    addProjectItem(name = '', description = '') {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.innerHTML = `
            <div class="proj-fields">
                <div class="proj-field">
                    <label>Project Name</label>
                    <input type="text" name="projName[]" placeholder="e.g., E-commerce Platform" class="proj-name" value="${name}">
                </div>
                <div class="proj-field">
                    <label>Description</label>
                    <textarea name="projDesc[]" placeholder="Brief description of the project, technologies used, and your role" class="proj-desc" rows="3">${description}</textarea>
                </div>
            </div>
            <button type="button" class="remove-proj-btn" onclick="this.parentElement.remove()">×</button>
        `;
        this.projectsContainer.appendChild(projectItem);
    }

    async savePersonalInfo() {
        const formData = new FormData(this.personalInfoForm);
        
        // Collect basic info
        const personalInfo = {
            name: formData.get('name'),
            university: formData.get('university'),
            degree: formData.get('degree'),
            skills: formData.get('skills').split(',').map(skill => skill.trim()).filter(skill => skill),
            linkedin: formData.get('linkedin'),
            github: formData.get('github'),
            email: formData.get('email')
        };

        // Debug print
        console.log("🔍 DEBUG: Saving personal info:", personalInfo);

        // Collect experience
        const expRoles = formData.getAll('expRole[]');
        const expCompanies = formData.getAll('expCompany[]');
        const expSummaries = formData.getAll('expSummary[]');
        personalInfo.experience = [];
        for (let i = 0; i < expRoles.length; i++) {
            if (expRoles[i] && expCompanies[i]) {
                personalInfo.experience.push({
                    role: expRoles[i],
                    company: expCompanies[i],
                    summary: expSummaries[i] || ''
                });
            }
        }

        // Collect projects
        const projNames = formData.getAll('projName[]');
        const projDescs = formData.getAll('projDesc[]');
        personalInfo.projects = [];
        for (let i = 0; i < projNames.length; i++) {
            if (projNames[i] && projDescs[i]) {
                personalInfo.projects.push({
                    name: projNames[i],
                    description: projDescs[i]
                });
            }
        }

        try {
            // Save to Chrome storage
            console.log("💾 Saving to Chrome storage...");
            await chrome.storage.local.set({ personalInfo: personalInfo });
            console.log("✅ Saved to Chrome storage successfully");
            
            // Save to backend
            console.log("💾 Saving to backend...");
            const response = await fetch(`${this.backendUrl}/update-personal-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(personalInfo)
            });

            if (!response.ok) {
                throw new Error('Failed to save to backend');
            }
            console.log("✅ Saved to backend successfully");

            this.showStatus('Personal information saved successfully!', 'success');
            this.showMainContent();
        } catch (error) {
            console.error('Error saving personal info:', error);
            this.showStatus('Error saving personal information', 'error');
        }
    }
}

// Initialize the panel when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EmailGeneratorPanel();
}); 