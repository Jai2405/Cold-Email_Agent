// Content script for the internship email generator extension
class JobPostingExtractor {
    constructor() {
        this.backendUrl = 'http://localhost:8000';
        this.init();
    }

    init() {
        // Add a floating button to extract job posting
        this.addExtractButton();
        
        // Listen for messages from the extension
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'extractJobPosting') {
                const extractedText = this.extractJobPosting();
                sendResponse({ success: true, text: extractedText });
            }
        });
    }

    addExtractButton() {
        // Create floating extract button
        const extractButton = document.createElement('div');
        extractButton.id = 'email-generator-extract-btn';
        extractButton.innerHTML = `
            <div class="extract-btn-content">
                <span>📧</span>
                <span class="extract-text">Extract Job Posting</span>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #email-generator-extract-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 16px;
                border-radius: 25px;
                cursor: pointer;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
            }
            
            #email-generator-extract-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            
            .extract-btn-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .extract-text {
                white-space: nowrap;
            }
            
            @media (max-width: 768px) {
                .extract-text {
                    display: none;
                }
                
                #email-generator-extract-btn {
                    padding: 12px;
                    border-radius: 50%;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(extractButton);
        
        // Add click handler
        extractButton.addEventListener('click', () => {
            this.handleExtractClick();
        });
    }

    handleExtractClick() {
        const jobPosting = this.extractJobPosting();
        
        if (jobPosting) {
            // Show success message
            this.showNotification('Job posting extracted! Click the extension icon to generate email.', 'success');
            
            // Store the extracted text for the panel to access
            chrome.storage.local.set({ 
                extractedJobPosting: jobPosting,
                extractionTime: new Date().toISOString()
            });
        } else {
            this.showNotification('No job posting found on this page. Please select the text manually.', 'error');
        }
    }

    extractJobPosting() {
        // Try different selectors for job posting content
        const selectors = [
            // LinkedIn
            '[data-job-description]',
            '.job-description',
            '.description__text',
            '.show-more-less-html__markup',
            
            // Indeed
            '[data-testid="jobDescriptionText"]',
            '.job-description',
            '#jobDescriptionText',
            
            // Glassdoor
            '.jobDescriptionContent',
            '.desc',
            
            // General
            '.job-description',
            '.job-details',
            '.description',
            '[class*="description"]',
            '[class*="job"]',
            '[class*="posting"]'
        ];

        let extractedText = '';

        // Try each selector
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                const text = element.textContent?.trim();
                if (text && text.length > 100) { // Minimum length to be considered a job posting
                    extractedText = text;
                    break;
                }
            }
            if (extractedText) break;
        }

        // If no specific job posting found, try to get selected text
        if (!extractedText) {
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 50) {
                extractedText = selection.toString().trim();
            }
        }

        // If still no text, try to get the main content area
        if (!extractedText) {
            const mainContent = document.querySelector('main, [role="main"], .main, #main');
            if (mainContent) {
                const text = mainContent.textContent?.trim();
                if (text && text.length > 200) {
                    // Clean up the text
                    extractedText = this.cleanText(text);
                }
            }
        }

        return extractedText;
    }

    cleanText(text) {
        return text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
            .trim();
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.getElementById('email-generator-notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.id = 'email-generator-notification';
        notification.textContent = message;
        notification.className = `email-generator-notification ${type}`;
        
        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
            .email-generator-notification {
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 8px;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
                z-index: 10001;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease;
            }
            
            .email-generator-notification.success {
                background: #28a745;
            }
            
            .email-generator-notification.error {
                background: #dc3545;
            }
            
            .email-generator-notification.info {
                background: #17a2b8;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize the extractor when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new JobPostingExtractor();
    });
} else {
    new JobPostingExtractor();
} 