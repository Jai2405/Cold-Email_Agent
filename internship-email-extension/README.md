# Internship Cold Email Generator Extension

A Chrome extension that generates personalized internship cold emails from job postings using the same agent logic as your `main.ipynb`.

## Features

- 🎯 **One-click email generation** from job posting websites
- 📝 **Personalized emails** using your background and skills
- 🤖 **Same agent logic** as your main.ipynb notebook
- 🎨 **Beautiful UI** with modern design
- 📋 **Copy to clipboard** functionality
- 💾 **Auto-save** job postings
- 🌐 **Works on** LinkedIn, Indeed, Glassdoor, and more

## Project Structure

```
internship-email-extension/
├── extension/              # Chrome Extension Files (Frontend)
│   ├── manifest.json      # Extension configuration
│   ├── popup.html         # Extension popup interface
│   ├── popup.js           # Popup functionality
│   ├── content.js         # Content script for job sites
│   ├── background.js      # Background service worker
│   └── styles.css         # Extension styling
├── backend/               # Python API Server (Backend)
│   ├── server.py          # Flask API server with agent logic
│   └── requirements.txt   # Python dependencies
└── README.md             # This file
```

## Setup Instructions

### 1. Set up the Backend (API Server)

```bash
cd internship-email-extension/backend
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Start the API server:

```bash
python server.py
```

The server will run on `http://localhost:8000` and uses the same agent logic as your `main.ipynb`.

### 2. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `internship-email-extension/extension` folder
5. The extension should now appear in your extensions list

### 3. Update Personal Information

Edit `backend/server.py` and update the `personal_info` object with your details:

```python
personal_info = {
    "name": "Your Name",
    "university": "Your University",
    "major": "Your Major",
    # ... update all fields
}
```

## Usage

### Method 1: Manual Input
1. Click the extension icon in Chrome
2. Paste a job posting into the text area
3. Click "Generate Email"
4. Copy the generated email

### Method 2: Auto-Extraction (LinkedIn, Indeed, Glassdoor)
1. Go to a job posting page
2. Look for the "📧 Generate Email" button (top right)
3. Click it to automatically extract the job posting
4. The extension popup will open with the extracted text
5. Click "Generate Email"

## How It Works

1. **Extension** sends job posting to the **server**
2. **Server** uses the same agent logic as your `main.ipynb`:
   - Creates the `email_agent` with your instructions
   - Formats your personal info
   - Generates the email using `Runner.run()`
   - Returns the email to the extension
3. **Extension** displays the email for you to copy

## API Endpoints

- `POST /generate-email` - Generate email from job posting
- `GET /health` - Check server status
- `GET /personal-info` - View current personal info

## Deployment Options

### Option 1: Local Development (Current Setup)
- **Extension**: Load as "unpacked extension" in Chrome
- **Backend**: Run locally on your computer
- **Pros**: Easy to test and modify, uses your exact agent logic
- **Cons**: Server must be running on your computer

### Option 2: Hosted Backend
- **Extension**: Upload to Chrome Web Store
- **Backend**: Deploy to cloud (Heroku, AWS, etc.)
- **Pros**: Works anywhere, no local server needed
- **Cons**: More complex setup, costs money

### Option 3: All-in-One Extension (No Backend)
- Put OpenAI API key directly in extension
- **Pros**: Simple deployment
- **Cons**: Security risk (API key exposed), can't use agent logic

## Customization

### Modifying Email Style

Edit the `instructions` in `backend/server.py` to change the email tone, length, or style:

```python
instructions = """
You are a skilled internship cold email writer. Your role is to:
# ... modify your instructions here
"""
```

### Adding More Job Sites

Edit `extension/content.js` and add new selectors for job posting extraction:

```javascript
else if (window.location.hostname.includes('newsite.com')) {
    const jobDescription = document.querySelector('.job-description-selector');
    if (jobDescription) {
        jobText = jobDescription.textContent.trim();
    }
}
```

## Troubleshooting

### Extension not working?
- Make sure the API server is running on `http://localhost:8000`
- Check that your OpenAI API key is set correctly
- Verify the extension is loaded in Chrome

### Can't extract job posting?
- Some job sites may have different selectors
- Try copying and pasting manually
- Check the browser console for errors

### API errors?
- Verify your OpenAI API key is valid
- Check that you have sufficient API credits
- Look at the server logs for detailed error messages
- Check traces at https://platform.openai.com/traces

## Security Notes

- Your OpenAI API key is stored locally in the `.env` file
- Job postings are sent to OpenAI for processing
- No data is stored permanently on external servers
- The server uses the same secure agent logic as your notebook

## License

This project is for educational purposes. Use responsibly and in accordance with OpenAI's terms of service. 