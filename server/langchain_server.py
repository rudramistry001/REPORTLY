from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from enum import Enum
from typing import List, Optional, Dict
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
import uvicorn
import os
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API key from environment
api_key = os.getenv("GOOGLE_API_KEY", "")
if not api_key:
    logger.error("GOOGLE_API_KEY environment variable is not set")
    # Don't raise an exception here - it will prevent server from starting
    logger.warning("Server will start, but AI generation will not work until API key is provided")
    logger.warning("Set the GOOGLE_API_KEY environment variable or update run_server.bat")
else:
    logger.info("API key loaded successfully")

# Define FastAPI app
app = FastAPI(
    title="REPORTLY API",
    description="API for generating report content using AI",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Content length enum
class ContentLength(str, Enum):
    SHORT = "short"
    MODERATE = "moderate"
    LONG = "long"

# Request and response models
class ProjectInput(BaseModel):
    brief: str
    topics: List[str]
    topic_descriptions: Optional[Dict[str, str]] = None
    content_length: Optional[ContentLength] = ContentLength.MODERATE

class ProjectResponse(BaseModel):
    response: str

# Echo endpoint for debugging
@app.post("/echo")
async def echo_request(data: ProjectInput):
    """Echo back the request for debugging"""
    return {"received": data}

# Add test endpoint
@app.get("/test")
async def test_api():
    """Simple test endpoint to verify the API is running"""
    return {
        "status": "ok", 
        "message": "REPORTLY API is running", 
        "api_key_configured": bool(api_key), 
        "model_initialized": bool(llm)
    }

# Get prompt template based on content length
def get_prompt_template(content_length):
    """Get the appropriate prompt template based on content length"""
    base_template = """
You are an expert project assistant. The project is described as: "{brief}"

Provide {detail_level} for the following project topics:
{formatted_topics}

{instruction}

FORMAT REQUIREMENTS: 
- Format each topic with the number and name as a header (e.g., "1. Introduction")
- Use clear paragraphs with line breaks between them
- Include bullet points where appropriate
- Each topic should be well-structured and comprehensive
"""
    
    if content_length == ContentLength.SHORT:
        template_str = base_template.format(
            detail_level="a concise, brief explanation",
            formatted_topics="{formatted_topics}",
            instruction="Give a short explanation (1-2 paragraphs, about 150-200 words MAXIMUM) for each topic, tailored to the project brief. Be extremely concise while still being accurate and helpful."
        )
    elif content_length == ContentLength.MODERATE:
        template_str = base_template.format(
            detail_level="a moderately detailed explanation",
            formatted_topics="{formatted_topics}",
            instruction="Give a detailed explanation for each topic, tailored to the project brief. Each topic should have 2-4 paragraphs (approximately 300-500 words total). Include specific details relevant to the project brief and cover key points thoroughly."
        )
    else:  # ContentLength.LONG
        template_str = base_template.format(
            detail_level="an extensive, in-depth explanation",
            formatted_topics="{formatted_topics}",
            instruction="Give a comprehensive explanation for each topic, tailored to the project brief. Each topic should have at least 5-8 paragraphs (minimum 800-1000 words total). Be extremely thorough and cover all important aspects of each topic in depth. Include specific examples, detailed explanations, best practices, and implementation considerations. Provide substantive content that would be suitable for a detailed professional report."
        )
    
    try:
        # Try creating prompt using newer LangChain format
        return ChatPromptTemplate.from_template(template_str)
    except Exception as e:
        logger.warning(f"Error creating ChatPromptTemplate: {str(e)}")
        # Fallback to simpler prompt template (for older LangChain versions)
        from langchain.prompts import PromptTemplate
        return PromptTemplate(
            input_variables=["brief", "formatted_topics"],
            template=template_str
        )

# Format topics with descriptions
def format_topics(topics, topic_descriptions):
    """Format topics with their descriptions if available"""
    formatted_topics = []
    
    for i, topic in enumerate(topics):
        topic_entry = f"{i+1}. {topic}"
        
        # Add description if available
        if topic_descriptions:
            # Try by exact topic name
            if topic in topic_descriptions:
                description = topic_descriptions[topic]
                topic_entry += f" - {description}"
            # Try by "Topic X" format (1-indexed)
            elif f"Topic {i+1}" in topic_descriptions:
                description = topic_descriptions[f"Topic {i+1}"]
                topic_entry += f" - {description}"
        
        formatted_topics.append(topic_entry)
    
    return "\n".join(formatted_topics)

# Initialize Gemini model
llm = None
try:
    if api_key:
        # Try to get model information
        logger.info("Attempting to initialize Gemini model")
        
        # Set options with error handling - start with base options
        options = {
            "google_api_key": api_key,  # Use the API key from environment
            "temperature": 0.7,         # Good balance between creativity and consistency
            "top_p": 0.95,              # Allow some variability but keep reasonably focused
            "max_output_tokens": 2048,  # Ensure we can get a decent length response
        }
        
        # Try models in order of preference
        models_to_try = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"]
        
        for model_name in models_to_try:
            try:
                options["model"] = model_name
                logger.info(f"Trying to initialize model: {model_name}")
                
                # Try to create the model
                llm = ChatGoogleGenerativeAI(**options)
                
                # Test the model with a simple prompt - use consistent format
                test_prompt = "Hello, are you working? Please respond with 'Yes, I am working.'"
                test_messages = [{"role": "user", "content": test_prompt}]
                
                try:
                    # First try with messages format
                    test_response = llm.invoke(test_messages)
                    logger.info(f"Model {model_name} tested successfully with messages format")
                except Exception as e1:
                    logger.warning(f"Message format test failed: {str(e1)}, trying direct string")
                    # Fall back to direct string
                    test_response = llm.invoke(test_prompt)
                    logger.info(f"Model {model_name} tested successfully with string format")
                
                logger.info(f"Model {model_name} initialized successfully")
                break  # Successfully initialized the model
            except Exception as model_error:
                logger.warning(f"Failed to initialize {model_name}: {str(model_error)}")
                continue
        
        if llm is None:
            logger.error("All model initialization attempts failed")
    else:
        logger.warning("Skipping model initialization due to missing API key")
except Exception as e:
    logger.error(f"Error initializing Gemini model: {str(e)}")
    # Don't reraise - let the server start without a model, endpoints will check for it

# Main endpoint to generate project details
@app.post("/generate-details", response_model=ProjectResponse)
async def generate_project(data: ProjectInput):
    """Generate project details based on input"""
    try:
        logger.info(f"Received request: brief={data.brief}, topics={data.topics}, content_length={data.content_length}")
        
        # Check if API key is configured
        if not api_key:
            raise ValueError("API key is not configured. Set the GOOGLE_API_KEY environment variable.")
            
        # Check if model is initialized
        if not llm:
            raise ValueError("AI model is not initialized. Check server logs for details.")
        
        # Ensure brief is not empty
        if not data.brief or data.brief.strip() == "":
            raise ValueError("Project brief cannot be empty")
            
        # Ensure topics are not empty
        if not data.topics or len(data.topics) == 0:
            raise ValueError("Topics list cannot be empty")
        
        # Format topics with descriptions
        formatted_topics = format_topics(data.topics, data.topic_descriptions)
        logger.info(f"Formatted topics: {formatted_topics}")
        
        # Create the prompt directly - avoid using template to prevent errors
        logger.info("Using direct prompt approach")
        brief_text = data.brief.strip()
        
        prompt_text = f"""
You are an expert project assistant. The project is described as: "{brief_text}"

Provide detailed analysis for the following project topics:
{formatted_topics}

FORMAT REQUIREMENTS: 
- Format each topic with the number and name as a header (e.g., "1. Introduction")
- Use clear paragraphs with line breaks between them
- Include bullet points where appropriate
- Each topic should be well-structured and comprehensive
"""
        
        # Get response directly from the model
        try:
            logger.info("Sending prompt directly to model")
            
            # Convert to simple message format
            messages = [{"role": "user", "content": prompt_text}]
            
            # Try with simpler input format
            try:
                model_response = llm.invoke(messages)
                logger.info("Successfully invoked model with messages format")
            except Exception as e1:
                logger.warning(f"Failed with messages format: {str(e1)}, trying direct string")
                model_response = llm.invoke(prompt_text)
                logger.info("Successfully invoked model with direct string")
            
            # Handle different response formats
            if hasattr(model_response, "content"):
                response = model_response.content
            elif isinstance(model_response, dict) and "content" in model_response:
                response = model_response["content"]
            elif isinstance(model_response, dict) and "text" in model_response:
                response = model_response["text"] 
            elif isinstance(model_response, str):
                response = model_response
            else:
                # Last resort, convert to string
                response = str(model_response)
                
            if not response or response.strip() == "":
                raise ValueError("Empty response from model")
                
            logger.info("Successfully received response from model")
        except Exception as e:
            logger.error(f"Error invoking model: {str(e)}")
            raise ValueError(f"Error generating content: {str(e)}")
        
        logger.info("Successfully generated content")
        return {"response": response}
    
    except Exception as e:
        error_message = f"Error generating response: {str(e)}"
        logger.error(error_message)
        # Log request details for debugging
        try:
            logger.error(f"Request data: {data.dict()}")
        except Exception:
            logger.error("Could not log request data")
        raise HTTPException(status_code=500, detail=error_message)

# Manual parsing endpoint (backup for troubleshooting)
@app.post("/manual-generate")
async def manual_generate(request: Request):
    """Manually parse the request and generate content"""
    try:
        # Get request body
        body = await request.body()
        logger.info(f"Received raw request body: {body.decode('utf-8')}")
        
        try:
            data = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
            logger.error(f"Raw request body: {body.decode('utf-8')}")
            raise HTTPException(status_code=400, detail=f"Invalid JSON in request body: {str(e)}")
        
        logger.info(f"Parsed request data: {data}")
        
        # Validate required fields
        if "brief" not in data or not data["brief"] or data["brief"].strip() == "":
            raise HTTPException(status_code=400, detail="Missing or empty required field: 'brief'")
        if "topics" not in data or not data["topics"] or len(data["topics"]) == 0:
            raise HTTPException(status_code=400, detail="Missing or empty required field: 'topics'")
        
        # Check if API key is configured
        if not api_key:
            raise ValueError("API key is not configured. Set the GOOGLE_API_KEY environment variable.")
            
        # Check if model is initialized
        if not llm:
            raise ValueError("AI model is not initialized. Check server logs for details.")
        
        # Get values with defaults
        brief = data["brief"].strip()
        topics = data["topics"]
        topic_descriptions = data.get("topic_descriptions", None)
        content_length_str = data.get("content_length", "moderate")
        
        # Validate content length
        if content_length_str not in ["short", "moderate", "long"]:
            logger.warning(f"Invalid content_length: {content_length_str}. Using 'moderate' instead.")
            content_length_str = "moderate"
        
        # Format topics
        formatted_topics = format_topics(topics, topic_descriptions)
        logger.info(f"Formatted topics: {formatted_topics}")
        
        # Create prompt based on content length
        detail_level = "a concise explanation"
        if content_length_str == "moderate":
            detail_level = "a detailed explanation"
        elif content_length_str == "long":
            detail_level = "a comprehensive explanation"
        
        prompt_text = f"""
You are an expert project assistant. The project is described as: "{brief}"

Provide {detail_level} for the following project topics:
{formatted_topics}

FORMAT REQUIREMENTS: 
- Format each topic with the number and name as a header (e.g., "1. Introduction")
- Use clear paragraphs with line breaks between them
- Include bullet points where appropriate
- Each topic should be well-structured and comprehensive
"""
        
        # Get response directly from the model
        try:
            logger.info("Manual: Sending prompt directly to model")
            
            # Convert to simple message format
            messages = [{"role": "user", "content": prompt_text}]
            
            # Try with simpler input format
            try:
                model_response = llm.invoke(messages)
                logger.info("Successfully invoked model with messages format")
            except Exception as e1:
                logger.warning(f"Failed with messages format: {str(e1)}, trying direct string")
                model_response = llm.invoke(prompt_text)
                logger.info("Successfully invoked model with direct string")
            
            # Handle different response formats
            if hasattr(model_response, "content"):
                response = model_response.content
            elif isinstance(model_response, dict) and "content" in model_response:
                response = model_response["content"]
            elif isinstance(model_response, dict) and "text" in model_response:
                response = model_response["text"]
            elif isinstance(model_response, str):
                response = model_response
            else:
                # Last resort, convert to string
                response = str(model_response)
                
            if not response or response.strip() == "":
                raise ValueError("Empty response from model")
                
            logger.info("Manual: Successfully received response")
        except Exception as e:
            logger.error(f"Manual: Error invoking model: {str(e)}")
            raise ValueError(f"Error generating content: {str(e)}")
        
        logger.info("Successfully generated content")
        return {"response": response}
    
    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise
    except Exception as e:
        error_message = f"Error in manual generation: {str(e)}"
        logger.error(error_message)
        raise HTTPException(status_code=500, detail=error_message)

# Run the server
if __name__ == "__main__":
    uvicorn.run("langchain_server:app", host="0.0.0.0", port=8000, reload=True)
