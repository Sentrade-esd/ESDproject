import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsonData from '../test.json';
import WordCloud from 'react-wordcloud';
import { useLocation } from 'react-router-dom';

function Trade() {
    // const [data, setData] = useState(null);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             // const response = await axios.get('https://microservice-endpoint-url'); // This will be the microserivce eventually
    //             setData(response.data);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     fetchData();
    // }, []);

    // return (
    //     <div>
    //         <h2>New Page</h2>
    //         {data && (
    //             <div>
    //                 <p>{data.title}</p>
    //                 <p>{data.description}</p>
    //             </div>
    //         )}
    //     </div>
    // );
    
    // This is the company and ticker information coming over from search
    const location = useLocation();
    const companyName = location.state?.companyName;
    const companySymbol = location.state?.companySymbol;
    
    const keywordData = jsonData.result.keyword;

    // Convert the keyword data object into an array of objects with text and value properties
    const keywords = Object.entries(keywordData).map(([text, value]) => ({ text, value }));
    
    const options = {
        rotations: 0,
        rotationAngles: [0, 0],
        fontSizes: [24, 96],
    };

    const { search, sentiment_score } = jsonData.result;

    return (
        <div>
            <h2>{companyName}</h2>
            <p>Search Term: {companyName}</p>
            <p>Ticker: {companySymbol}</p>
            <p>Sentiment Score: {sentiment_score}</p>
            
            <div style={{width: '600px', height: '400px'}}>
                <WordCloud words={keywords} options={options} />
            </div>
        </div>
    );
}

export default Trade;