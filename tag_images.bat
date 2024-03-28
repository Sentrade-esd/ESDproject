@echo off
set USERNAME=chernise
set IMAGES=esdproject-telebot esdproject-watchlist esdproject-follow_trades esdproject-comments_service esdproject-senator_filings esdproject-scraper esdproject-sentiment_app esdproject-sentiment_service esdproject-user_db esdproject-transactions_db esdproject-rabbitmq esdproject-user_service esdproject-transactions esdproject-notification_manager esdproject-sentiment_db esdproject-comments_db esdproject-scraper_db esdproject-watchlist_db esdproject-kong

for %%i in (%IMAGES%) do (
    docker tag %%i %USERNAME%/%%i:latest
    docker push %USERNAME%/%%i:latest
)