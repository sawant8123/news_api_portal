#!/usr/bin/env python3
"""
Setup script for the News App
"""
import os
import subprocess
import sys
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, check=True, capture_output=True, text=True)
        print(f"✅ {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {command} failed: {e}")
        if e.stdout:
            print(f"   stdout: {e.stdout}")
        if e.stderr:
            print(f"   stderr: {e.stderr}")
        return False

def setup_backend():
    """Setup the Django backend"""
    print("\n🚀 Setting up Django Backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Check if virtual environment exists
    venv_dir = backend_dir / "venv"
    if not venv_dir.exists():
        print("Creating virtual environment...")
        if not run_command("python -m venv venv", cwd=backend_dir):
            return False
    
    # Activate virtual environment and install dependencies
    if os.name == 'nt':  # Windows
        pip_path = venv_dir / "Scripts" / "pip.exe"
        python_path = venv_dir / "Scripts" / "python.exe"
    else:  # Unix/Linux/Mac
        pip_path = venv_dir / "bin" / "pip"
        python_path = venv_dir / "bin" / "python"
    
    if not pip_path.exists():
        print("❌ Virtual environment not properly created")
        return False
    
    # Install requirements
    print("Installing Python dependencies...")
    if not run_command(f'"{pip_path}" install -r requirements.txt', cwd=backend_dir):
        return False
    
    # Run migrations
    print("Running database migrations...")
    if not run_command(f'"{python_path}" manage.py migrate', cwd=backend_dir):
        return False
    
    print("✅ Backend setup complete!")
    return True

def setup_frontend():
    """Setup the React frontend"""
    print("\n🎨 Setting up React Frontend...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install dependencies
    print("Installing Node.js dependencies...")
    if not run_command("npm install", cwd=frontend_dir):
        return False
    
    print("✅ Frontend setup complete!")
    return True

def create_env_file():
    """Create .env file if it doesn't exist"""
    print("\n📝 Setting up environment variables...")
    
    backend_dir = Path("backend")
    env_file = backend_dir / ".env"
    env_example = backend_dir / "env_example.txt"
    
    if env_file.exists():
        print("✅ .env file already exists")
        return True
    
    if not env_example.exists():
        print("❌ env_example.txt not found")
        return False
    
    # Copy example file
    import shutil
    shutil.copy(env_example, env_file)
    print("✅ Created .env file from template")
    print("⚠️  Please edit backend/.env and add your API keys:")
    print("   - GOOGLE_CLIENT_ID: Your Google OAuth client ID")
    print("   - NEWS_API_KEY: Your News API key from newsapi.org")
    
    return True

def main():
    """Main setup function"""
    print("🎯 News App Setup")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        return False
    
    # Check Node.js
    try:
        subprocess.run(["node", "--version"], check=True, capture_output=True)
        print("✅ Node.js found")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js not found. Please install Node.js first.")
        return False
    
    # Check npm
    try:
        subprocess.run(["npm", "--version"], check=True, capture_output=True)
        print("✅ npm found")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ npm not found. Please install npm first.")
        return False
    
    success = True
    success &= setup_backend()
    success &= setup_frontend()
    success &= create_env_file()
    
    if success:
        print("\n🎉 Setup complete!")
        print("\nNext steps:")
        print("1. Edit backend/.env and add your API keys")
        print("2. Start backend: cd backend && python manage.py runserver")
        print("3. Start frontend: cd frontend && npm run dev")
        print("4. Open http://localhost:5173 in your browser")
    else:
        print("\n⚠️  Setup incomplete. Please check the errors above.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
