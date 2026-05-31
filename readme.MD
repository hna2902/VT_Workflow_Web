# VT Workflow Web - Enterprise Workflow Management System

## Project Overview
This project builds a comprehensive Enterprise Workflow Management System. It provides a solution to digitize complex business operations into sequential processes, manage categorized assets, and deliver real-time notifications to optimize team performance and collaboration.

## System Architecture
* **API Gateway & Logic:** Utilizes **Django REST Framework (DRF)** to implement a decoupled architecture, completely separating Backend and Frontend, handling data seamlessly via JSON.
* **Database & Storage:** Highly normalized Relational Database (RDBMS) featuring 9 tables on **PostgreSQL**, utilizing UUIDs for secure primary keys.
* **Real-time Engine:** Integrates **Redis** as a Message Broker to facilitate the WebSockets system, enabling instant live notifications.
* **Infrastructure:** Containerized the entire environment using **Docker & Docker Compose**, ensuring consistent and seamless deployment across all servers (Local/Production).

## Tech Stack
* **Languages:** Python, SQL
* **Backend Framework:** Django, Django REST Framework (DRF)
* **Database & Caching:** PostgreSQL, Redis
* **DevOps & Tooling:** Docker, Docker Compose, pgAdmin, Python-environ

## Key Achievements
* Architected an enterprise-scale database schema comprising **9 tables across 4 decoupled apps**, completely eliminating Circular Import issues.
* Engineered a comprehensive RESTful API suite (CRUD) optimized for Single-Page Applications (SPA) - enabling seamless data creation, inline editing, and deletion via Popup Modals without page reloads.
* Successfully implemented enterprise-standard security flows: 100% concealment of Secret Keys and Database Credentials through strict `.env` environment variable management.

## Installation & Setup
Prerequisites: Docker and Docker Compose must be installed on your local machine.

**1. Environment Variables Setup**
Create a `.env` file in the root directory to secure credentials:
# env:
- DB_NAME=vt_workflow
- DB_USER=admin
- DB_PASSWORD=your_secure_password
- PGADMIN_EMAIL=admin@workflow.com
- PGADMIN_PASSWORD=your_pgadmin_password

**2. Spin up the Infrastructure**
Launch the PostgreSQL database, Redis, and pgAdmin in detached mode:
- docker-compose up -d

**3. Initialize Data and Backend Server**
Apply migrations, setup the admin account, and start the development server:
- python manage.py migrate
- python manage.py createsuperuser
- python manage.py runserver