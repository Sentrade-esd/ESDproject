# from flask import Flask, jsonify, request
from quart import Quart, request, jsonify
import pymongo
from pymongo import MongoClient

import sys
import os
import requests
from datetime import datetime

import asyncio

app = Quart(__name__)
db = None

# get env variable and place it in url
try:
    sentiment_service_url = os.environ['SENTIMENT_SERVICE_URL']
    print("URL retrieved from env variable: " + sentiment_service_url)

    # test the url
    response = requests.get(sentiment_service_url)
    print("sentiment_service_url is valid")

except:
    print("sentiment_service_url failed")


def get_db():
    client = MongoClient(host='sentiment_db',
                         port=27017, 
                         username='root', 
                         password='root',
                        authSource="admin")
    db = client["sentiments"]
    return db

try:

    db_url = os.environ['DB_URL']
    print("URL retrieved from env variable: " + db_url)

    db = get_db()
    print("Connected to database")

    db.sentiments.drop()
    print("created collection")

    db.sentiments.insert_one({
        "datetime": datetime.now(),
        "search" : "test",
        'sentiment_score' : 'test',
        'emotion' : 'test',
        'keyword' : {"test": 0}
    })
    print("inserted test document")

except:
    print("Could not connect to database")

@app.route('/')
def ping_server():
    return "Welcome to sentiments microservice."



    # scan DB 
    # if it exists, check time added
        # if valid, return stored results

@app.route('/query')
async def query_sentiments():
    search_term = request.args.get('search_term')

    sentiments = db.sentiments.find({"search": search_term})
    output = []

    if sentiments is not None:
        for sentiment in sentiments:
            # if sentiment is less than 1 hour old
            if (datetime.now() - sentiment['datetime']).seconds < 3600: # 1 hour or 30 minutes (1800)
                output.append({
                    "datetime" : sentiment['datetime'],
                    "search" : sentiment['search'],
                    'sentiment_score' : sentiment['sentiment_score'],
                    'emotion' : sentiment['emotion'],
                    'keyword' : sentiment['keyword']
                })
        
        if len(output) > 0:
            return jsonify({'result' : output})

    print("getting data")
    # retrieve data from 
    response = await scraper(search_term)
    json_data = await response.json()
    print(json_data)
        
    print("analysing")
    results = await add_sentiments(json_data)

    print("inserting")
    # add the results to the database
    db.sentiments.insert_one({
        "datetime" : datetime.now(),
        "search" : "test",
        'sentiment_score' : results["results"]['headlines_score'] + results["results"]['description_score'],
        'emotion' : results["results"]['emotions'],
        'keyword' : results["keyword_results"]
    })
    
    # else, query sentiment service
        # wait for reply from /search 
        # return calculated results 


# @app.route('/search') 
    # send request to sentiment service with companny name in query 
                
# @app.route('/scraper')
async def scraper(search_term):
    # call scraper service
    # response = requests.get(scraper_service_url + "/scrape")
    # return response.text

    # for now, return testData.csv in json format
    # read the csv file and return the data as dict
    return jsonify([
        {
            "datetime" : "2024-01-28T04:50:27Z",
            "headline" : "Elon Musk joins Trump Republicans to slam rumored Senate border deal",
            "description" : "Elon Musk joined Donald Trump and Republican critics to denounce the contentious Senate border deal that President Joe Biden touted as the “toughest and fairest set of reforms.” “No laws need to be passed” to halt the US border crisis Musk the worlds riche…"
        },
        {
            "datetime" : "2024-01-28T00:10:36Z",
            "headline" : "Tesla battery explodes in Cary home after being removed and charged inside",
            "description" : "Tesla battery explodes in Cary home after being removed and charged insidewral.com"
        },
        {
            "datetime" : "2024-01-27T21:01:05Z",
            "headline" : "Here's why Biden's multi-billion-dollar EV charging program has short-circuited",
            "description" : "By Will Kessler Daily Caller News Foundation The Biden administration has designated billions of taxpayer dollars to build electric vehicle (EV) chargers but lagging market demand and government red tape are getting in the way according to experts who spoke"
        },
        {
            "datetime" : "2024-01-27T20:42:00Z",
            "headline" : "Who wants to be a trillionaire': The game show is nearing its climax",
            "description" : "A trillion dollars can purchase shares of all shares of McDonald's PepsiCo Coca-Cola and more. Elon Musk is predicted to become the first trillionaire by 2032 followed by  Bernard Arnault Jeff Bezos Larry Ellison and Wareen Buffett. The term 'trilliona"
        },
        {
            "datetime": "2024-01-27T16:00:00Z",
            "headline": "ARGHH FUCK THIS",
            "description" : "test"
        }
    ])



# @app.route('/add_sentiments', methods=["POST"])
async def add_sentiments(json_data):
    # call sentiment_service_url/analyse_headlines
    # json_data = request.get_json()


    # add json data to the request
    response = requests.post(sentiment_service_url + "/analyse_headlines", data=json_data)


    # get the results from the response
    return response.json()
    



# @app.route('/get_sentiments', methods=["POST"])
def get_sentiments():

    # get the search term from the request
    search_term = request.get_json()['search']
    
    sentiments = db.sentiments.find({"search": search_term})
    output = []

    for sentiment in sentiments:
        output.append({
            "datetime" : sentiment['datetime'],
            "search" : sentiment['search'],
            'sentiment_score' : sentiment['sentiment_score'],
            'emotion' : sentiment['emotion'],
            'keyword' : sentiment['keyword']
        })

    return jsonify({'result' : output})


@app.route('/get_sentiments', methods=["GET"])
def get_sentiments_old():
    
    # get the search term from the request
    search_term = request.args.get('search')
    
    sentiments = db.sentiments.find({"search": search_term})
    output = []

    for sentiment in sentiments:
        output.append({
            "datetime" : sentiment['datetime'],
            "search" : sentiment['search'],
            'sentiment_score' : sentiment['sentiment_score'],
            'emotion' : sentiment['emotion'],
            'keyword' : sentiment['keyword']
        })

    return jsonify({'result' : output})




@app.route('/test_sentiments_service')
def test_sentiments_service():
    response = requests.get(sentiment_service_url)
    return response.text

if __name__=='__main__':
    app.run(host="0.0.0.0", port=5001)





