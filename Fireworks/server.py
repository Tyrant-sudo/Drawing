import http.server
import socketserver
import os
import json
import base64
import threading
from pathlib import Path
from websocket_server import WebsocketServer

# 配置
PORT = 8082
WEBSOCKET_PORT = 8083
IMAGE_SAVE_DIR = Path("saved_images")

# 确保图片保存目录存在
IMAGE_SAVE_DIR.mkdir(exist_ok=True)

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def new_client(client, server):
    print(f"New client connected with id {client['id']}")

def message_received(client, server, message):
    try:
        # 检查消息是否为空
        if not message:
            print("Received empty message")
            return
            
        # 验证消息是否为有效的JSON字符串
        if not isinstance(message, str):
            print(f"Invalid message type: {type(message)}")
            return
            
        # 检查消息是否看起来像JSON
        message = message.strip()
        if not (message.startswith('{') and message.endswith('}')):
            print(f"Message doesn't look like JSON: {message[:50]}...")
            return
            
        # 解析消息
        data = json.loads(message)
        
        # 验证必需的字段
        if 'type' not in data:
            print("Missing 'type' field in message")
            return
            
        if data['type'] == 'saveImage':
            # 获取图片数据和文件名
            image_data = data.get('image')
            filename = data.get('filename')
            
            # 检查必要字段
            if not image_data or not filename:
                print("Missing image data or filename")
                return
                
            # 移除数据URL前缀
            if image_data.startswith('data:image/png;base64,'):
                image_data = image_data.split(',')[1]
            
            # 解码并保存图片
            image_bytes = base64.b64decode(image_data)
            filepath = IMAGE_SAVE_DIR / filename
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            
            print(f"Saved image: {filename}")
            # 发送确认消息
            server.send_message(client, json.dumps({'type': 'saved', 'filename': filename}))
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Problematic message (first 100 chars): {message[:100] if message else 'None'}")
    except Exception as e:
        print(f"Error processing message: {e}")
        import traceback
        traceback.print_exc()

def start_websocket_server():
    server = WebsocketServer(host='127.0.0.1', port=WEBSOCKET_PORT)
    server.set_fn_new_client(new_client)
    server.set_fn_message_received(message_received)
    print(f"WebSocket server started on port {WEBSOCKET_PORT}")
    server.run_forever()

if __name__ == "__main__":
    # 在单独的线程中启动WebSocket服务器
    ws_thread = threading.Thread(target=start_websocket_server)
    ws_thread.daemon = True
    ws_thread.start()
    
    # 启动HTTP服务器
    handler = MyHttpRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Server started at http://localhost:{PORT}")
        print(f"WebSocket server running on port {WEBSOCKET_PORT}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")