# run_app_ngrok.py
"""
Orchestrator script to start backend (FastAPI), frontend (Vite),
create an ngrok tunnel for the frontend, and configure the proxy environment.
"""

import os
import sys
import time
import subprocess
from pyngrok import ngrok

# Fix Windows console encoding for emoji output
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def update_env_file(env_path, api_url):
    """
    Reads the .env file, removes any existing VITE_API_URL, and writes the new api_url.
    """
    lines = []
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
    # Filter out VITE_API_URL lines
    new_lines = [line for line in lines if not line.strip().startswith('VITE_API_URL=')]
    
    # Ensure there is a newline at the end if the file is not empty
    if new_lines and not new_lines[-1].endswith('\n'):
        new_lines[-1] += '\n'
        
    new_lines.append(f'VITE_API_URL={api_url}\n')
    
    with open(env_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

def main():
    backend_proc = None
    frontend_proc = None
    
    print("==================================================")
    print("🚀 Starting EcoView AI Tunneling & Servers Orchestrator")
    print("==================================================")
    
    try:
        # 1. Start backend FastAPI
        print("🤖 Starting FastAPI Backend (port 8000)...")
        python_exe = sys.executable
        backend_proc = subprocess.Popen(
            [python_exe, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd=os.path.abspath("backend")
        )
        
        # Give backend a moment to start
        time.sleep(2)
        if backend_proc.poll() is not None:
            print("❌ Backend failed to start. Check ports or dependencies.")
            return

        # 2. Start Ngrok Tunnel for Frontend (which proxies to backend)
        print("🌐 Connecting ngrok tunnel for Frontend...")
        frontend_url = None
        
        try:
            # Start Frontend tunnel
            frontend_tunnel = ngrok.connect(5173, "http")
            frontend_url = frontend_tunnel.public_url
            print(f"✅ Ngrok Tunnel created: {frontend_url}")
        except Exception as e:
            print(f"❌ Failed to create ngrok tunnel: {e}")
            print("Make sure you have run 'ngrok config add-authtoken <token>' first.")
            print("Falling back to local URLs without ngrok...")
            frontend_url = "http://localhost:5173"

        # 3. Update frontend/.env with API proxy path
        # Since we use Vite server proxy, VITE_API_URL should be '/api'
        print("📝 Setting VITE_API_URL to /api in frontend/.env...")
        env_path = os.path.abspath(os.path.join("frontend", ".env"))
        update_env_file(env_path, "/api")

        # 4. Start frontend Vite
        print("💻 Starting React Frontend (Vite)...")
        # On Windows we use shell=True for npm
        frontend_proc = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=os.path.abspath("frontend"),
            shell=True
        )

        print("\n==================================================")
        print("🎉 EcoView AI is up and running!")
        if frontend_url.startswith("http://localhost"):
            print(f"🔗 Local Frontend: {frontend_url}")
        else:
            print(f"🔗 Public Address (ngrok): {frontend_url}")
            print(f"🔗 API docs:                {frontend_url}/api/docs")
        print("==================================================")
        print("Press Ctrl+C to terminate all servers and tunnels.")
        print("==================================================\n")

        # Keep running
        while True:
            time.sleep(1)
            # Check if backend or frontend died
            if backend_proc.poll() is not None:
                print("⚠️ Backend server stopped unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("⚠️ Frontend server stopped unexpectedly.")
                break

    except KeyboardInterrupt:
        print("\n👋 Shutting down processes...")
    finally:
        # Clean up
        if backend_proc:
            try:
                backend_proc.terminate()
                backend_proc.wait(timeout=2)
            except Exception:
                pass
        if frontend_proc:
            try:
                if os.name == 'nt':
                    subprocess.run(["taskkill", "/F", "/T", "/PID", str(frontend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    frontend_proc.terminate()
                frontend_proc.wait(timeout=2)
            except Exception:
                pass
        try:
            ngrok.kill()
        except Exception:
            pass
        print("✨ Done cleaning up.")

if __name__ == '__main__':
    main()
