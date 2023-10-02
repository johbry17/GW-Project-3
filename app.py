# import dependencies
from flask import Flask, render_template
from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
import config

# connect to database
DATABASE_URL = f'postgresql://postgres:{config.password}@localhost:5432/{config.database}'
engine = create_engine(DATABASE_URL)

# refelct existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(autoload_with=engine)

print("The classes are:\n" + ", ".join(sorted(Base.classes.keys())))

# save references to each table
# campaign = Base.classes.campaign
category = Base.classes.category
# contacts = Base.classes.contacts
# subcategory = Base.classes.subcategory


# create a session to interact with the database
session = Session(bind=engine)

# flask setup
app = Flask(__name__, template_folder='templates/')

# home page
@app.route('/')
def home():
    data = session.query(category).all()
    return render_template('index.html', data=data)

@app.route('/about')
def about():
    return render_template('about.html')

if __name__ == '__main__':
    app.run()