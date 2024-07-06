# SenTrade

No special installations required! dockerfile scripts will handle all dependancies

Run Docker Desktop

this script will run the following services and respective ports on the HOST device
<br> ensure that these ports are not being used:

- Kong Service: 8000, 8001
- Prometheus: 8090
- Grafana: 8100
- Watchlist: 3000
- Notification Manager: 3001
- Telebot: 3002
- Watchlist DB: 27019
- RabbitMQ: 5672, 15672
- Sentiment App: 5001
- Sentiment Service: 5002
- Scraper: 5000
- Sentiment DB: 27017
- Scraper DB: 27018
- User Service: 6000
- User DB: 5432
- Comments Service: 6001
- Comments DB: 27020
- Transactions: 6002
- Transactions DB: 5433
- Follow Trades: 4001
- Senator Filings: 4002
- App (UI): 9000

In your Visual Studio Code Terminal, at the root folder (the one with docker-compose-all.yml),
<br>
run the following commands in order:

1. docker compose -f docker-compose-all.yml build
   <br>
2. docker compose -f docker-compose-all.yml up -d

## if any of the build process cannot be completed

please run the following commands instead
<br>

- if you're on a x86/windows machine:

  1. docker compose -f docker-compose-amd.yml pull
     <br>
  2. docker compose -f docker-compose-amd.yml up -d

- if you're on an arm machine (mac m1):
  1. docker compose -f docker-compose-arm.yml pull
     <br>
  2. docker compose -f docker-compose-arm.yml up -d

## after deployment

UIs available for use

- APP ui: localhost:9000
- Grafana: localhost:8100
- Prometheus: localhost:8090
- RabbitMQ: localhost:15672

<br>
begin using the service after sentiment_service container displays the following 
- Some weights of the model checkpoint at cardiffnlp/twitter-roberta-base-sentiment-latest were not used when initializing RobertaForSequenceClassification: ['roberta.pooler.dense.bias', 'roberta.pooler.dense.weight']
- This IS expected if you are initializing RobertaForSequenceClassification from the checkpoint of a model trained on another task or with another architecture (e.g. initializing a BertForSequenceClassification model from a BertForPreTraining model).
- This IS NOT expected if you are initializing RobertaForSequenceClassification from the checkpoint of a model that you expect to be exactly identical (initializing a BertForSequenceClassification model from a BertForSequenceClassification model).
