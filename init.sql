-- Initial database setup for monthly_cash application

-- Create the transactions table according to the schema
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    nama_keperluan VARCHAR(255) NOT NULL,
    kategori VARCHAR(20) NOT NULL CHECK (kategori IN ('Income', 'Expense')),
    nominal INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing (in Indonesian Rupiah values)
INSERT INTO transactions (tanggal, nama_keperluan, kategori, nominal) VALUES
    ('2025-09-01', 'Gaji Bulan Ini', 'Income', 5000000),
    ('2025-09-05', 'Belanja Bulanan', 'Expense', 250000),
    ('2025-09-10', 'Internet & Listrik', 'Expense', 300000),
    ('2025-09-15', 'Pendapatan Tambahan', 'Income', 1500000),
    ('2025-09-20', 'Makan di Restoran', 'Expense', 150000);