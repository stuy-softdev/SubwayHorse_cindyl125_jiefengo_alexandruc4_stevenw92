import sqlite3
import csv
import os

CSV_FILE_PATH = 'payroll_data.csv'  # Not uploading csv name it whatever you want
DB_FILE_PATH = 'nyc_payroll.db'
TABLE_NAME = 'payroll_data'

def create_database_and_load_csv():
    db = sqlite3.connect(DB_FILE_PATH)
    cursor = db.cursor()

    table_queary = f'''
    CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
        fiscal_year REAL,
        payroll_number REAL,
        agency_name TEXT,
        last_name TEXT,
        first_name TEXT,
        mid_init TEXT,
        agency_start_date TEXT,
        work_location_borough TEXT,
        title_description TEXT,
        leave_status_as_of_june_30 TEXT,
        base_salary REAL,
        pay_basis TEXT,
        regular_hours REAL,
        regular_gross_paid REAL,
        ot_hours REAL,
        total_ot_paid REAL,
        total_other_pay REAL
    )
    '''