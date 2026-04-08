# Database Migrations

This folder contains SQL migration scripts for the database schema changes.

## How to Run Migrations

### Option 1: Using MySQL Command Line
```bash
mysql -u root -p xuatnhapkhau < migrations/add_ca_kip_to_xuatkhosp.sql
```

### Option 2: Using MySQL Workbench or phpMyAdmin
1. Open your MySQL client
2. Select the `xuatnhapkhau` database
3. Copy and paste the SQL from the migration file
4. Execute the SQL

## Migration Files

- `add_ca_kip_to_xuatkhosp.sql` - Adds ca_kip column to XuatKhoSP table for tracking production shifts

## Notes

- Always backup your database before running migrations
- Migrations should be run in order by date
- Test migrations on a development database first
