from fastapi import FastAPI, Request, BackgroundTasks
from pydantic import BaseModel
import uvicorn
import time
import requests

app = FastAPI()

class EventPayload(BaseModel):
    content: str
    context: dict
    timestamp: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/events")
async def handle_event(payload: EventPayload):
    print(f"[Python Worker] Received event: {payload.content}")
    
    # Simple logic: Check for keywords
    response_content = ""
    if "analyze" in payload.content.lower():
        response_content = f"[Python Analysis] I have analyzed '{payload.content}'. Result: Positive trend."
    elif "calculate" in payload.content.lower():
        response_content = f"[Python Calc] Calculation complete: 42."
    else:
        response_content = f"[Python Worker] I received: {payload.content}"

    return {"content": response_content}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
