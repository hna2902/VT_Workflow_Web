# VT Workflow Web

## Project Overview
This project is an Enterprise Workflow Management System designed to digitize business operations into sequential processes. It helps manage categorized assets and delivers real-time notifications to support team collaboration.

## System Architecture
* **API & Logic:** Uses Django REST Framework (DRF) to provide a decoupled backend architecture, communicating with the frontend via JSON.
* **Frontend:** Built with React and Vite for a single-page application experience.
* **Database:** Uses PostgreSQL as a relational database, applying UUIDs for primary keys across the tables.
* **Real-time Notifications:** Integrates Redis and Django Channels for WebSocket support, enabling live notifications.
* **Deployment:** Containerized using Docker, Docker Compose, and Nginx to ensure consistent environments across local and production servers.

## Tech Stack
* **Languages:** Python, JavaScript, HTML/CSS, SQL
* **Frontend:** React, Vite
* **Backend:** Django, Django REST Framework (DRF), Django Channels
* **Database & Caching:** PostgreSQL, Redis
* **Infrastructure:** Docker, Docker Compose, Nginx, pgAdmin

## Key Features
* **Database Schema:** Structured database schema across decoupled Django apps to manage users, processes, categories, and notifications.
* **RESTful API:** Provides CRUD operations optimized for the frontend, allowing data manipulation without full page reloads.
* **Docker Environment:** Uses Docker Compose to spin up the Database, Redis, Backend, and Frontend services simultaneously.
* **Environment Configuration:** Manages credentials and sensitive information through `.env` files.

## Installation & Setup
**Prerequisites:** Docker and Docker Compose installed on your system.

**1. Environment Variables Setup**
Create a `.env` file in the root directory and configure the following variables:
```env
DB_NAME=vt_workflow
DB_USER=admin
DB_PASSWORD=your_secure_password

PGADMIN_EMAIL=admin@workflow.com
PGADMIN_PASSWORD=your_pgadmin_password

EMAIL_HOST_USER=your_gmail@gmail.com
EMAIL_HOST_PASSWORD=your_app_password

FRONTEND_URL=http://localhost:8080
```

**2. Build and Start the Containers**
Run the following command to build the images and start the services in the background:
```bash
docker compose up -d --build
```

**3. Database Initialization**
Run migrations and create an admin user inside the backend container:
```bash
docker exec -it workflow_backend python manage.py migrate
docker exec -it workflow_backend python manage.py createsuperuser
```

**4. Access the Application**
- **Web App:** `http://localhost:8080` (or your configured IP/domain)
- **pgAdmin:** `http://localhost:5050`
