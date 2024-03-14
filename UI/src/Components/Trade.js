import React, { useState, useRef } from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button } from 'react-bootstrap'
import axios from 'axios';


function Trade(){
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const searchInputRef = useRef();

    const handleBuy = (companyName) => {
        // here you will handle the buying operation for the selected company
        console.log('Buying shares for ' + companyName);
      };
    
      const handleSell = (companyName) => {
        // here you will handle the sell operation for the selected company
        console.log('Selling shares for ' + companyName);
      };
    


    const clearSearch = () => {
        setSearch('');
        searchInputRef.current.focus();
        setResults([]);
    };


    const performSearch = async(query) => {
        const API_KEY = 'GIC3VJ1I8N8DXJAO';
        const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`;
    
        try {
            const response = await axios.get(searchUrl);
            // console.log(response.data.Information);
            if (response.data.Information) {  //Information is only returned on rate limit reached
                setResults([response.data.Information]);
                return
            }
            console.log("working");
            // Check for US ONLY, TODO(?): Let user set the limit of results returned
            const usResults = response.data.bestMatches.filter(match => match['4. region'] === 'United States');
            // Return new array where match a single element from the usResults array in each iteration. 
            //For each match (which is likely an object based on the usage), it accesses the value of the property '2. name'. Which is the comapny name 
            console.log(usResults);
            console.log(usResults.data);
            return usResults.map(match => match['2. name']) || []; 
            
        } catch (error) {
            console.log("caught");
            // If there's any other error, set the state to show the error message on the screen
            setResults(['Error retrieving search results: ' + error.message]);
            return
            
        }
    }


    const handleInputChange = (e) => {
        setSearch(e.target.value);
    };


    const handleInputKeyDown = async(e) => {
        if (e.key === 'Enter') {
            const value = e.target.value.trim();
            if (value !== '') {
                const words = value.split(' ').filter(val => val.length);
                let wordResults = [];
                for(let word of words){
                    const res = await performSearch(word);
                    wordResults = [...wordResults, ...res];
                }
                setResults(wordResults);
            } else {
                setResults([]);
            }
        }
    };

    const selectCompany = (companyName) => {
        // here you will handle company selection, maybe navigate to a detailed company page, etc.
        console.log(companyName + ' selected');
     };

    return (
        <Container>
        <Row className="justify-content-center">
            <Col md={10} lg={10}>
                <h1>Search for companies to trade!</h1>
                <div className="input-group rounded" role="search">
                    <input 
                        id="companySearch" 
                        type="search" 
                        className="form-control rounded" 
                        placeholder="Search for a Company or its ticker to find it"
                        value={search} 
                        onChange={handleInputChange} 
                        onKeyDown={handleInputKeyDown} 
                        ref={searchInputRef}
                    />
                    <button onClick={clearSearch} className="input-group-text border-0" id="search-addon">
                        <i className="fas fa-search" aria-hidden="true"></i>
                    </button>
                </div>

                {results.map((result, index) => 
                        <Row key={index} className="my-2 align-items-center">
                            <Col className="d-flex justify-content-between">
                                <span>{result}</span>
                                <div>
                                    <Button onClick={() => handleBuy(result)} className="companyResultButton mx-2">Buy</Button>
                                    <Button onClick={() => handleSell(result)} className="companyResultButton">Sell</Button>
                                </div>
                            </Col>
                        </Row>
                    )}
            </Col>
        </Row>
    </Container>
    )
  }
  
  export default Trade;
