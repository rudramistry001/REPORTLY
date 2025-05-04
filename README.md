# REPORTLY - Smart Report Generator

REPORTLY is an AI-powered report generator that creates professional reports based on your project details using Gemini AI and LangChain.

## Features

- **AI-Generated Content**: Automatically generates comprehensive report content based on your project brief and topics.
- **Multiple Content Lengths**: Choose between short (150-200 words), moderate (300-500 words), or long (800-1000+ words) content per topic.
- **Extensive Customization Options**:
  - Typography: Font family, size, line height
  - Colors: Customize heading, body text, accent, and background colors
  - Layout: Text alignment, margins, paragraph spacing, text indentation
  - Style: Heading styles, list styles, section borders and backgrounds
- **Live Preview**: Real-time preview of your styling changes
- **Export Options**: Download as HTML or PDF

## Getting Started

### Prerequisites

- Node.js (for serving the frontend)
- Python 3.8+ with pip (for the backend)
- Google Gemini API key

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install the required Python packages:
   ```
   pip install fastapi uvicorn langchain langchain-google-genai
   ```

3. Set your Google Gemini API key:
   - Edit `run_server.bat` (Windows) or create a shell script for Mac/Linux
   - Replace the existing API key with your own

4. Start the server:
   - On Windows, run `run_server.bat`
   - On Mac/Linux, run `python langchain_server.py` (after setting the GOOGLE_API_KEY environment variable)

   > **Important**: The server runs on port 8000 by default. The frontend is configured to connect to `http://localhost:8000/generate-details` as the API endpoint. If you change the port in the server, you must update the `API_URL` in `script.js` to match.

### Frontend Setup

1. Simply open `index.html` in your browser, or use a simple HTTP server.

2. For example, with Python:
   ```
   python -m http.server
   ```
   Then visit http://localhost:8000 in your browser.

## How It Works

1. **Enter Project Details**: Provide your project title, brief, and main topics
2. **Customize Styling**: Choose from various styling options to create a professional-looking report
3. **Generate Report**: The AI will analyze your input and generate detailed content for each section
4. **Download or Save**: Export your report as HTML or PDF

## New Features in the Enhanced Version

- **Improved Content Generation**: Fixed long content generation to ensure reports are properly detailed
- **Bootstrap Integration**: Modern UI elements and responsive design
- **Enhanced Customization**:
  - Text indentation options
  - Paragraph spacing control
  - Additional heading styles (UPPERCASE, Capitalize, Underlined)
  - Various list style options
  - Section border and background options
- **Real-time Live Preview**: All style changes instantly reflect in both the preview and generated report
- **Progress Indicators**: Visual feedback during report generation

## Troubleshooting

- If the server fails to start, ensure your API key is set correctly
- If reports are not generating, check your server console for errors
- Make sure you have an active internet connection for the AI service to work

### API Endpoint Configuration
The frontend is configured to communicate with the backend at `http://localhost:8000/generate-details`. If you're experiencing connection issues:

1. Verify the server is running on port 8000 (check the console output when starting the server)
2. Ensure you're using the correct endpoint path `/generate-details` 
3. If you need to change the port or endpoint:
4. 
 - Update the `API_URL` variable in `script.js` to match your server configuration
   - Example: `const API_URL = 'http://localhost:YOUR_PORT/YOUR_ENDPOINT';`


![image](https://github.com/user-attachments/assets/7282cbf6-0734-48f6-a8b1-d5a0216fbc11)
![image](https://github.com/user-attachments/assets/f11d1952-8842-484c-9d23-b41847d3e3fa)
![image](https://github.com/user-attachments/assets/6fc014e9-4af1-415c-b39e-307e60535f6b)
![image](https://github.com/user-attachments/assets/395ad373-ae0b-44c3-ae0f-c24efaf36f79)


## License

This project is licensed under the MIT License - see the LICENSE file for details. 
