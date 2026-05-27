# PCS Playbook: From Orders to Check-In

PCS Playbook is a full-stack web application for Marines completing a Permanent Change of Station move. The system lets users browse Marine Corps installations, view entry requirements and unit contact information, request mentors, and manage installation/profile images through AWS S3.

## Tech Stack

- Programming Language: JavaScript
- Frontend Framework: React
- Backend Framework: Node.js and Express
- Database: MySQL
- Database Management Tool: phpMyAdmin
- Cloud Storage: AWS S3 Bucket
- Source Control: GitHub
- Repository: https://github.com/Goruge-12/PCS-Playbook
- Development Environment: VS Code

## Project Structure

```text
pcs-playbook/
  backend/
    config/
    controllers/
    middleware/
    routes/
    sql/schema.sql
    server.js
  frontend/
    src/
      components/
      pages/
      services/
```

## Main Features

- User registration and login with JWT authentication
- Marine, mentor, and admin roles
- Installation search by name, state, or ZIP code
- Clickable installation map using React Leaflet
- Installation details page
- Mentor listing and mentorship request submission
- Admin dashboard for adding installations and managing mentor requests
- AWS S3 image upload support for installation images and profile images
- MySQL schema ready to import into phpMyAdmin

## Backend Setup

1. Open the `backend` folder in VS Code.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file using `.env.example` as the template.
4. Open phpMyAdmin and import:

```text
backend/sql/schema.sql
```

5. Start the backend:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

## Frontend Setup

1. Open the `frontend` folder.
2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## AWS S3 Notes

Add these values to `backend/.env`:

```text
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
```

The project uploads:

- Installation images to `installation-images/`
- Profile images to `profile-images/`

## GitHub Commands

From the project root:

```bash
git init
git add .
git commit -m "Initial PCS Playbook full stack project"
git branch -M main
git remote add origin https://github.com/Goruge-12/PCS-Playbook.git
git push -u origin main
```

## Frontend Prototype Notes
The React frontend now matches the static HTML prototype layout provided for:
- Home page with dropdown/ZIP installation search
- Interactive installation map placeholder buttons
- Installations card page
- Installation detail page
- Mentor Dashboard table
- Login/register/profile/admin pages

The frontend also includes demo installation data so the pages still display even if the backend is not running yet. When the backend is running and MySQL has data, the app will try to load live data from the API.
