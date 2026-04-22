'''
Steven Wu, Alexandru Cimpoiesu, Jiefeng Ou, Cindy Liu
SubwayHorse
SoftDev
P04: Makers Makin' It, Act II - The Seequel
04/22/2026
'''

import sqlite3
import os
import sys

db_path = "nyc_payroll.db"

nyc_boroughs = {
    "MANHATTAN":     "Manhattan",
    "Manhattan":     "Manhattan",
    "BROOKLYN":      "Brooklyn",
    "Brooklyn":      "Brooklyn",
    "QUEENS":        "Queens",
    "Queens":        "Queens",
    "BRONX":         "Bronx",
    "Bronx":         "Bronx",
    "RICHMOND":      "Staten Island",
    "Richmond":      "Staten Island",
    "STATEN ISLAND": "Staten Island",
    "Staten Island": "Staten Island",
}

money = "CAST(REPLACE(REPLACE(REPLACE({col}, '$', ''), ',', ''), ' ', '') AS REAL)"

def borough_data(col="work_location_borough"):
    parts = ["CASE"]
    for raw_borough, clean_borough in nyc_boroughs.items():
        parts.append(f"  WHEN {col} = '{raw_borough}' THEN '{clean_borough}'")
    parts.append("  ELSE NULL")
    parts.append("END")
    return "\n".join(parts)

def run(db, sql):
    db.executescript(sql)
    db.commit()

def build():
    if not os.path.exists(db_path):
        print(f"Could not find {db_path}.")
        sys.exit(1)
    db = sqlite3.connect(db_path)
    c = db.cursor()
    borough = borough_data()
    base_salary  = money.format(col="base_salary")
    gross_pay    = money.format(col="regular_gross_paid")
    ot_pay       = money.format(col="total_ot_paid")
    other_pay    = money.format(col="total_other_pay")
    total_comp   = f"({gross_pay} + {ot_pay} + {other_pay})"

    run(db, """
        CREATE INDEX IF NOT EXISTS payroll_year      ON payroll_data(fiscal_year);
        CREATE INDEX IF NOT EXISTS payroll_borough ON payroll_data(work_location_borough);
        CREATE INDEX IF NOT EXISTS payroll_agency  ON payroll_data(agency_name);
        CREATE INDEX IF NOT EXISTS payroll_title   ON payroll_data(title_description);
    """)

    run(db, f"""
        DROP TABLE IF EXISTS summary_borough_year;
        CREATE TABLE summary_borough_year AS
        SELECT CAST(fiscal_year AS INTEGER) AS fiscal_year, {borough} AS borough,
            COUNT(*) AS headcount, AVG({base_salary}) AS avg_base_salary,
            AVG({gross_pay}) AS avg_gross_paid, AVG({total_comp}) AS avg_total_comp,
            SUM({ot_pay}) AS total_ot_paid, AVG(ot_hours) AS avg_ot_hours
        FROM payroll_data WHERE {borough} IS NOT NULL AND fiscal_year IS NOT NULL
        GROUP BY fiscal_year, borough;
        CREATE INDEX borough_year ON summary_borough_year(fiscal_year, borough);
    """)

    run(db, f"""
        DROP TABLE IF EXISTS summary_agency_borough_year;
        CREATE TABLE summary_agency_borough_year AS
        SELECT CAST(fiscal_year AS INTEGER) AS fiscal_year, agency_name, {borough} AS borough,
            COUNT(*) AS headcount, AVG({base_salary}) AS avg_base_salary,
            AVG({gross_pay}) AS avg_gross_paid, AVG({total_comp}) AS avg_total_comp
        FROM payroll_data WHERE {borough} IS NOT NULL AND fiscal_year IS NOT NULL AND agency_name IS NOT NULL
        GROUP BY fiscal_year, agency_name, borough;
        CREATE INDEX agency_borough ON summary_agency_borough_year(agency_name, fiscal_year, borough);
    """)

    run(db, f"""
        DROP TABLE IF EXISTS summary_title_borough_year;
        CREATE TABLE summary_title_borough_year AS
        SELECT CAST(fiscal_year AS INTEGER) AS fiscal_year, title_description, {borough} AS borough,
            COUNT(*) AS headcount, AVG({base_salary}) AS avg_base_salary,
            AVG({gross_pay}) AS avg_gross_paid, AVG({total_comp}) AS avg_total_comp
        FROM payroll_data WHERE {borough} IS NOT NULL AND fiscal_year IS NOT NULL AND title_description IS NOT NULL
        GROUP BY fiscal_year, title_description, borough;
        CREATE INDEX title_borough ON summary_title_borough_year(title_description, fiscal_year, borough);
    """)

    run(db, f"""
        DROP TABLE IF EXISTS summary_title_year;
        CREATE TABLE summary_title_year AS
        SELECT CAST(fiscal_year AS INTEGER) AS fiscal_year, title_description,
            COUNT(*) AS headcount, AVG({base_salary}) AS avg_base_salary, AVG({total_comp}) AS avg_total_comp
        FROM payroll_data WHERE fiscal_year IS NOT NULL AND title_description IS NOT NULL AND TRIM(title_description) != ''
        GROUP BY fiscal_year, title_description;
        CREATE INDEX title_year ON summary_title_year(fiscal_year, avg_base_salary);
    """)

    run(db, f"""
        DROP TABLE IF EXISTS summary_agency_year;
        CREATE TABLE summary_agency_year AS
        SELECT CAST(fiscal_year AS INTEGER) AS fiscal_year, agency_name,
            COUNT(*) AS headcount, AVG({base_salary}) AS avg_base_salary, AVG({total_comp}) AS avg_total_comp
        FROM payroll_data WHERE fiscal_year IS NOT NULL AND agency_name IS NOT NULL
        GROUP BY fiscal_year, agency_name;
        CREATE INDEX agency_year ON summary_agency_year(fiscal_year, avg_base_salary);
    """)
    c.execute("SELECT COUNT(*) FROM summary_borough_year")
    c.execute("SELECT COUNT(*) FROM summary_agency_year")
    c.execute("SELECT COUNT(*) FROM summary_title_year")
    db.close()

if __name__ == "__main__":
    build()
