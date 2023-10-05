from flask import Flask, render_template, jsonify
from sqlalchemy import create_engine, text
import config

# # connect to database
DATABASE_URL = f'postgresql://postgres:{config.password}@localhost:5432/{config.database}'
engine = create_engine(DATABASE_URL)

app = Flask(__name__, template_folder='templates/')

# connects and queries database
def fetch(query):
    with engine.connect() as connection:
        print('Data: ',query)
        result = connection.execute(query)
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

# app routes
@app.route('/api/listings')
def get_listings():
    query = text(f"SELECT * FROM listings")
    return jsonify(fetch(query))

@app.route('/api/listings_by_property_type')
def get_listings_by_property_type():
    query = text("SELECT property_type, COUNT(*) as num_listings FROM listings GROUP BY property_type")
    return jsonify(fetch(query))

@app.route('/api/listings_by_neighborhood')
def get_listings_by_neighborhood():
    query = text("SELECT neighbourhood_cleansed, COUNT(*) as num_listings FROM listings GROUP BY neighbourhood_cleansed")
    return jsonify(fetch(query))
   
@app.route('/api/listings_with_most_reviews')
def get_listings_with_most_reviews():
    query = text(" SELECT l.*, COUNT(r.id) AS num_reviews FROM listings AS l WHERE, reviews as r GROUP BY l.id ORDER BY num_reviews DESC LIMIT 5")
    return jsonify(fetch(query))

if __name__ == '__main__':
    app.run()

