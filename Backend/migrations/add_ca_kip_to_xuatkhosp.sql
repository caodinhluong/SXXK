-- Migration: Add ca_kip column to XuatKhoSP table
-- Date: 2025-12-30
-- Description: Add ca_kip field to track production shift for product exports

-- Add ca_kip column to XuatKhoSP table
ALTER TABLE XuatKhoSP 
ADD COLUMN ca_kip VARCHAR(50) NULL COMMENT 'Ca kíp sản xuất' 
AFTER ngay_xuat;

-- Verify the column was added
DESCRIBE XuatKhoSP;
