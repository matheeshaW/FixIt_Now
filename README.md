# FixIt Now - Local Service Marketplace

**FixIt Now** is a full-stack web platform designed to seamlessly connect individuals seeking local services (e.g., plumbers, electricians, tutors) with trusted service providers in their area. Developed as a module project for **SE3080 - Software Project Management** at SLIIT, this platform follows the **Scrum Agile methodology** to deliver a searchable, rating-based marketplace.

---

## 🚀 Project Vision
> "To create a reliable and user-friendly online marketplace that connects individuals with trusted local service providers, enabling customers to quickly find skilled professionals, while empowering service providers to showcase their expertise and grow their customer base."

---

## 🛠️ Tech Stack
* **Backend:** Spring Boot (Java REST APIs)
* **Frontend:** React.js (Dynamic & Responsive UI)
* **Database:** MySQL Workbench
* **Authentication:** JWT (JSON Web Tokens)

---

## ✨ Key Features

### 👤 User Management & Security
* **Role-Based Access:** Distinct interfaces and permissions for Customers, Service Providers, and Admins.
* **Secure Authentication:** Secure registration and login powered by JWT.
* **Profile Management:** Comprehensive profile CRUD for all user roles.

### 🛠️ Service Marketplace
* **Provider Listings:** Service providers can create, update, and manage their service offerings.
* **Discovery:** Robust search and filtering by category, price, and availability.

### 📅 Booking Workflow
* **Request Management:** Customers can book services via a simple form with preferred times.
* **Status Tracking:** Real-time updates for booking states: Pending → Confirmed → Completed/Cancelled.
* **Provider Action:** Providers receive notifications to accept or reject requests directly from their dashboard.

### 📊 Admin & Feedback
* **Admin Dashboard:** Oversight of all users and bookings with the ability to manage disputes.
* **Review System:** Transparency through customer-submitted ratings and reviews after service completion.
* **Reporting:** Generation of usage metrics and activity reports for platform administrators.

---

## 🔄 Agile Execution
The project was completed over 4 major sprints (plus a Sprint 0 for setup), ensuring incremental delivery of functional features.

| Sprint | Focus | Core Deliverables |
| :--- | :--- | :--- |
| **Sprint 1** | **Identity** | JWT Auth, Registration, and User Profiles. |
| **Sprint 2** | **Discovery** | Service CRUD, Categories, and Search/Filtering. |
| **Sprint 3** | **Transaction** | Booking workflow, Status updates, and History. |
| **Sprint 4** | **Oversight** | Ratings/Reviews and Admin Reporting Dashboard. |

---

## 👥 The Team (Group Y3S1-WE-32)
Key roles (Product Owner and Scrum Master) were rotated each sprint to ensure cross-functional development.

* **Weerakoon W.M.M.B :** Database Design, Security (JWT), Admin User Management.
* **Herath H.M.N.P :** Service CRUD, Listings, and Search Functions.
* **Kahakotuwa K.N :** React Forms, Booking UI, and Booking History.
* **Liyanage H.G.W.R :** Admin Dashboard, Analytics Reports, Reviews & Ratings.

---

## 🛠️ Tools Used
* **Project Management:** Jira (Backlog, Sprint Tracking, Burndown Charts).
* **Collaboration:** GitHub (Version Control), MS Teams (Sprint Reviews), WhatsApp.
