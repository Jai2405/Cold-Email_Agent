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
        this.emailOutput = document.getElementById('emailOutput');
        this.statusMessage = document.getElementById('statusMessage');
        this.btnText = this.generateButton.querySelector('.btn-text');
        this.loadingSpinner = this.generateButton.querySelector('.loading-spinner');
    }

    bindEvents() {
        this.generateButton.addEventListener('click', () => this.generateEmail());
        this.regenerateButton.addEventListener('click', () => this.generateEmail());
        this.clearButton.addEventListener('click', () => this.clearAll());
        this.openOutlookWebButton.addEventListener('click', () => this.openInOutlookWeb());
        this.openOutlookDesktopButton.addEventListener('click', () => this.openInOutlookDesktop());
        this.addAttachmentButton.addEventListener('click', () => this.addAttachment());
        
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
            const requestBody = { job_posting: jobPosting };
            if (additionalContext) {
                requestBody.additional_context = additionalContext;
            }
            if (existingEmail) {
                requestBody.existing_email = existingEmail;
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
}

// Initialize the panel when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EmailGeneratorPanel();
}); 