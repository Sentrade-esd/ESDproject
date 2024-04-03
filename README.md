# ESDproject

Run Docker Desktop

In your Visual Studio Code Terminal, run the following commands in order:

docker compose -f docker-compose-all.yml build
Then
docker compose -f docker-compose-all.yml up -d


## Launch sequence
1. rabbitMQ
2. Sentiment service
3. notification service 
4. Follow trades
5. User services
6. Kong
