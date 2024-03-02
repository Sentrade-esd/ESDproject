import pandas as pd
import numpy as np
from transformers import pipeline
from tqdm import tqdm

class ModelLoader:
    _instance = None
    

    # sentiment_model = None
    # emotion_model = None
    # keyword_model = None

    valid_emotions = ['joy', 'others', 'surprise',
                  'sadness', 'fear', 'anger', 'disgust']

    emotions =  {"joy": 0, "others": 0, "surprise": 0, 
                "sadness": 0, "fear": 0, "anger": 0, "disgust": 0}

    keywords = {}


    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ModelLoader, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        self.sentiment_model = pipeline(
            model="siebert/sentiment-roberta-large-english")
        
        self.emotion_model = pipeline(
            model="finiteautomata/bertweet-base-emotion-analysis")
        
        self.keyword_ext_model = pipeline(
            model="yanekyuk/bert-keyword-extractor")
        
        self.keyword_senti_model = pipeline(
            model="cardiffnlp/twitter-roberta-base-sentiment-latest")
        
    
    def extract_keywords(self, batch_headlines):
        batch_results = self.keyword_ext_model(batch_headlines)


        for result in batch_results:
            keyword = result['word']

            # Filter words with less than 2 letters, exclude hashtags, and exclude "chin"
            if keyword and len(keyword) >= 3 and not keyword.startswith('#') and keyword.lower() != 'chin':
                if keyword in self.keywords.keys():
                    self.keywords[keyword] += 1
                else:
                    self.keywords[keyword] = 1

        return self.keywords
    

    def get_sentiment_and_emotion(self, total_headlines, headlines_df):
        with tqdm(total=total_headlines, desc="Analysing Sentiments", unit="headline", dynamic_ncols=True) as pbar:
            for idx in range(total_headlines):
                row = headlines_df.iloc[idx]
                headline = row['headline']
                description = row['description']


                result = self.sentiment_model(headline)
                label = result[0]['label']

                if label == 'POSITIVE':
                    headlines_df.at[idx, 'headline_sentiment'] = 1
                elif label == 'NEGATIVE':
                    headlines_df.at[idx, 'headline_sentiment'] = -1

                ## analyse description ##               
                result = self.sentiment_model(description)
                label = result[0]['label']

                if label == 'POSITIVE':
                    headlines_df.at[idx, 'description_sentiment'] = 1
                elif label == 'NEGATIVE':
                    headlines_df.at[idx, 'description_sentiment'] = -1
                

                ## analyse emotions ##
                results = self.emotion_model(headline)

                for result in results:
                    label = result['label']
                    if label in self.valid_emotions:

                        if label not in self.emotions:
                            self.emotions[label] = 0

                        self.emotions[label] += 1

                        headlines_df.at[idx, "emotion"] = label


                pbar.update(1)
        
        # sum up the sentiment scores for the headlines and descriptions and store in a variable
        headlines_score = headlines_df['headline_sentiment'].sum()
        description_score = headlines_df['description_sentiment'].sum()


        return {
            "headlines_score": int(headlines_score),
            "description_score": int(description_score),
            "emotions": self.emotions
        }
    

    def get_keywords(self, batch_headlines):
        return self.extract_keywords(batch_headlines)
    
    def get_comment(self, comment):
        sentiment_result = self.sentiment_model(comment)
        sentiment_label = sentiment_result[0]['label']

        emotion = None
        emotion_result = self.emotion_model(comment)

        print(emotion_result)

        emotion_label = emotion_result[0]['label']
        if emotion_label in self.valid_emotions:
            emotion = emotion_label


        return {
            "sentiment": sentiment_label,
            "score": 1 if sentiment_label == "POSITIVE" else -1,
            "emotion": emotion if emotion else "others"
        }



