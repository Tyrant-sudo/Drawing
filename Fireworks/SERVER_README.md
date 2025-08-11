# Fireworks Animation with Server-Side Image Saving

This project extends the fireworks animation to automatically save frames to the server without browser download prompts.

## Setup

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Start the server:
   ```
   python server.py
   ```

3. Open your browser and navigate to `http://localhost:8000`

4. Click on the canvas to create fireworks. Images will be automatically saved to the `saved_images` folder.

## How It Works

- The Python server uses `http.server` to serve the web content and `websocket_server` for real-time communication.
- When the animation is running, frames are captured and sent to the server via WebSocket.
- The server saves the images to the `saved_images` directory without any browser prompts.

## Files

- `server.py`: The Python server that serves the webpage and handles image saving
- `fireworks.js`: The p5.js animation code with WebSocket integration
- `index.html`: The HTML page that loads the animation
- `requirements.txt`: Python dependencies
- `saved_images/`: Directory where images are automatically saved