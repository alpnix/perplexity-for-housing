import requests
import json
from pinecone import Pinecone
import pydantic
from typing import Optional
import os
import time
from dotenv import load_dotenv

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Get input from the user
MODE = "production"
QUERY = "Find me a house in San Francisco for less than $2000 and with 2 beds"
LIMIT = 10

class QueryParse(pydantic.BaseModel):
    semantic_query: str
    city: Optional[str] = None

query_schema = QueryParse.model_json_schema()

# Format the query with a language model
API_KEY = os.getenv("BEDROCK_API_KEY")
REGION = "us-east-1"
MODEL_ID = "us.anthropic.claude-3-5-haiku-20241022-v1:0"

url = f"https://bedrock-runtime.{REGION}.amazonaws.com/model/{MODEL_ID}/invoke"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

payload = {
    "anthropic_version": "bedrock-2023-05-31",
    "system": "You are a helpful real estate assistant. You need to parse the user input into meaningful data points",
    "max_tokens": 1024,
    "tools": [
        {
            "name": "query_parser",
            "description": "Extracts search intent and city from a user query.",
            "input_schema": query_schema 
        }
    ],
    "tool_choice": {"type": "tool", "name": "query_parser"}, # Forces the model to use this tool
    "messages": [
        {
            "role": "user", 
            "content": QUERY
        }
    ]
}

thinking_start = time.time()
print("Thinking...")
print()

response = requests.post(url, headers=headers, json=payload)
res_json = response.json()

parsed_query = res_json["content"][0]["input"]
semantic_query = parsed_query.get("semantic_query", QUERY)
parsed_city = parsed_query.get("city", None)

search_start = time.time()
print("Thought for " + str(time.time() - thinking_start) + " seconds")
print("Understood user query: " + semantic_query)
print("Searching for houses in the database...")
print()

index_name = "truila-houses"
index_host = pc.describe_index(index_name).host
index = pc.Index(host=index_host)

EMBED_MODEL = "llama-text-embed-v2"
embed_res = pc.inference.embed(
    model=EMBED_MODEL,
    inputs=[semantic_query],
    parameters={"input_type": "query"},
)

try: 
    vector = embed_res.data[0].values
except Exception as e:
    print("Failed to embed query (no embedding returned).")
    print(e)
    exit()

query_filter = {"city": {"$eq": parsed_city}} if parsed_city else None
results = index.query(
    namespace="properties",
    vector=vector,
    top_k=LIMIT,
    include_metadata=True,
    filter=query_filter,
)

return_houses = []
matches = getattr(results, "matches", None) or (results.get("matches") if isinstance(results, dict) else None) or []
for m in matches:
    md = getattr(m, "metadata", None) or (m.get("metadata") if isinstance(m, dict) else None) or {}
    return_houses.append(md)

print("Searched for " + str(time.time() - search_start) + " seconds")
print("Found " + str(len(results.matches)) + " houses from the database")
for house in return_houses:
    print(house)
    print()

if MODE == "test": 
    print()
    print("Chat with your results..")
    messages = []

    while True: 
        user_input = input("User: ")
        messages.append({
            "role": "user", 
            "content": user_input
        })
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "system": "You are a helpful real estate assistant. This is the list of that the user got: " + json.dumps(return_houses) + ". The user is asking you a question about the houses. Answer the question based on the list of houses.",
            "max_tokens": 256,
            "messages": messages
        }

        response = requests.post(url, headers=headers, json=payload)
        res_json = response.json()

        print("Assistant: " + res_json["content"][0]["text"])
        print()
        messages.append({
            "role": "assistant", 
            "content": res_json["content"][0]["text"]
        })