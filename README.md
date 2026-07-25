<div align="center">

# VAULT BANK
https://vaulty-bank-production-a78b.up.railway.app/

**A modern web application for simulating banking transactions and managing finances**

[![Project Version](https://img.shields.io/badge/version-v0.1-yellow.svg?style=for-the-badge)](https://github.com/dDaijin/vault-bank)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://github.com/dDaijin/vault-bank)
[![Educational](https://img.shields.io/badge/status-educational-orange.svg?style=for-the-badge)](https://github.com/dDaijin/vault-bank)

---

> **NOTE: Educational Project**
> This app was developed solely for educational purposes as part of a lab assignment.
> * It is not a real banking app
> * It does not perform any real financial transactions
> * It does not store or process any real financial data
> * It assumes no legal liability  

---

</div>

## Про проєкт

**Vault Bank** is an open-source educational web application designed to demonstrate the principles of building banking systems, processing money transfers, tracking loans, maintaining audit logs, and calculating users’ credit scores.

The interface features a stylish dark design (*Dark Cyberpunk / Monospaced Aesthetic*) with bright yellow and red accents.
---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (React / Vanilla UI), Tailwind CSS / Custom CSS |
| **Backend** | Node.js / Python (FastAPI/Flask) / C# (.NET) / Go *(залежно від конфігурації)* |
| **Database** | PostgreSQL / MySQL |
| **DevOps & Tools** | Docker, Docker Compose, Git, GitHub Actions |

---

## Features

* **Authentication and Security:**
  * Registration and login using username/password
  * Two-factor authentication and login warnings
  * Password hashing and secure session authentication
* **Bank Cards and Accounts:**
  * Real-time display of debit card balance (UAH)
  * Integration and display of the current official NBU exchange rate
* **Money transfers:**
  * Transfer funds using the **recipient’s username** or **card number**
  * Add a description and payment purpose
* **Loans:**
  * Submit a loan application (amount, term, purpose)
  * Tracking an active loan and countdown to repayment
  * Option for early repayment
* **Transaction history and audit:**
  * Detailed history of incoming and outgoing transfers
  * User activity logging system (`AuditLog`)

---

## System Architecture

The application is built using a classic three-tier architecture (*Client-Server-Database*):

```mermaid
flowchart TD
    Client[Web Client / User UI]
    
    subgraph Server [Backend Application]
        API[REST API Controller]
        AuthService[Auth & User Service]
        BankService[Transaction & Account Service]
        CreditService[Loan & Credit Score Service]
        AuditService[Audit Log Service]
    end
    
    subgraph Database [PostgreSQL / MySQL]
        DB[(Database Storage)]
    end

    Client <-->|HTTP / JSON Requests| API
    API --> AuthService
    API --> BankService
    API --> CreditService
    API --> AuditService

    AuthService <--> DB
    BankService <--> DB
    CreditService <--> DB
    AuditService <--> DB
```

---

## ER Diagram (Database Diagram)

The database structure of the **Vault Bank** system is shown below:

<div align="center">
  <img width="1024" alt="ER Diagram" src="https://github.com/user-attachments/assets/a25c6e3b-369f-40c4-9182-b8ff8945c7bf" />
</div>

---

## API Endpoints

### Auth & Users
* `POST /api/auth/register` — Register a new user
* `POST /api/auth/login` — Log in and obtain a token
* `GET /api/user/profile` — Retrieve the current user's profile

### Accounts & Balance
* `GET /api/accounts/me` — User balance and card information
* `GET /api/nbu-rates` — Retrieve current NBU exchange rates

### Transactions
* `POST /api/transactions/transfer` — Make a funds transfer (by username or card number)
* `GET /api/transactions/history` — Retrieve the history of recent transactions

### Loans
* `POST /api/loans/apply` — Submit a loan application
* `POST /api/loans/repay` — Repay an active loan (including early repayment)
* `GET /api/loans/active` — View current loan status

---

## Docker Deployment
The project is fully ready for containerization using Docker Compose.

### Step 1: Clone the repository
```bash
git clone https://github.com/dDaijin/vault-bank.git
cd vault-bank
```

### Step 2: Run via Docker Compose
```bash
docker-compose up -d --build
```

Once successfully launched, the application will be available at: `http://localhost:3000` (or `http://localhost:8080`).

---

## Step-by-Step Installation (Local Setup)

If you want to run the project without Docker:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dDaijin/vault-bank.git
   cd vault-bank
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   PORT=8080
   DATABASE_URL=postgres://user:password@localhost:5432/vault_bank
   JWT_SECRET=your_secret_key
   ```
   
3. **Install dependencies and run the application:**
   ```bash
   # Install dependencies
   npm install   # or pip install -r requirements.txt / dotnet restore

   # Run in development mode
   npm run dev
   ```

---

## Interface Screenshots

| 1. Warning (Educational Disclaimer) | 2. Login and Registration Form |
| :---: | :---: |
| <img width="400" alt="Warning" src="https://github.com/user-attachments/assets/a00c0834-e61c-4c15-a8d9-c79499d16625" /> | <img width="400" alt=“Login” src="https://github.com/user-attachments/assets/b9517771-9782-41af-a44c-5e89be54fe78" /> |

| 3. User Dashboard | 4. Active Loan and Transaction History |
| :---: | :---: |
| <img width="400" alt="Dashboard" src="https://github.com/user-attachments/assets/828cdadd-0a48-4303-b29a-f075db11155a" /> | <img width="400" alt=“History” src="https://github.com/user-attachments/assets/4059563c-3bd9-4204-992a-cfa334514134" /> |
| 5. Loan Application | 6. Fund Transfer |
| :---: | :---: |
| <img width="400" alt="Loan" src="https://github.com/user-attachments/assets/877a3d17-24d8-40fe-b302-f22a939cd53f" /> | <img width="400" alt=“Transfer” src="https://github.com/user-attachments/assets/c379f477-a42a-44ea-a62b-8503b5f6d142" /> |

---

## Future Improvements

* [ ] **2FA verification:** Adding Google Authenticator / SMS OTP for transfer verification.
* [ ] **Multi-currency support (USD, EUR):** In-app currency conversion based on the NBU exchange rate.
* [ ] **PDF receipt generation:** Download official statements and transfer receipts.
* [ ] **Admin Panel:** A separate dashboard for approving bank loans and viewing the `AuditLog`.
* [ ] **Push Notifications:** Real-time notifications for incoming and outgoing transfers.
