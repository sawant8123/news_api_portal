# News App with Google OAuth

A full-stack news application with Google OAuth authentication and JWT tokens.

## Issues Fixed

### JWT Token Problems:
1.  Added proper JWT settings in Django
2.  Fixed token refresh endpoint configuration
3.  Added proper JWT lifetime and rotation settings
4.  Fixed API endpoint URL mismatches

### API Data Fetching Issues:
1.  Added proper error handling and debugging
2.  Fixed News API endpoint configuration
3.  Added comprehensive error messages

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create .env file:**
   Copy `env_example.txt` to `.env` and fill in your API keys:
   ```bash
   cp env_example.txt .env
   ```

6. **Required Environment Variables:**
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `NEWS_API_KEY`: Your News API key from [newsapi.org](https://newsapi.org/)
   - `SECRET_KEY`: Django secret key (auto-generated if not set)

7. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

8. **Start backend server:**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/auth/google/` - Google OAuth login
- `POST /api/token/refresh/` - Refresh JWT token
- `GET /api/news/` - Get news articles (requires authentication)
- `GET /api/me/` - Get current user info (requires authentication)

## Troubleshooting

### JWT Token Issues:
- Ensure you have a valid Google OAuth client ID
- Check that the backend is running on port 8000
- Verify the frontend is making requests to the correct backend URL

### News API Issues:
- Get a free API key from [newsapi.org](https://newsapi.org/)
- Add the API key to your `.env` file
- Check the backend console for detailed error messages

### CORS Issues:
- Ensure the frontend origin is correctly set in `FRONTEND_ORIGIN`
- The backend is configured to allow requests from `http://localhost:5173`

## Features

-  Google OAuth authentication
-  JWT token-based authentication
-  News fetching from News API
-  Automatic token refresh
-  Modern React frontend
-  Django REST API backend
