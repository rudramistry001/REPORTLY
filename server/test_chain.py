import os
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain.chains import LLMChain

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API key from environment
api_key = os.getenv("GOOGLE_API_KEY", "")
if not api_key:
    api_key = input("Enter your Google API key: ")
    os.environ["GOOGLE_API_KEY"] = api_key

logger.info("Starting LangChain test script")

# Initialize the model
try:
    llm = ChatGoogleGenerativeAI(
        model="gemini-pro",  # Try a reliable model first
        temperature=0.7,
        google_api_key=api_key
    )
    logger.info("Model initialized")
except Exception as e:
    logger.error(f"Error initializing model: {str(e)}")
    exit(1)

# Create a simple test prompt
template_str = """
You are an expert project assistant. The project is described as: "{brief}"

Provide a concise explanation for the following project topics:
{formatted_topics}

FORMAT REQUIREMENTS: 
- Format each topic with the number and name as a header (e.g., "1. Introduction")
- Use clear paragraphs with line breaks between them
"""

# Test data
brief = "JEWEL ASSIST is a CRM system for jewelry businesses"
formatted_topics = "1. INTRODUCTION - An overview of the system\n2. TECH STACK - Technologies used"

# Test different prompt template methods
logger.info("Testing prompt methods:")

try:
    # Method 1: ChatPromptTemplate
    logger.info("Testing ChatPromptTemplate")
    chat_prompt = ChatPromptTemplate.from_template(template_str)
    logger.info("ChatPromptTemplate created")
    
    # Method 2: PromptTemplate
    logger.info("Testing PromptTemplate")
    prompt_template = PromptTemplate(
        input_variables=["brief", "formatted_topics"],
        template=template_str
    )
    logger.info("PromptTemplate created")
except Exception as e:
    logger.error(f"Error creating prompts: {str(e)}")

# Test running chains
test_chains = []

try:
    # Test chain with ChatPromptTemplate
    logger.info("Creating chain with ChatPromptTemplate")
    chat_chain = LLMChain(llm=llm, prompt=chat_prompt)
    test_chains.append(("ChatPromptTemplate chain", chat_chain))
    
    # Test chain with PromptTemplate
    logger.info("Creating chain with PromptTemplate")
    prompt_chain = LLMChain(llm=llm, prompt=prompt_template)
    test_chains.append(("PromptTemplate chain", prompt_chain))
except Exception as e:
    logger.error(f"Error creating chains: {str(e)}")

# Test all methods
for chain_name, chain in test_chains:
    logger.info(f"\n==== Testing {chain_name} ====")
    
    # Method 1: Run with dictionary
    try:
        logger.info("Method 1: Run with dictionary")
        run_params = {"brief": brief, "formatted_topics": formatted_topics}
        result1 = chain.run(run_params)
        logger.info("Method 1 successful!")
        logger.info(f"Result: {result1[:100]}...")
    except Exception as e:
        logger.error(f"Method 1 failed: {str(e)}")
    
    # Method 2: Run with kwargs
    try:
        logger.info("Method 2: Run with kwargs")
        result2 = chain.run(brief=brief, formatted_topics=formatted_topics)
        logger.info("Method 2 successful!")
        logger.info(f"Result: {result2[:100]}...")
    except Exception as e:
        logger.error(f"Method 2 failed: {str(e)}")
    
    # Method 3: Invoke
    try:
        logger.info("Method 3: chain.invoke")
        result3 = chain.invoke({"brief": brief, "formatted_topics": formatted_topics})
        if hasattr(result3, "content"):
            result3 = result3.content
        elif isinstance(result3, dict) and "text" in result3:
            result3 = result3["text"]
        logger.info("Method 3 successful!")
        logger.info(f"Result: {result3[:100]}...")
    except Exception as e:
        logger.error(f"Method 3 failed: {str(e)}")
    
    # Method 4: Format prompt and pass to LLM
    try:
        logger.info("Method 4: Direct prompt to LLM")
        formatted_prompt = chain.prompt.format_prompt(brief=brief, formatted_topics=formatted_topics)
        result4 = llm.invoke(formatted_prompt.to_string()).content
        logger.info("Method 4 successful!")
        logger.info(f"Result: {result4[:100]}...")
    except Exception as e:
        logger.error(f"Method 4 failed: {str(e)}")

logger.info("Test script completed") 