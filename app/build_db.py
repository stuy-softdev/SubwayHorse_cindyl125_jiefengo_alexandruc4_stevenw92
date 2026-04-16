import sqlite3
import csv
import os
import sys

CSV_FILE_PATH = 'payroll_data.csv'  # Not uploading csv name it whatever you want
DB_FILE_PATH = 'nyc_payroll.db'
TABLE_NAME = 'payroll_data'

def create_database():
    db = sqlite3.connect(DB_FILE_PATH)
    cursor = db.cursor()

    # names taken from api field names...take it up with them
    table_query = f'''
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
    cursor.execute(table_query)

    if not os.path.exists(CSV_FILE_PATH):
        print(f"could not find {CSV_FILE_PATH}")
        return

    print(f"currently reading from {CSV_FILE_PATH}")

    with open (CSV_FILE_PATH, mode = "r", encoding="utf-8") as csv_file:
        csv_file = csv.reader(csv_file)
        next(csv_file, None) # using next since loading a large dataset into memory wouldn't be a good idea
        insert_query = f'''
        INSERT INTO {TABLE_NAME} (
            fiscal_year, payroll_number, agency_name, last_name, first_name, mid_init,
            agency_start_date, work_location_borough, title_description, leave_status_as_of_june_30,
            base_salary, pay_basis, regular_hours, regular_gross_paid, ot_hours, total_ot_paid, total_other_pay
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        '''
        row_count = 0
        for row in csv_file:
            try:
                cursor.execute(insert_query, row)
            except:
                print(f"failed on row {row_count}")
                sys.exit(1)
            row_count += 1

    db.commit()
    db.close()

    print(f"finished reading")

if __name__ == "__main__":
    create_database()
