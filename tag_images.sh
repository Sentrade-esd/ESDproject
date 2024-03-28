#!/bin/bash

# Define your Docker Hub username
USERNAME="chernise"

# Define the names of your Docker images
IMAGES=("esdproject-telebot" "esdproject-watchlist" "esdproject-follow_trades" "esdproject-comments_service" "esdproject-senator_filings" "esdproject-scraper" "esdproject-sentiment_app" "esdproject-sentiment_service" "esdproject-user_db" "esdproject-transactions_db" "esdproject-rabbitmq" "esdproject-user_service" "esdproject-transactions" "esdproject-notification_manager" "esdproject-sentiment_db" "esdproject-comments_db" "esdproject-scraper_db" "esdproject-watchlist_db" "esdproject-kong")


# Loop through each image and tag combination
for ((i=0; i<${#IMAGES[@]}; i++)); do

    docker tag "${IMAGES[$i]}" "$USERNAME/${IMAGES[$i]}:latest"
    docker push "$USERNAME/${IMAGES[$i]}:latest"


    # docker push "$IMAGES[$i]:latest"
done
