# Monthly Cash Tracker

This application is designed to help users track their monthly income and expenses through graphical visualization and a data management system (CRUD). It is built using **Next.js with the App Router**, ensuring modern routing, scalability, and optimized performance. The application features Indonesian Rupiah (IDR) currency formatting for local financial tracking.

## 📊 Features

- **Dashboard**: Visualize weekly income and expenses with interactive charts
- **Transaction Management**: Create, read, update, and delete financial transactions
- **Balance Tracking**: Automatic calculation of total balance
- **Indonesian Rupiah (IDR) Support**: All amounts formatted in Indonesian Rupiah (Rp)
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd monthly_cash
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Update the DATABASE_URL in .env.local with your PostgreSQL connection string
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── page.tsx         # Dashboard page
│   ├── transactions/    # Transaction management page
│   └── layout.tsx       # Root layout
├── components/          # Reusable UI components
├── db/                  # Database schema and connection
│   └── schema.ts        # Transaction schema definition
├── lib/                 # Utility functions
└── docker-compose.yml   # Docker configuration for PostgreSQL
```

## 🐳 Docker Setup

### Database Only (Recommended for Development)

If you prefer to use Docker for your database while running the app locally, follow these steps:

1. Make sure you have Docker and Docker Compose installed
2. Start the PostgreSQL container:
   ```bash
   docker-compose up -d
   ```
3. Update your `.env.local` file to use the Docker database connection:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/monthly_cash"
   ```
4. Run the application normally:
   ```bash
   npm run dev
   ```

### Complete Docker Setup (App + Database)

To run both the application and database in Docker:

1. Build and start both services:
   ```bash
   # In one terminal, start the database
   docker-compose up -d
   
   # In another terminal, build and run the app container
   docker build -t monthly_cash .
   docker run -p 3000:3000 --env DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/monthly_cash" monthly_cash
   ```

The database will be available at `localhost:5432` with:
- Database name: `monthly_cash`
- Username: `postgres`
- Password: `password`

You can stop the database container with:
```bash
docker-compose down
```

### Production Docker Compose

For production-like environments, we also provide a production Docker Compose file:
```bash
docker-compose -f docker-compose.prod.yml up -d
```


## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS with custom pastel blue theme
- **UI Components**: Custom shadcn/ui-inspired components
- **Charts**: Recharts for data visualization
- **Database**: PostgreSQL with Drizzle ORM
- **API**: Next.js API Routes

## 📊 Database Schema

The application uses a single table for all transactions:

| Column        | Type      | Description                          |
|---------------|-----------|--------------------------------------|
| id            | serial    | Unique Primary Key                   |
| tanggal       | timestamp | Date of transaction                  |
| namaKeperluan | text      | Transaction description              |
| kategori      | text      | Category (Income or Expense)         |
| nominal       | integer   | Transaction amount (in cents)        |
| createdAt     | timestamp | Record creation time                 |

## 📈 API Endpoints

- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/:id` - Get a specific transaction
- `PUT /api/transactions/:id` - Update a specific transaction
- `DELETE /api/transactions/:id` - Delete a specific transaction
- `GET /api/weekly-summary` - Get weekly income/expense summary

## 🛠️ Database Management

This project includes helpful scripts for database management:

### Test Database Connection
```bash
npm run db:test
```
This command checks if the database is accessible and if the transactions table exists.

### Create Database Tables
```bash
npm run db:table
```
This command generates and applies database migrations to create the necessary tables.

### Reset Database (if needed)
```bash
npm run db:reset
```
This command drops the existing transactions table and enum (if any) to allow for a clean setup. Use this if you encounter schema mismatch errors.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.