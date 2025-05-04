# REPORTLY Server

This directory contains the backend server for the REPORTLY application, which generates intelligent report content using AI.

## Key Files

- `langchain_server.py` - Primary server implementation using LangChain and Gemini AI
- `run_server.bat` - Script to run the server

## API Endpoints

### GET /test

Simple test endpoint to verify the server is running correctly.

#### Response

```json
{
  "status": "ok",
  "message": "REPORTLY API is running",
  "api_key_configured": true,
  "model_initialized": true
}
```

### POST /echo

Debug endpoint that echoes back the request payload.

### POST /generate-details

This is the main endpoint for generating report content.

#### Request Body

```json
{
  "brief": "Your project description",
  "topics": ["Topic1", "Topic2", "Topic3"],
  "topic_descriptions": {
    "Topic1": "Description for topic 1",
    "Topic2": "Description for topic 2",
    "Topic3": "Description for topic 3"
  },
  "content_length": "short|moderate|long"
}
```

- `brief`: (Required) A description of the project
- `topics`: (Required) Array of topic names
- `topic_descriptions`: (Optional) Object mapping topic names to descriptions
- `content_length`: (Optional) One of "short", "moderate", or "long" (default: "moderate")

#### Response

```json
{
  "response": "Generated content with topics formatted as headers"
}
```

### POST /manual-generate

Fallback endpoint with enhanced error handling for generating report content. 
Uses the same request and response format as `/generate-details`.

## Running the Server

### Prerequisites

- Python 3.8+
- Required packages: fastapi, uvicorn, langchain, langchain-google-genai
- Google API key for Gemini AI

### Setup

1. Install required packages:
   ```
   pip install fastapi uvicorn langchain langchain-google-genai
   ```

2. Set your Google API key:
   - Edit `run_server.bat` and replace `your-api-key-here` with your own Gemini API key
   - Or set the environment variable: `GOOGLE_API_KEY=your-api-key`

### Start the Server

#### Windows

Run the batch file:
```
run_server.bat
```

#### Linux/macOS

```bash
export GOOGLE_API_KEY=your-api-key
python langchain_server.py
```

## Server Configuration

The server is configured to run on port 8000 by default. The frontend application is already configured to connect to this endpoint.

### Troubleshooting

If you encounter server errors:

1. Verify your API key is correctly set in `run_server.bat` or as an environment variable
2. Check that all required packages are installed
3. Test basic connectivity using the `/test` endpoint: `http://localhost:8000/test`
4. Look for detailed error messages in the server console output