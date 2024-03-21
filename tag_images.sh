#!/bin/bash

# Define your Docker Hub username
USERNAME="nmywrld"

# Define the names of your Docker images
IMAGES=("userservices-user_service" "userservices-user_db" "sentimentservice-sentiment_app" "sentimentservice-sentiment_service" "rabbitmq-rabbitmq" "notificationservice-notification_manager" "kongservice-kong" "notificationservice-telebot" "notificationservice-watchlist" "notificationservice-watchlist_db" "sentimentservice-sentiment_db")

# Define the tags you want to assign to the images
TAGS=("tag1" "tag2" "tag3" "tag4" "tag5" "tag6" "tag7" "tag8" "tag9" "tag10")

# Loop through each image and tag combination
for ((i=0; i<${#IMAGES[@]}; i++)); do

    ####### TAG for ARM #######
    # docker tag "${IMAGES[$i]}" "$USERNAME/arm/${IMAGES[$i]}:latest"
    # docker push "$USERNAME/arm/${IMAGES[$i]}:latest"

    ####### TAG for x86 #######
    docker tag "${IMAGES[$i]}" "$USERNAME/${IMAGES[$i]}:latest"
    docker push "$USERNAME/${IMAGES[$i]}:latest"


    # docker push "$IMAGES[$i]:latest"
done
