Project Setup
Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
# add .env (see example)
python manage.py makemigrations
python manage.py migrate
python manage.py runserver


Environment (.env):

DEBUG=True
SECRET_KEY=your_secret_key
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
NEWS_API_KEY=YOUR_NEWS_API_KEY
FRONTEND_ORIGIN=http://localhost:5173
ALLOWED_HOSTS=127.0.0.1,localhost

Frontend
cd frontend
npm i
# add .env with VITE_GOOGLE_CLIENT_ID
npm run dev

OAuth Flow

React shows Google login → gets ID token → POST /api/auth/google/ with { id_token }.

Django verifies token with google-auth against your GOOGLE_CLIENT_ID.

Django creates/updates user + profile, returns JWT (access/refresh).

React stores tokens (localStorage) and calls /api/news/ with Authorization: Bearer <access>.

Real-Time Fetch

The Refresh button simply reloads the data from NewsAPI.

Search box calls /api/news/?q=keyword using the Everything endpoint.

Ethical Use

We’re not scraping HTML; we’re using a public API (NewsAPI) which complies with usage terms. If you later add HTML scraping, always check robots.txt and terms.

6) Quick “Good UI” touches (fast wins)

Grid cards with images + titles (already included).

Responsive by default (CSS grid).

Add a simple favicon and title in frontend/index.html.

Optional: replace buttons with minimal CSS or a UI lib (e.g., Material UI), but not required for submission.

7) GitHub push (they asked for repo link)

From project root:

git init
git add .
git commit -m "React + Django News Portal with Google OAuth and NewsAPI"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main