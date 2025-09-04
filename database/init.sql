-- Database initialization script
-- This will be executed when PostgreSQL container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL CHECK (length(trim(name)) >= 2),
    birth_date DATE NOT NULL CHECK (birth_date <= CURRENT_DATE),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    address TEXT NOT NULL CHECK (length(trim(address)) >= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster searches
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO patients (name, birth_date, email, address) VALUES 
    ('João Silva Santos', '1985-03-15', 'joao.silva@email.com', 'Rua das Flores, 123, Centro, São Paulo - SP, CEP: 01234-567'),
    ('Maria Oliveira Costa', '1990-07-22', 'maria.oliveira@email.com', 'Avenida Brasil, 456, Zona Sul, Rio de Janeiro - RJ, CEP: 22071-900'),
    ('Carlos Alberto Ferreira', '1978-12-03', 'carlos.ferreira@email.com', 'Praça da Liberdade, 789, Centro, Belo Horizonte - MG, CEP: 30112-000'),
    ('Ana Carolina Mendes', '1992-05-18', 'ana.mendes@email.com', 'Rua Augusta, 321, Consolação, São Paulo - SP, CEP: 01305-100'),
    ('Roberto Lima Souza', '1983-09-10', 'roberto.souza@email.com', 'Rua do Mercado, 654, Pelourinho, Salvador - BA, CEP: 40026-010')
ON CONFLICT (email) DO NOTHING;

-- Verify table creation
SELECT 'Patients table created successfully!' as message;