import React, { useState, useRef } from 'react';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button } from 'react-bootstrap'
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';


function Search() {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const searchInputRef = useRef();

    const clearSearch = () => {
        setSearch('');
        searchInputRef.current.focus();
        setResults([]);
    };

    const navigate = useNavigate();

    const goToNewPage = () => {
        navigate("/trade"); 
    };


    const performSearch = async(query) => {
        // TQXOA5D8XQ2ATY3J
        // GIC3VJ1I8N8DXJAO
        // YJ3Q75JEFR08G0VB
        // FIYS7MOLA3SBBAK0
        // GIEADKJM8OSQN0AR
        // D0I97I0VKG0GRK4O
        const API_KEY = 'D0I97I0VKG0GRK4O';
        const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`;
    
        try {
            const response = await axios.get(searchUrl);
            console.log(response.data.Information);
            if (response.data.Information) {
                setResults([response.data.Information]);
                console.log("Info get");
                return;
            }
            console.log("Working");
            // Check for US ONLY, TODO(?): Let user set the limit of results returned
            const usResults = response.data.bestMatches.filter(match => match['4. region'] === 'United States');
            
            // Return new array where match a single element from the usResults array in each iteration. 
            console.log(usResults);
            console.log(usResults.data);
            //For each match access the value of the property '2. name'. Which is the comapny name 
            // return usResults.map(match => match['2. name']) || []; 
            return usResults.map(match => ({ name: match['2. name'], symbol: match['1. symbol'] })) || [];
            
            
        } catch (error) {
            console.log("caught");
            // If there's any other error, set the state to show the error message on the screen
            setResults(['Error retrieving search results: ' + error.message]);
            return;
            
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

    const selectCompany = (companyName, companySymbol) => {
        console.log(companyName + ' - ' + companySymbol);

        sessionStorage.setItem('companyName', companyName);
        sessionStorage.setItem('companySymbol', companySymbol);

        // Navigate to the Trade page using state
        navigate("/trade", {
            state: { companyName, companySymbol },
        });
    };

    return (
        <Container>
        <Row className="justify-content-center">
            <Col md={10} lg={10}>
                {/* <h1 id='searchInstruction'>Just imagine the search box works</h1> */}
                <h1>Search for company information</h1>
                <div className="input-group rounded" role="search">
                    {/* <label htmlFor="companySearch">Search for company information</label> */}
                    <input id="companySearch" type="search" className="form-control rounded" placeholder="Search for a Company here to find out more about it!"
                    value={search} onChange={handleInputChange} onKeyDown={handleInputKeyDown} ref={searchInputRef}/>
                    <button onClick={clearSearch} className="input-group-text border-0" id="search-addon">
                        <i className="fas fa-search" aria-hidden="true"></i>
                    </button>
                </div>
                {/* <div className="companyResults" aria-live='polite'>
                    {results.map((result, index) => 
                        <Button key={index} onClick={() => selectCompany(result)} className="companyResultButton">{result}</Button>
                    )}
                </div> */}


                {results.map((result, index) => 
                    <Row key={index}>
                        <Col>        
                            <Button 
                                onClick={() => selectCompany(result.name, result.symbol)} 
                                className="companyResultButton">
                                {result.name} - {result.symbol}
                            </Button>
                        </Col>
                    </Row>
                )}

            </Col>
        </Row>
    </Container>
    )
  }
  
  export default Search;


// This was old code that would dynamically udpate the companies listed as you typed
// But since each letter was basically 1 API call, not using
// Just in case we want to reuse it, alson need to modify the input
// const handleSearchChange = async(e) => {
//     const value = e.target.value;  // 1
//     setSearch(value);  // 2
//     if (value) {  // 3
//         const res = await performSearch(value);  // 4
//         setResults(res || ['No results found']);  // 5
//     } else {
//         setResults([]);  // 6
//     }
// };


{/* <input type="search" className="form-control rounded" placeholder="Search for a Company here to find out more about it!"
value={search} onChange={handleSearchChange} ref={searchInputRef} /> */}