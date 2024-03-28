import requests
import pandas as pd
import numpy as np

from flask import Flask, abort
from modelLoader import ModelLoader
from flask import request, jsonify

app = Flask(__name__)
model_loader = ModelLoader()
print("Model loaded")


@app.route('/')
def home():
    return 'welcome to sentiment service'


@app.route('/analyse_headlines', methods=['POST'])
def convert_json_to_csv():
    # Get JSON from request
    try:
        json_data = request.get_json()
        
        print("Data received from request")
        print()
        print(json_data)

        # Convert JSON to DataFrame
        headlines_df = pd.DataFrame(json_data)

        headlines_df['headline_sentiment'] = 0
        # headlines_df['description_sentiment'] = 0
        headlines_df['emotion'] = 0

        # call get_sentiment_and_emotion
        results = model_loader.get_sentiment_and_emotion(len(headlines_df), headlines_df)

        keyword_results = model_loader.get_keywords(" ".join(headlines_df['title'].tolist())) # + " ".join(headlines_df['description'].tolist())

        print("analysis complete")

        return {"results": results, "keyword_results":keyword_results}

    except Exception as e:
        print(f"An error occurred: {e}")
        abort(500, description="An error occurred while processing your request.")



@app.route('/analyse_keywords', methods=['POST'])
def analyse_keywords():
    # Get JSON from request
    try:
        json_data = request.get_json()
        
        print("Data received from request")

        # Convert JSON to DataFrame
        headlines_df = pd.DataFrame(json_data)

        # call get_sentiment_and_emotion
        keyword_results = model_loader.get_keywords(" ".join(headlines_df['title'].tolist())) # + " ".join(headlines_df['description'].tolist())
        # print(keyword_results)
        print("analysed keywords")

        return keyword_results
    
    except Exception as e:
        print(f"An error occurred: {e}")
        abort(500, description="An error occurred while processing your request.")



@app.route('/analyse_comment', methods=['POST'])
def analyse_comment():
    # get comment from request
    try:
        comment = request.get_json()
        print ("Data received from request")
        # print(comment)

        # call get_sentiment_and_emotion
        result = model_loader.get_comment(comment["comment"])
        print ("analysed comment")
        # print(result)

        return result
    except Exception as e:
        print(f"An error occurred: {e}")
        abort(500, description="An error occurred while processing your request.")



if __name__ == '__main__':
    app.run(port=5002, debug=True, host="0.0.0.0")
