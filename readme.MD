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

## Disaster Recovery & Backups
The system is equipped with an automated backup service (`workflow_pgbackup`) to prevent data loss in case of severe server failures.

**How it works:**
- Automatically executes a full database dump every day at midnight (`@daily`).
- Safely stores the `.sql` backup files in the `db_backups/` directory on the host machine.
- Automatically prunes backups older than 7 days to optimize disk space.

**Restoring from a Backup:**
In the event of a total server crash, copy your source code and the `db_backups` folder to the new server, then execute:
```bash
# 1. Start the database service only
docker compose up -d db

# 2. Restore the database from your latest backup file (update filename accordingly)
docker exec -i workflow_postgres psql -U admin -d vt_workflow < ./db_backups/backup_YYYY-MM-DD.sql

# 3. Start the remaining services
docker compose up -d
```
