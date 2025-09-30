This application is designed to help users track their monthly income and expenses through graphical visualization and a data management system (CRUD). It is built using **Next.js with the App Router**, ensuring modern routing, scalability, and optimized performance.

## 📊 Application Flow Summary

The application has two main pages and flows from the **Frontend (Next.js/React)** to the **Backend (Next.js API Routes/Drizzle/PostgreSQL).**

### 1. 🏡 Main Page (Dashboard - `/`)

This page serves as the **Visualization Dashboard**, providing users with a weekly financial summary.

* **Purpose:** To quickly display trends of Income and Expenses.
* **Key Components:**

  * **Weekly Bar Chart:** Displays total income and expenses for each week of the current (or selected) month.
  * **Balance Summary:** Shows the current total balance.
  * **Navigation:** Provides a link to the CRUD Transactions page.
* **Data Flow:**

  1. **Frontend (Next.js - App Router):** Fetches aggregate data from the API Route (e.g., `/api/weekly-summary`).
  2. **Backend (Next.js API Route):**

     * Receives the request.
     * Uses **Drizzle ORM** to interact with **PostgreSQL**.
     * Executes queries with **GROUP BY** and **SUM** based on transaction date (`tanggal`) and category (Income/Expense).
     * Sends the aggregated data back as JSON.
  3. **Frontend (React/shadcn/ui/Recharts/etc.):** Renders the returned data into a **Bar Chart** component.

---

### 2. 📝 Transaction Management Page (CRUD System - `/transactions`)

This page allows users to manage their financial transaction records in detail.

* **Purpose:** To Create, Read, Update, and Delete (CRUD) financial records.

* **Key Components:**

  * **Data Table (shadcn/ui):** Displays the full list of transactions.
  * **Transaction Form:** A modal or separate form for **Create** and **Update** actions.

* **Data Flow (CRUD Operations):**

| Operation  | Frontend (Next.js/shadcn/ui)                                                     | Backend (Next.js API Route)                       | Database (Drizzle/PostgreSQL) |
| :--------- | :------------------------------------------------------------------------------- | :------------------------------------------------ | :---------------------------- |
| **CREATE** | User submits form (**POST** `/api/transactions`).                                | Validates and inserts a new record using Drizzle. | Saves new row.                |
| **READ**   | Fetches transaction data (**GET** `/api/transactions`) and renders in the table. | Executes **SELECT** query.                        | Returns data.                 |
| **UPDATE** | User edits a record (**PUT/PATCH** `/api/transactions/[id]`).                    | Updates row by ID using Drizzle.                  | Modifies existing row.        |
| **DELETE** | User deletes a record (**DELETE** `/api/transactions/[id]`).                     | Deletes row by ID using Drizzle.                  | Removes row.                  |

---

## 💻 Technical Stack

| Component              | Technology                              | Role                                                                               |
| :--------------------- | :-------------------------------------- | :--------------------------------------------------------------------------------- |
| **Frontend Framework** | **Next.js 15 (TypeScript, App Router)** | Builds UI, handles routing (Client/Server Components), and provides API Routes.    |
| **Styling**            | **Tailwind CSS**                        | Utility-first responsive styling (with pastel blue theme).                         |
| **UI Components**      | **shadcn/ui**                           | Pre-built accessible components (Table, Form, Button, Modal) styled with Tailwind. |
| **Database**           | **PostgreSQL**                          | Reliable relational database for storing transactions.                             |
| **ORM**                | **Drizzle ORM**                         | Type-safe query builder bridging Next.js and PostgreSQL.                           |

---

## 💾 Database Schema

A single main table is enough for all transactions, separated by **`kategori`** (Income or Expense).

**Table Name:** `transactions` (or `cash_flow`)

| Column           | Data Type (Postgres/Drizzle)   | Description                                                             |
| :--------------- | :----------------------------- | :---------------------------------------------------------------------- |
| `id`             | `uuid`/`serial`                | Unique Primary Key.                                                     |
| `tanggal`        | `date`/`timestamp`             | Date of transaction (used for weekly visualization).                    |
| `nama_keperluan` | `varchar`                      | Short description (e.g., "Coffee Purchase," "Monthly Salary").          |
| `kategori`       | `varchar` (`enum` recommended) | Either **"Income"** or **"Expense"**.                                   |
| `nominal`        | `numeric`/`integer`            | Transaction amount (always positive; sign is determined by `kategori`). |
| `sisa_saldo`     | `numeric`/`integer`            | Remaining balance after this transaction (optional/derived).            |
| `created_at`     | `timestamp`                    | Record creation time (for audit/sorting).                               |

### 🔍 Balance Calculation

The `sisa_saldo` column is typically **not stored** but calculated dynamically for accuracy.

* **Total Balance:** $\sum (\text{Income}) - \sum (\text{Expense})$
* **Bar Chart Data:** Aggregated by `tanggal` (per week) and `kategori`.

---