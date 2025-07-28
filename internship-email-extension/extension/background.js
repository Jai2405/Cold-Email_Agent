// Background script for the internship email generator extension

// Handle extension icon click - open side panel
chrome.action.onClicked.addListener(async (tab) => {
    // Open the side panel
    await chrome.sidePanel.open({ windowId: tab.windowId });
    
    // Set the side panel to our extension
    await chrome.sidePanel.setOptions({
        path: 'panel.html',
        enabled: true
    });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractJobPosting') {
        // This could be used to extract job posting from the current page
        sendResponse({ success: true, text: request.text });
    }
});

// Initialize side panel when extension loads
chrome.runtime.onInstalled.addListener(() => {
    // Enable the side panel
    chrome.sidePanel.setOptions({
        path: 'panel.html',
        enabled: true
    });
}); 