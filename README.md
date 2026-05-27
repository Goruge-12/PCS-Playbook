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


The frontend also includes demo installation data so the pages still display even if the backend is not running yet. When the backend is running and MySQL has data, the app will try to load live data from the API.
=======
# PCS-Playbook
Capstone Project on PCS Playbook
