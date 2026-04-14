from flask import Flask, render_template, request, redirect, session, url_for, flash
import sqlite3
from datetime import datetime

app = Flask(__name__)
app.debug = True
app.secret_key = "sdiofwebjkmsdfo78902178904uhhkfsdbndzmdpwao3ryiohelloworld"

DB_FILE="database.db"
db = sqlite3.connect(DB_FILE, check_same_thread=False)
c = db.cursor()
c.execute("CREATE TABLE IF NOT EXISTS user_data(username TEXT, password TEXT);")

#Flask routes home page
'''
@app.route("/map", methods=["GET","POST"])
def map():
  return render_template("map.html")
'''

#login and register functions
@app.route("/", methods=['GET', 'POST']) #map if session exists, otherwise go to login
def index():
  if 'username' in session:
    return render_template("map.html", logged=True)
  return render_template("map.html", logged=False)

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

if __name__ == "__main__": #false if this file imported as module
    app.debug = True  #enable PSOD, auto-server-restart on code chg
    app.run()
