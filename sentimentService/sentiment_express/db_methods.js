import axios from "axios";

const db_methods = {

    sentiment_service_url: process.env.SENTIMENT_SERVICE_URL,

    add_sentiments: async (json_data) => {

        return new Promise((resolve, reject) => {
            // let sentiment_results = null;
            // let keyword_results = null;

            try {
                axios.post(db_methods.sentiment_service_url + "/analyse_headlines", json_data)
                .then(response => {
                    console.log("analyse headlines is valid");
                    console.log(response.data);
                    
                    resolve(response.data);
                    // sentiment_results = response.data;
                    // resolve(sentiment_results)
                })
                .catch(error => {
                    console.log("analyse headlines failed");
                    reject(error);
                });

                // axios.post(db_methods.sentiment_service_url + "/analyse_keywords", json_data)

                
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
                axios.post(db_methods.sentiment_service_url + "/analyse_comment", {"comment":comment})
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

    scraper: async (search_term) => {
        // const url = "http://localhost:5000/api/scraper";
        // const response = await axios.get(url, {
        //     params: {
        //         search_term: search_term
        //     }
        // });

        // return response;
        return [
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
        ]        
    }

};

export default db_methods;