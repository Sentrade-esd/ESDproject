import React, { useState, useRef, useContext } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "Components/NavBar";

import { Input } from "reactstrap";
import "../Styles/global.css";

import { UncontrolledAlert } from "reactstrap";
import { AlertContext } from "../Components/AlertContext.js";
import { LoadingContext } from "../Components/LoadingContext.js";

function Search() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const searchInputRef = useRef();

  const clearSearch = () => {
    setSearch("");
    searchInputRef.current.focus();
    setResults([]);
  };

  const { alert, setAlert } = useContext(AlertContext);
  const { isLoading, setIsLoading } = useContext(LoadingContext);

  const navigate = useNavigate();

  const goToNewPage = () => {
    navigate("/trade");
  };

  const performSearch = async (query) => {
    // TQXOA5D8XQ2ATY3J Using in Transaction right now
    // GIC3VJ1I8N8DXJAO Using in Transaction right now
    // YJ3Q75JEFR08G0VB
    // FIYS7MOLA3SBBAK0
    // GIEADKJM8OSQN0AR Using in Transaction right now
    // D0I97I0VKG0GRK4O Using in UI search right now
    const API_KEY = "D0I97I0VKG0GRK4O";
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
      const usResults = response.data.bestMatches.filter(
        (match) => match["4. region"] === "United States"
      );

      // Return new array where match a single element from the usResults array in each iteration.
      console.log(usResults);
      console.log(usResults.data);
      //For each match access the value of the property '2. name'. Which is the comapny name
      // return usResults.map(match => match['2. name']) || [];
      return (
        usResults.map((match) => ({
          name: match["2. name"],
          symbol: match["1. symbol"],
        })) || []
      );
    } catch (error) {
      console.log("caught");
      // If there's any other error, set the state to show the error message on the screen
      setResults(["Error retrieving search results: " + error.message]);
      return;
    }
  };

  const handleInputChange = (e) => {
    console.log(e.target.value);
    setSearch(e.target.value);
  };

  const handleInputKeyDown = async (e) => {
    if (e.key === "Enter") {
      const value = e.target.value.trim();
      if (value !== "") {
        const words = value.split(" ").filter((val) => val.length);
        let wordResults = [];
        for (let word of words) {
          const res = await performSearch(word);
          wordResults = [...wordResults, ...res];
        }
        setResults(wordResults);
      } else {
        setResults([]);
      }
    }
  };

  const handleSearchButtonClick = async () => {
    const value = search.trim(); // Assuming 'search' is your search query state
    if (value !== "") {
      const words = value.split(" ").filter((val) => val.length);
      let wordResults = [];
      for (let word of words) {
        const res = await performSearch(word);
        wordResults = [...wordResults, ...res];
      }
      setResults(wordResults);
    } else {
      setResults([]);
    }
  };

  const selectCompany = (companyName, companySymbol) => {
    console.log(companyName + " - " + companySymbol);

    // localStorage.setItem('companyName', companyName);
    // localStorage.setItem('companySymbol', companySymbol);

    companyName = "Apple Inc.";
    companySymbol = "AAPL";
    // Navigate to the Trade page using state
    navigate("/trade", {
      state: { companyName, companySymbol },
    });
  };

  const sendScraper = (companySymbol) => {};

  const sendSentiment = (companyName, companySymbol) => {};

  const getComments = (companyName) => {};

  return (
    <>
      {isLoading ? (
        <UncontrolledAlert
          className="alert-with-icon"
          id="noMargin"
          color="info"
          backgroundColor="info"
        >
          <span>
            <b>Loading -</b>
            Following Trades...
          </span>
        </UncontrolledAlert>
      ) : (
        alert && (
          <UncontrolledAlert
            className="alert-with-icon alert-success"
            id="noMargin"
            backgroundColor="success"
          >
            <b>Transaction -</b>
            <span dangerouslySetInnerHTML={{ __html: alert }}></span>
          </UncontrolledAlert>
        )
      )}
      <div className="page-header" style={{ backgroundColor: "#1D304f" }}>
        <img
          alt="..."
          className="path path3"
          src={require("Assets/img/logo-nav.png")}
        />
        <svg className="hidden">
          {/* All deco shapes */}
          <defs>
            <path
              d="M292,517.91s-15.55-56.18-82.16-38.13C144.29,497.54,155.58,363.16,162,313.12S224.89,15.59,387.71,4.49,515.3,133.38,499.28,174.22s-48.71,85.09,11,218.26S455,582.74,430.06,588.37,339.71,621.12,292,517.91Z"
              id="deco2"
            />
          </defs>
        </svg>
        <div className="content-center">
          <Container>
            <Row className="align-items-center text-left">
              <Col className="ml-auto mr-auto" lg="6" md="8" xs="12">
                <h1 className="title">
                  Search for <br />
                  <strong style={{ color: "#CF50DD" }}>a Company</strong>
                </h1>
                <p className="description">
                  Fetch Sentiments and Senator Filings
                </p>
                <Row className="row-input">
                  <Col className="mt-1" md="8" xs="6">
                    <Input
                      aria-label="Your company search"
                      id="companySearch"
                      // name="email"
                      placeholder="Enter Company Name or Ticker"
                      value={search}
                      onChange={handleInputChange}
                      onKeyDown={handleInputKeyDown}
                      ref={searchInputRef}
                      type="search"
                    />
                  </Col>
                  <Col md="4" xs="6">
                    <Button
                      color="warning"
                      onClick={
                        handleSearchButtonClick
                        // selectCompany
                      }
                    >
                      Search
                    </Button>
                  </Col>
                </Row>
                <Row style={{ paddingTop: "10px" }}>
                  {results.map((result, index) => {
                    return (
                      <Row key={index}>
                        <Col>
                          <Button
                            style={{ backgroundColor: "#1D304f" }}
                            onClick={() =>
                              selectCompany(result.name, result.symbol)
                            }
                            className="companyResultButton"
                          >
                            {result.name} - {result.symbol}
                          </Button>
                        </Col>
                      </Row>
                    );
                  })}
                </Row>
              </Col>
              <Col className="ml-auto mr-auto" lg="6" md="8" xs="12">
                {/* SVG Illustration */}
                <figure className="ie-non-standard-hero-shape">
                  <svg
                    className="injected-svg js-svg-injector"
                    data-img-paths={
                      "[{&quot;targetId&quot;: &quot;#imageShape1&quot;, &quot;newPath&quot;: &quot;" +
                      require("Assets/img/logo-nav.png") +
                      "&quot;},{&quot;targetId&quot;: &quot;#imageShape2&quot;, &quot;newPath&quot;: &quot;" +
                      require("Assets/img/logo-nav.png") +
                      "&quot;}]"
                    }
                    data-parent="#SVGNonStandardHeroShape"
                    style={{ enableBackground: "new 10 12 878.9 907" }}
                    viewBox="10 12 878.9 907"
                    x="0px"
                    y="0px"
                    xmlSpace="preserve"
                  >
                    <g>
                      <defs>
                        <path
                          d="M299.27,772.72s-24.67-76.08-131.42-51.33C62.82,745.74,81.48,563.56,92,495.71S193.94,92.18,454.77,76.46,658.58,250.62,632.75,306s-78.37,115.53,16.76,295.77-89.33,258.1-129.36,265.84S375.3,912.41,299.27,772.72Z"
                          id="firstShape"
                        />
                      </defs>
                      <clipPath id="secondShape">
                        <use
                          style={{ overflow: "visible" }}
                          xlinkHref="#firstShape"
                        />
                      </clipPath>
                      <g clipPath="url(#secondShape)">
                        <image
                          height="1000"
                          id="imageShape1"
                          style={{ overflow: "visible" }}
                          transform="matrix(0.9488 0 0 0.9488 25 53.1187)"
                          width="1000"
                          xlinkHref={require("Assets/img/company.png")}
                        />
                      </g>
                    </g>
                    <g>
                      <defs>
                        <path
                          d="M741.49,643q-2.58-.31-5.17-.4c-12-.45-46.58-14.37-79.24-71.85-17.81-31.35-47.32-96.41-37.88-167.21,7.84-58.79,38.38-97.1,48.34-130.64,24.82-83.61,66.62-77.07,98-77.07,15.93,0,31.1,14.82,39.21,26.39,11.55,16.48,19.72,46.24-9.1,93.32-60.66,99.07,14.09,139.33-.93,239.68C781.72,641.8,750,644,741.49,643Z"
                          id="thirdShape"
                        />
                      </defs>
                      <clipPath id="fourthShape">
                        <use
                          style={{ overflow: "visible" }}
                          xlinkHref="#thirdShape"
                        />
                      </clipPath>
                      <g
                        clipPath="url(#fourthShape)"
                        transform="matrix(1 0 0 1 0 0)"
                      >
                        <image
                          height="1000"
                          id="imageShape2"
                          style={{ overflow: "visible" }}
                          transform="matrix(0.9488 0 0 0.9488 25 53.1187)"
                          width="1000"
                          xlinkHref={require("Assets/img/company.png")}
                        />
                      </g>
                    </g>
                  </svg>
                </figure>
                {/* End SVG Illustration */}
              </Col>
            </Row>
          </Container>
        </div>
      </div>
      {/* <Container>
            <Row className="justify-content-center">
                <Col md={10} lg={10}>
                    <h1>Search for company information</h1>
                    <div className="input-group rounded" role="search">
                        <input id="companySearch" type="search" className="form-control rounded" placeholder="Search for a Company here to find out more about it!"
                        value={search} onChange={handleInputChange} onKeyDown={handleInputKeyDown} ref={searchInputRef}/>
                        <button onClick={clearSearch} className="input-group-text border-0" id="search-addon">
                            <i className="fas fa-search" aria-hidden="true"></i>
                        </button>
                    </div>

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
        </Container> */}
    </>
  );
}

// Call scraper pass the ticker ONLY (Price and Newsheadline returning).
// For Sentiment, send company name and ticker
// Call comments, sennd company, get last 5 comments store in local storage. Is fetched as array.

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

{
  /* <input type="search" className="form-control rounded" placeholder="Search for a Company here to find out more about it!"
value={search} onChange={handleSearchChange} ref={searchInputRef} /> */
}
