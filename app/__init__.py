'''
Steven Wu, Alexandru Cimpoiesu, Jiefeng Ou, Cindy Liu
SubwayHorse
SoftDev
P04: Makers Makin' It, Act II - The Seequel
04/22/2026
'''

from flask import Flask, render_template, request, redirect, session, url_for, flash, jsonify
import sqlite3, random
from datetime import datetime
app = Flask(__name__)
app.debug = True
app.secret_key = "sdiofwebjkmsdfo78902178904uhhkfsdbndzmdpwao3ryiohelloworld"

DB_FILE="database.db"
db = sqlite3.connect(DB_FILE, check_same_thread=False)
c = db.cursor()
c.execute("CREATE TABLE IF NOT EXISTS user_data(username TEXT, password TEXT);")

ad_links = [
    "https://nycjobfairs.com/wp-content/uploads/2025/04/copyofbronxjobfairposter4153983869311417394.jpg?w=768",
    "https://images.squarespace-cdn.com/content/v1/55a00197e4b0b8eb00f89d99/9e3f812a-f035-4827-b465-e5bbae9064d4/OFNS+Hiring+Flyer+-+No+Vaccination+8_5x11+(1)1024_1.jpg",
    "https://nychajournal.nyc/wp-content/uploads/2025/01/Post-2-CarouselDOC_Exam5301_Post_1080x1080_1b-1024x1024.png",
    "https://nycjobfairs.com/wp-content/uploads/2024/12/flatbush-job-fair-poster-2.jpg?w=868",
    "https://i0.wp.com/nycjobfairs.com/wp-content/uploads/2024/12/nyc20job20fairs-remove-background.com_.png?resize=500%2C500&ssl=1",
    "https://images.squarespace-cdn.com/content/v1/6273fd18e26b4a2b39ad9bd9/ae644a84-db0e-4d60-af78-7e3036d1c273/Queens+Job+Fair+2023-+Final_02.png",
    "https://africainharlem.nyc/wp-content/uploads/2023/03/Applications-for-2023-Summer-Youth-Employment-Program-SYEP-open-for-youth-and-employers.jpeg"
]

ad_links2 = [
    "https://www.manhattanbp.nyc.gov/wp-content/uploads/2023/05/Hiring-Hall_May20_2023_Flyer-2.jpg",
    "https://hhinternet.blob.core.windows.net/uploads/2022/09/chs-we-are-hiring-licensed-practical-nurse-event-september-2022-cover-768x768.jpg",
    "https://nychajournal.nyc/wp-content/uploads/2025/03/Jobs-NYC-hiring-hall.png",
    "https://iemlabs.com/blogs/wp-content/uploads/sites/4/2022/12/HOW-TO-GET-A-JOB-IN-NYC.jpg",
    "https://nycjobfairs.com/wp-content/uploads/2024/12/1000082729.jpg?w=768"
]

#login and register functions
@app.route("/", methods=['GET', 'POST']) #map if session exists, otherwise go to login
def index():
    ads = random.sample(ad_links, 3)
    ads2 = random.sample(ad_links2, 3)
    if 'username' in session:
        return render_template("map.html", logged=True, ads=ads, ads2=ads2)
    return render_template("map.html", logged=False, ads=ads, ads2=ads2)

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = sqlite3.connect(DB_FILE)
        c = db.cursor()
        c.execute("SELECT * FROM user_data WHERE username = ?", (username,))
        user_data = c.fetchone()
        db.close()

        if user_data:
            passworddb = user_data[0]
            if password == passworddb:
                session["username"] = username
                return redirect(url_for('index'))
            else:
                flash("Incorrect password. Try again.")
        else:
            flash("Username incorrect or not found. Try again.")
        return redirect(url_for('login'))
    return render_template('login.html')

@app.route("/logout", methods=["GET", "POST"])
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

@app.route("/register", methods=["GET", "POST"]) # create new account and add to database
def register():
  if request.method == "POST":
    db = sqlite3.connect(DB_FILE)
    c = db.cursor()
    username = request.form['username']
    password = request.form['password']

    # Check if username already exists
    c.execute("SELECT * FROM user_data WHERE username = ?", (username,))
    existing_user = c.fetchone()

    if existing_user:
      db.close()
      flash("username already taken, try another one!")
      return render_template('register.html')

    c.execute("INSERT into user_data VALUES (?, ?)", (username, password))
    db.commit()
    db.close()
    session['username'] = username
    return redirect(url_for('index'))
  return render_template('register.html')

@app.route("/api")
def api():
    valid_tables=[
        "fiscal_year",
        "payroll_number",
        "agency_name",
        "last_name",
        "first_name",
        "mid_init",
        "agency_start_date",
        "work_location_borough",
        "title_description",
        "leave_status_as_of_june_30",
        "base_salary",
        "pay_basis",
        "regular_hours",
        "regular_gross_paid",
        "ot_hours",
        "total_ot_paid",
        "total_other_pay",
    ]

    x_axis = request.args.get("x_axis")
    y_axis = request.args.get("y_axis")

    if x_axis in valid_tables and y_axis in valid_tables:
        db = sqlite3.connect("nyc_payroll.db")
        c = db.cursor()
        c.execute(f"SELECT {x_axis}, {y_axis} FROM payroll_data ORDER BY RANDOM() LIMIT 20000")
        data = c.fetchall()
        return jsonify(data)
    else:
        return render_template('map.html')



@app.route("/search", methods=["GET", "POST"])
def search():
    queries=[
        "fiscal_year",
        "payroll_number",
        "agency_name",
        "last_name",
        "first_name",
        "mid_init",
        "agency_start_date",
        "work_location_borough",
        "title_description",
        "leave_status_as_of_june_30",
        "base_salary",
        "pay_basis",
        "regular_hours",
        "regular_gross_paid",
        "ot_hours",
        "total_ot_paid",
        "total_other_pay",
    ]
    if request.method == "POST":
        entries=[]
        reqs=[]
        for query in queries:
            req = request.form.get(query, "").strip().upper()
            if req:
                entries.append(f"{query} = ?")
                reqs.append(req)

        command = "SELECT * FROM payroll_data"
        if entries:
            command += " WHERE " + " AND ".join(entries)

        command += " LIMIT 50"
        db = sqlite3.connect("nyc_payroll.db")
        c = db.cursor()
        c.execute(command, reqs)
        results = c.fetchall()
        db.close()
        return render_template('search.html', queries=queries, results=results)
    return render_template('search.html', queries=queries, results=[])

if __name__ == "__main__": #false if this file imported as module
    app.debug = True  #enable PSOD, auto-server-restart on code chg
    app.run()
