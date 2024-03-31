import axios from "axios";
import amqplib from "amqplib";

import { Comment } from "./db_model.js";
import { ElementNotSelectableError } from "selenium-webdriver/lib/error.js";

// async function createConnection() {
//     let connection = await amqplib.connect(sentiment_methods.amqpServer);
//     return connection;
//   }

const sentiment_methods = {

    sentiment_service_url: process.env.SENTIMENT_SERVICE_URL,
    amqpServer: process.env.AMQP_SERVER,
    scraper_url: process.env.SCRAPER_URL,
    transactions_url: process.env.TRANSACTIONS_URL,

    connection: null,
    channel: null,

    // init: function() {
    //     return new Promise((resolve, reject) => {
    //       amqplib.connect(sentiment_methods.amqpServer)
    //         .then(connection => {
    //           this.connection = connection;
    //           resolve();
    //         })
    //         .catch(error => {
    //           console.error('Error connecting to AMQPlib:', error);
    //           reject(error);
    //         });
    //     });
    // },

    // save_data: async (data, retries = 5, delay = 15000) => {
    //     // console.log('Attempting to save data');
    //     try {
    //         await data.save();
    //         // console.log('Data saved successfully');
    //         return;
    //     } catch (error) {
    //         console.error('Initial save failed', error);
    //     }

    //     // If the initial save fails, start the interval
    //     const intervalId = setInterval(async () => {
    //         // console.log('Attempting to save data');
    //         try {
    //             await data.save();
    //             // console.log('Data saved successfully');
    //             clearInterval(intervalId); // If save is successful, clear the interval
    //         } catch (error) {
    //             console.error(`Save failed, retrying in ${delay}ms`, error);
    //         }
    //     }, delay);
    // },

    combine_emotions : async (a, b) => {
        let result = {...a};

        for (let key in b) {
            if (result.hasOwnProperty(key)) {
                result[key] += b[key];
            } else {
                result[key] = b[key];
            }
        }

        return result;
    },

    upsert_data: async (collection, filter, replacement) => {
        // console.log('Attempting to upsert data');
        try {
            const doc = await collection.findOneAndReplace(
                filter, 
                replacement, 
                { new: true, upsert: true }
            );
            // console.log('Document replaced or inserted: ', doc);
            return doc;
        } catch (err) {
            console.error(err);
            console.log("Retrying in 5 seconds...");
            setTimeout(() => sentiment_methods.upsert_data(collection, filter, replacement), 5000);
        }
    },
    
    start_amqp: () => {
        return new Promise((resolve, reject) => {
            const start = async () => {
                try {
                    sentiment_methods.connection = await amqplib.connect(sentiment_methods.amqpServer);
                    sentiment_methods.channel = await sentiment_methods.connection.createChannel();
    
                    sentiment_methods.connection.on('error', async (err) => {
                        if (err.message !== 'Connection closing') {
                            console.error('[AMQP] conn error', err.message);
                        }
                    });
    
                    sentiment_methods.connection.on('close', () => {
                        console.error('[AMQP] reconnecting');
                        return setTimeout(start, 10000);
                    });
    
                    console.log('[AMQP] connected');
                    resolve();
                } catch (err) {
                    console.error('[AMQP] could not connect', err.message);
                    return setTimeout(start, 10000);
                }
            };
            start();
        });
    },


    add_sentiments: async (json_data) => {

        return new Promise((resolve, reject) => {
            // let sentiment_results = null;
            // let keyword_results = null;

            try {
                axios.post(sentiment_methods.sentiment_service_url + "/analyse_headlines", json_data)
                .then(response => {
                    console.log("analyse headlines is valid");
                    // console.log(response.data);
                    
                    resolve(response.data);
                    // sentiment_results = response.data;
                    // resolve(sentiment_results)
                })
                .catch(error => {
                    console.log("analyse headlines failed");
                    reject(error);
                });

                // axios.post(sentiment_methods.sentiment_service_url + "/analyse_keywords", json_data)

                
            } catch (error) {
                console.log("method failed");
                reject(error);
            }
        })


    },

    analyse_comment: async (comment) => {

        return new Promise((resolve, reject) => {
            try {
                // console.log(comment);
                console.log(sentiment_methods.sentiment_service_url)
                axios.post(sentiment_methods.sentiment_service_url + "/analyse_comment", {"comment":comment})
                .then(response => {
                    console.log("analyse comment is valid");

                    console.log("method");
                    console.log(response.data);
                    
                    resolve(response.data);
                })
                .catch(error => {
                    console.log("analyse comment failed");
                    reject(error);
                });
            } catch (error) {
                console.log("method failed");
                reject(error);
            }
        })
    },

    produceNotification: async (json_data) => {
        try {
            console.log('Producing notification');
            
            const exchange = 'notifications_exchange'; 
            const queue = 'sentiment_notification_queue';
            const routingKey = 'notify';
          
            sentiment_methods.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(json_data)), { persistent: true });
            console.log('Message sent to RabbitMQ');
            
          } catch (error) {
            console.error('An error occurred:', error);
            setTimeout(() => {
                sentiment_methods.produceNotification(json_data);
            }, 10000); // Retry after 10 seconds
        }

    },

    stoplossRetryQueue: async (json_data) => {
        try {
            console.log('inserting into retry queue');

            const exchange = 'stoploss_retry_exchange';
            const queue = 'stoploss_retry_queue';
            const routingKey = 'stoploss';

            sentiment_methods.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(json_data)), { persistent: true });
            console.log('Message sent to RabbitMQ');

        } catch (error) {
            console.error('An error occurred:', error);
            setTimeout(() => {
                sentiment_methods.stoplossRetryQueue(json_data);
            }, 10000); // Retry after 10 seconds
        }
    },

    consumeNotification: async () => {

        // try {
        console.log('Consuming notification');
        const exchange = 'comments_exchange';
        const queue = 'new_comment_queue';
        const routingKey = 'comment';

        // let temp1 = await channel.assertExchange(exchange, 'direct', { durable: true });
        // await channel.assertQueue(queue, { durable: true });

        sentiment_methods.channel.consume(queue, async (message) => {
            const content = JSON.parse(message.content.toString());
            const search_term = content.company;
            const comment = content.comment;

            const results = await sentiment_methods.analyse_comment(comment);

            try {
                // chekc if DB has a record
                let exisiting_comments = await Comment.findOne({search: search_term});
    
                if (exisiting_comments) {
    
                    if ((Date.now() - exisiting_comments.datetime) / 1000 < 86400){
                        
                        console.log("comment exists");
    
                        exisiting_comments.sentiment_score += results.score;

                        if (exisiting_comments.emotion[results.emotion] == undefined) {
                            exisiting_comments.emotion[results.emotion] = 0;
                        }

                        exisiting_comments.emotion[results.emotion] += 1;
        
                        // let updateComment = await Comment.replaceOne({_id: exisiting_comments.id}, {
                        //     datetime: exisiting_comments.datetime,
                        //     search: exisiting_comments.search,
                        //     sentiment_score: exisiting_comments.sentiment_score,
                        //     emotion: exisiting_comments.emotion
                        // });
        
                        // console.log("saving existing comment");
    
                        // upsert
                        const filter = { search: search_term };
                        const replacement = {
                            datetime: exisiting_comments.datetime,
                            search: exisiting_comments.search,
                            sentiment_score: exisiting_comments.sentiment_score,
                            emotion: exisiting_comments.emotion
                        };

                        console.log (replacement)
    
                        sentiment_methods.upsert_data(Comment, filter, replacement);
                        // return res.json({ result: exisiting_comments });
                    } else {
                        console.log("comment in db expired");
                        await Comment.deleteOne({search: search_term});

                        // let newComment = new Comment({
                        //     datetime: Date.now(),
                        //     search: search_term,
                        //     sentiment_score: results.score,
                        //     // emotion: {"joy":0, "others":0, "surprise":0, "sadness":0, "fear":0, "anger":0, "disgust":0, "love":0}
                        //     emotion: {"anger": 0, "joy": 0, "sadness": 0, "optimism": 0}
                        // });

                        // newComment.emotion[results.emotion] += 1;

                        // console.log("saving new comment");
                        // // await newComment.save();
                        // sentiment_methods.save_data(newComment);

                        // upsert 
                        const filter = { search: search_term };
                        const replacement = {
                            datetime: Date.now(),
                            search: search_term,
                            sentiment_score: results.score,
                            emotion: {}
                        };

                        replacement.sentiment_score += results.score;
                        if (replacement.emotion[results.emotion] == undefined) {
                            replacement.emotion[results.emotion] = 0;
                        }

                        replacement.emotion[results.emotion] += 1;

                        sentiment_methods.upsert_data(Comment, filter, replacement);
    
                        // return res.json({ result: newComment });
                    }
                } else {
                    // if no record exists, create a new one
                    // let newComment = new Comment({
                    //     datetime: Date.now(),
                    //     search: search_term,
                    //     sentiment_score: results.score,
                    //     // emotion: {"joy":0, "others":0, "surprise":0, "sadness":0, "fear":0, "anger":0, "disgust":0, "love":0}
                    //     emotion: {"anger": 0, "joy": 0, "sadness": 0, "optimism": 0},
                    // });
        
                    // newComment.emotion[results.emotion] += 1;
        
                    // console.log("saving new comment");
                    // // await newComment.save();
                    // sentiment_methods.save_data(newComment);

                    // upsert
                    const filter = { search: search_term };
                    const replacement = {
                        datetime: Date.now(),
                        search: search_term,
                        sentiment_score: results.score,
                        emotion: {}
                    };

                    replacement.sentiment_score += results.score;
                    if (replacement.emotion[results.emotion] == undefined) {
                        replacement.emotion[results.emotion] = 0;
                    }

                    replacement.emotion[results.emotion] += 1;

                    sentiment_methods.upsert_data(Comment, filter, replacement);
                }
                sentiment_methods.channel.ack(message);
    
            } catch (error) {
                console.error('An error occurred:', error);
            }

        });




        //   } catch (error) {
        //     console.error('An error occurred:', error);
        //   }
    },

    consumeStoplossRetry: async () => {
        console.log('Consuming stoploss retry');

        const exchange = 'stoploss_retry_exchange';
        const queue = 'stoploss_retry_queue';
        const routingKey = 'stoploss';

        const waitingExchange = 'stoploss_waiting_exchange';
        const waitingQueue = 'stoploss_waiting_queue';

        sentiment_methods.channel.consume(queue, async (message) => {
            const content = JSON.parse(message.content.toString());
            const search = content.search;
            const size = content.size;

            try {
                sentiment_methods.getCurrentPrice(search)
                .then(response => {
                    try {
                        sentiment_methods.triggerStoploss(search, size, response.data);
                        sentiment_methods.channel.ack(message);
                    } catch (error) {
                        console.error('error triggering stoploss', error);
                        sentiment_methods.channel.nack(message, false, false);
                        sentiment_methods.channel.publish(waitingExchange, routingKey, message.content);
                    }
                })
                .catch(error => {
                    console.error('Error fetching current price:', error);
                    sentiment_methods.channel.nack(message, false, false);
                    sentiment_methods.channel.publish(waitingExchange, routingKey, message.content);
                });
            } catch (error) {
                console.error('An error occurred:', error);
            }
        });
    },

    scraper: async (search_term, ticker) => {
        const url = `${sentiment_methods.scraper_url}/scraper/getNews/${search_term}/${ticker}`;

        const response = await axios.get(url);
        // console.log(response);

        // json parse response.data
        const data = response.data;
        // console.log(data);

        // for each item in data, parse it
        let headlinesArray = [];
        let UIArray = [];

        for (let i = 0; i < data.length; i++) {
            let newsObject = data[i];
            delete newsObject.i;
            // let parsed_news = await sentiment_methods.parse_scraper(newsObject);
            let copy_news = { ...newsObject };
            delete newsObject.link
            
            headlinesArray.push(newsObject);
            UIArray.push(copy_news);
            // if (i == 50) break;
        }

        // console.log(headlinesArray);
        // console.log("====================================");
        // console.log(UIArray);

        return [headlinesArray, UIArray];
        // return [
        //     {
        //         "datetime" : "2024-01-28T04:50:27Z",
        //         "headline" : "Elon Musk joins Trump Republicans to slam rumored Senate border deal",
        //         "description" : "Elon Musk joined Donald Trump and Republican critics to denounce the contentious Senate border deal that President Joe Biden touted as the “toughest and fairest set of reforms.” “No laws need to be passed” to halt the US border crisis Musk the worlds riche…"
        //     },
        //     {
        //         "datetime" : "2024-01-28T00:10:36Z",
        //         "headline" : "Tesla battery explodes in Cary home after being removed and charged inside",
        //         "description" : "Tesla battery explodes in Cary home after being removed and charged insidewral.com"
        //     },
        //     {
        //         "datetime" : "2024-01-27T21:01:05Z",
        //         "headline" : "Here's why Biden's multi-billion-dollar EV charging program has short-circuited",
        //         "description" : "By Will Kessler Daily Caller News Foundation The Biden administration has designated billions of taxpayer dollars to build electric vehicle (EV) chargers but lagging market demand and government red tape are getting in the way according to experts who spoke"
        //     },
        //     {
        //         "datetime" : "2024-01-27T20:42:00Z",
        //         "headline" : "Who wants to be a trillionaire': The game show is nearing its climax",
        //         "description" : "A trillion dollars can purchase shares of all shares of McDonald's PepsiCo Coca-Cola and more. Elon Musk is predicted to become the first trillionaire by 2032 followed by  Bernard Arnault Jeff Bezos Larry Ellison and Wareen Buffett. The term 'trilliona"
        //     },
        //     {
        //         "datetime": "2024-01-27T16:00:00Z",
        //         "headline": "ARGHH FUCK THIS",
        //         "description" : "test"
        //     }
        // ]        
    },

    parse_scraper: async (newsObject) => {
        const pubDate = new Date(newsObject.pubDate[0]).toDateString();

        // Extract the title
        const title = newsObject.title[0];

        // Extract the link
        const link = newsObject.link[0];

        // Create the output object
        const result = {
            datetime: pubDate,
            headline: title.replace(/ - .*/, ''), // Remove everything after " - "
            link: link
        };

        return result
    },

    getNewsFromDB: async (ticker) => {
        const url = `${sentiment_methods.scraper_url}/scraper/getNewsFromDB/${ticker}`;

        const response = await axios.get(url);
        // console.log(response);

        // json parse response.data
        const data = response.data;

        return data
    },

    getCurrentPrice: async (company) => {
        const url = `${sentiment_methods.scraper_url}/scraper/scrapeCurrentPrice`;

        const response = await axios.get(url, { params: { company } });

        // console.log(response);

        return response;

    },

    triggerStoploss: async (search, size, currentPrice) => {
        const url = `${sentiment_methods.transactions_url}/transaction/trigger`;

        console.log("triggering stop loss: " + url);
        axios.post(url, { search, size, currentPrice });

    },

};

export default sentiment_methods;