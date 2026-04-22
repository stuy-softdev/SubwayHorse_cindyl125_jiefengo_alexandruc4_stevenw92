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

