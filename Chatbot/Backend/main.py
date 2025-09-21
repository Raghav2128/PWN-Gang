from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv
load_dotenv()
import os
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class chatRequest(BaseModel):
    message: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)


def get_bot_response(user_message):
    message=user_message.lower()

    client = genai.Client(api_key=GEMINI_API_KEY)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config=types.GenerateContentConfig(
            system_instruction="You are a health assistant: ask about symptoms, suggest safe short-term OTC/home remedies and self-care, flag urgent symptoms, and tell users to see a clinician. Answer kindly , with short answers, avoid using points and type in short paragraphs Use normal text that can be represented correctly in html format."),
        contents=message
    )

    return response.text


@app.post("/chat")
async def chat(request:chatRequest):
    reply=get_bot_response(request.message)
    print(reply)
    return {"reply":reply}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

