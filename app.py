from flask import Flask, render_template, jsonify
from sqlalchemy import create_engine, text
import config

# # connect to database
DATABASE_URL = f'postgresql://postgres:{config.password}@localhost:5432/{config.database}'
engine = create_engine(DATABASE_URL)

app = Flask(__name__, template_folder='templates/')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/api/listings')
def get_listings():

    query = text("SELECT * FROM listings")

    connection = engine.connect()
    result = connection.execute(query)

    column_names = result.keys()

    data = [dict(zip(column_names, row)) for row in result]

    connection.close()

    return jsonify(data)

if __name__ == '__main__':
    app.run()