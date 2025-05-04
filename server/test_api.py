import requests
import json
import sys

# API endpoints
BASE_URL = "http://localhost:8000"
TEST_ENDPOINT = f"{BASE_URL}/test"
ECHO_ENDPOINT = f"{BASE_URL}/echo"
GENERATE_ENDPOINT = f"{BASE_URL}/generate-details"
MANUAL_ENDPOINT = f"{BASE_URL}/manual-generate"

# Test data
test_data = {
    "brief": "JEWEL ASSIST is a CRM system for jewelry businesses",
    "topics": ["INTRODUCTION", "TECH STACK"],
    "topic_descriptions": {
        "INTRODUCTION": "It is a CRM created using Node.js",
        "TECH STACK": "It uses Provider for state management in Flutter and Express and MongoDB in backend"
    },
    "content_length": "short"  # Use short for faster testing
}

def print_divider():
    print("=" * 70)

def test_server_running():
    """Test if the server is running and accessible"""
    print("Testing server availability...")
    try:
        response = requests.get(TEST_ENDPOINT)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Server is running: {data['message']}")
            print(f"   API Key configured: {data['api_key_configured']}")
            print(f"   Model initialized: {data['model_initialized']}")
            return True
        else:
            print(f"❌ Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is it running?")
        return False

def test_echo_endpoint():
    """Test the echo endpoint"""
    print_divider()
    print("Testing /echo endpoint...")
    try:
        response = requests.post(ECHO_ENDPOINT, json=test_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Echo endpoint working")
            print(f"   Received back: {json.dumps(data, indent=2)[:100]}...")
            return True
        else:
            print(f"❌ Echo endpoint failed with status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing echo endpoint: {str(e)}")
        return False

def test_generate_endpoint():
    """Test the generate-details endpoint"""
    print_divider()
    print("Testing /generate-details endpoint...")
    try:
        response = requests.post(GENERATE_ENDPOINT, json=test_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Generate endpoint working")
            print(f"   Response preview: {data['response'][:100]}...")
            return True
        else:
            print(f"❌ Generate endpoint failed with status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing generate endpoint: {str(e)}")
        return False

def test_manual_endpoint():
    """Test the manual-generate endpoint"""
    print_divider()
    print("Testing /manual-generate endpoint...")
    try:
        response = requests.post(MANUAL_ENDPOINT, json=test_data)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Manual generate endpoint working")
            print(f"   Response preview: {data['response'][:100]}...")
            return True
        else:
            print(f"❌ Manual generate endpoint failed with status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing manual endpoint: {str(e)}")
        return False

def run_all_tests():
    """Run all tests"""
    print_divider()
    print("REPORTLY API TEST SCRIPT")
    print_divider()
    
    # Test server running
    if not test_server_running():
        print("❌ Server test failed. Cannot continue.")
        return False
    
    # Test endpoints
    echo_result = test_echo_endpoint()
    generate_result = test_generate_endpoint()
    manual_result = test_manual_endpoint()
    
    # Print summary
    print_divider()
    print("TEST SUMMARY")
    print_divider()
    print(f"Server running: {'✅' if True else '❌'}")
    print(f"Echo endpoint: {'✅' if echo_result else '❌'}")
    print(f"Generate endpoint: {'✅' if generate_result else '❌'}")
    print(f"Manual endpoint: {'✅' if manual_result else '❌'}")
    
    return echo_result and (generate_result or manual_result)

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1) 