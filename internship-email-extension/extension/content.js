// Content script for the internship email generator extension
class JobPostingExtractor {
    constructor() {
        this.backendUrl = 'http://localhost:8000';
        this.init();
    }

    init() {
        // Listen for messages from the extension
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'extractJobPosting') {
                const extractedText = this.extractJobPosting();
                sendResponse({ success: true, text: extractedText });
            }
        });
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
}

// Initialize the extractor when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new JobPostingExtractor();
    });
} else {
    new JobPostingExtractor();
} 