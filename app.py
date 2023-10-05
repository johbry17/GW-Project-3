from flask import Flask, render_template, jsonify
from sqlalchemy import create_engine, text
import config

# # connect to database
DATABASE_URL = f'postgresql://postgres:{config.password}@localhost:5432/{config.database}'
engine = create_engine(DATABASE_URL)

app = Flask(__name__, template_folder='templates/')

# connects and queries database
def fetch(table_name):
    with engine.connect() as connection:
        result = connection.execute(text(f"SELECT * FROM {table_name}"))
        column_names = result.keys()
    return [dict(zip(column_names, row)) for row in result]

################

# html routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

################

# api routes
@app.route('/api/availability')
def get_availability():
    return jsonify(fetch('availability'))

@app.route('/api/calendar')
def get_calendar():
    return jsonify(fetch('calendar'))

@app.route('/api/calculated_host_listings')
def get_calculated_host_listings():
    return jsonify(fetch('calculated_host_listings'))

@app.route('/api/hosts')
def get_hosts():
    return jsonify(fetch('hosts'))

@app.route('/api/listings')
def get_listings():
    return jsonify(fetch('listings'))

@app.route('/api/listing_reviews')
def get_listing_reviews():
    return jsonify(fetch('listing_reviews'))

@app.route('/api/min_max_night')
def get_min_max_night():
    return jsonify(fetch('min_max_night'))

@app.route('/api/reviewers')
def get_reviewers():
    return jsonify(fetch('reviewers'))

@app.route('/api/reviews')
def get_reviews():
    return jsonify(fetch('reviews'))

################

if __name__ == '__main__':
    app.run()