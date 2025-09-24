from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from dataclasses import dataclass
from typing import Dict
import uuid
import json
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

template = Jinja2Templates(directory="templates")

@dataclass
class ConnectionManager:
  def __init__(self)->None:
    self.active_connections: dict = {}

  async def connect(self, websocket: WebSocket):
    await websocket.accept()
    id = str(uuid.uuid4())
    self.active_connections[id] = websocket
    
    data = json.dumps({"isMe": True, "data": "Have joined!!", "username": "You"})
    await self.send_message(websocket, data)
    return id

  async def send_message(self, ws: WebSocket, message: str):
    try:
      await ws.send_text(message)
    except Exception:
      # Connection is closed, remove it from active connections
      await self.remove_connection(ws)

  async def broadcast(self, websocket: WebSocket, data: str):
    decoded_data = json.loads(data)
    closed_connections = []

    for connection_id, connection in self.active_connections.items():
      try:
        is_me = False
        if connection == websocket:
          is_me = True

        await connection.send_text(json.dumps({"isMe": is_me, "data": decoded_data["message"], "username": decoded_data["username"]}))
      except Exception:
        # Connection is closed, mark for removal
        closed_connections.append(connection_id)
    
    # Remove closed connections
    for connection_id in closed_connections:
      del self.active_connections[connection_id]

  async def remove_connection(self, websocket: WebSocket):
    """Remove a specific websocket connection from active connections"""
    for connection_id, connection in list(self.active_connections.items()):
      if connection == websocket:
        del self.active_connections[connection_id]
        break

  async def disconnect(self, websocket: WebSocket):
    """Properly disconnect and remove a websocket connection"""
    await self.remove_connection(websocket)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def get_app(request: Request):
    return template.TemplateResponse("index.html", {"request": request, "title": "Chat app 1"})

connection_manager = ConnectionManager()


@app.websocket("/message")
async def websocket_endpoint(websocket: WebSocket):
  connection_id = await connection_manager.connect(websocket)

  try:
    while True:
      data = await websocket.receive_text()
      await connection_manager.broadcast(websocket, data)
  except WebSocketDisconnect:
    await connection_manager.disconnect(websocket)
  except Exception as e:
    print(f"WebSocket error: {e}")
    await connection_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
    