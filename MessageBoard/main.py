from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect, HTTPException
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
    self.chat_rooms: dict = {}  # Store chat rooms by room_id

  async def connect(self, websocket: WebSocket, room_id: str = None):
    await websocket.accept()
    id = str(uuid.uuid4())
    self.active_connections[id] = websocket
    
    # If room_id is provided, add to specific chat room
    if room_id:
      if room_id not in self.chat_rooms:
        self.chat_rooms[room_id] = []
      self.chat_rooms[room_id].append(websocket)
    
    data = json.dumps({"isMe": True, "data": "Have joined!!", "username": "You"})
    await self.send_message(websocket, data)
    return id

  async def send_message(self, ws: WebSocket, message: str):
    try:
      await ws.send_text(message)
    except Exception:
      # Connection is closed, remove it from active connections
      await self.remove_connection(ws)

  async def broadcast(self, websocket: WebSocket, data: str, room_id: str = None):
    decoded_data = json.loads(data)
    closed_connections = []

    # If room_id is provided, broadcast only to that room
    if room_id and room_id in self.chat_rooms:
      connections_to_broadcast = self.chat_rooms[room_id]
    else:
      # Broadcast to all connections
      connections_to_broadcast = list(self.active_connections.values())

    for connection in connections_to_broadcast:
      try:
        is_me = False
        if connection == websocket:
          is_me = True

        await connection.send_text(json.dumps({"isMe": is_me, "data": decoded_data["message"], "username": decoded_data["username"]}))
      except Exception:
        # Connection is closed, mark for removal
        if room_id and room_id in self.chat_rooms:
          if connection in self.chat_rooms[room_id]:
            self.chat_rooms[room_id].remove(connection)
        # Also remove from active_connections
        for connection_id, conn in list(self.active_connections.items()):
          if conn == connection:
            closed_connections.append(connection_id)
    
    # Remove closed connections
    for connection_id in closed_connections:
      del self.active_connections[connection_id]

  async def remove_connection(self, websocket: WebSocket):
    """Remove a specific websocket connection from active connections and chat rooms"""
    # Remove from active_connections
    for connection_id, connection in list(self.active_connections.items()):
      if connection == websocket:
        del self.active_connections[connection_id]
        break
    
    # Remove from all chat rooms
    for room_id, connections in self.chat_rooms.items():
      if websocket in connections:
        connections.remove(websocket)

  async def disconnect(self, websocket: WebSocket):
    """Properly disconnect and remove a websocket connection"""
    await self.remove_connection(websocket)

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def get_app(request: Request):
    return template.TemplateResponse("index.html", {"request": request, "title": "Chat app 1"})

@app.get("/chat/{room_id}", response_class=HTMLResponse)
async def get_chat_room(request: Request, room_id: str):
    return template.TemplateResponse("index.html", {"request": request, "title": f"Chat Room {room_id}", "room_id": room_id})

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

@app.websocket("/message/{room_id}")
async def websocket_room_endpoint(websocket: WebSocket, room_id: str):
  connection_id = await connection_manager.connect(websocket, room_id)

  try:
    while True:
      data = await websocket.receive_text()
      await connection_manager.broadcast(websocket, data, room_id)
  except WebSocketDisconnect:
    await connection_manager.disconnect(websocket)
  except Exception as e:
    print(f"WebSocket error: {e}")
    await connection_manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)