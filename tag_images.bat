@echo off
set USERNAME=chernise
set IMAGES= esdproject-telebot esdproject-watchlist esdproject-follow_trades esdproject-comments_service esdproject-sentiment_service esdproject-senator_filings esdproject-scraper esdproject-sentiment_app esdproject-user_db esdproject-transactions_db esdproject-rabbitmq esdproject-user_service esdproject-transactions esdproject-notification_manager esdproject-sentiment_db esdproject-comments_db esdproject-scraper_db esdproject-watchlist_db esdproject-kong esdproject-app esdproject-grafana esdproject-prometheus
@REM set IMAGES=esdproject-telebot esdproject-app esdproject-sentiment_service


for %%i in (%IMAGES%) do (
    docker tag %%i %USERNAME%/%%i:latest
    docker push %USERNAME%/%%i:latest
)