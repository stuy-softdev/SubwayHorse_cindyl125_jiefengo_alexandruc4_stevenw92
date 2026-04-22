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
