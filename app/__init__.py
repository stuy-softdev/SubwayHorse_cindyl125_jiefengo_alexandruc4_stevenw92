from flask import Flask, render_template, request, redirect, session, url_for
import sqlite3
from datetime import datetime

app = Flask(__name__)
app.debug = True
app.secret_key = "sdiofwebjkmsdfo78902178904uhhkfsdbndzmdpwao3ryiohelloworld"

DB_FILE="database.db"
db = sqlite3.connect(DB_FILE, check_same_thread=False)
c = db.cursor()

#Flask routes home page
@app.route("/", methods=['GET','POST'])
def home():
    return "hi";

if __name__ == "__main__": #false if this file imported as module
    app.debug = True  #enable PSOD, auto-server-restart on code chg
    app.run()
