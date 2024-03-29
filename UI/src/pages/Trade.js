import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsonData from '../test.json';
// import WordCloud from 'react-wordcloud';
import { useLocation } from 'react-router-dom';
import { Form, 
    // Button 
} from 'react-bootstrap';
import WordCloud from '../Components/wordCloud.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import Select from "react";

import {
    Button,
    // Card,
    // CardBody,
    // CardFooter,
    // CardLink,
    // CardTitle,
    Media,
    Input,
    InputGroup,
    Container,
    Row,
    Col,
    UncontrolledTooltip,
    Carousel,
    CarouselItem,
    CarouselIndicators,

  } from "reactstrap";

  const items = [
    {
      content: (
        <img
          alt="..."
          className="d-block"
          src={require("Assets/img/shirt.png")}
        />
      ),
      altText: "",
      caption: "",
      src: "0",
    },
    {
      content: (
        <img
          alt="..."
          className="d-block"
          src={require("Assets/img/shorts.png")}
        />
      ),
      altText: "",
      caption: "",
      src: "1",
    },
    {
      content: (
        <img
          alt="..."

          className="d-block"
          src={require("Assets/img/tshirt.png")}
        />
      ),
      altText: "",
      caption: "",
      src: "2",
    },
  ];

function Trade() {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [animating, setAnimating] = React.useState(false);
    const [quantity, setQuantity] = React.useState(1);
    const wrapper = React.useRef(null);
    // React.useEffect(() => {
    //   document.documentElement.scrollTop = 0;
    //   document.scrollingElement.scrollTop = 0;
    //   wrapper.current.scrollTop = 0;
    //   document.body.classList.add("product-page");
    //   return function cleanup() {
    //     document.body.classList.remove("product-page");
    //   };
    // }, []);
    const onExiting = () => {
      setAnimating(true);
    };
  
    const onExited = () => {
      setAnimating(false);
    };
  
    const next = () => {
      if (animating) return;
      const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
      setActiveIndex(nextIndex);
    };
  
    const previous = () => {
      if (animating) return;
      const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
      setActiveIndex(nextIndex);
    };
  
    const goToIndex = (newIndex) => {
      if (animating) return;
      setActiveIndex(newIndex);
    };
    const deleteQuantity = () => {
      setQuantity(quantity === 0 ? 0 : quantity - 1);
    };
    const addQuantity = () => {
      setQuantity(quantity === 100 ? 100 : quantity + 1);
    };


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

    const currentPrice = jsonData.result.currentPrice;
    const marketCap = jsonData.result.marketCap;
    const avgVolume = jsonData.result.avgVolume;
    const prevClose = jsonData.result.previousClose;
    const keywordData = jsonData.result.keyword;
    const emotionData = jsonData.result.emotion;


    // Convert the keyword data object into an array of objects with text and value properties
    const keywords = Object.entries(keywordData).map(([text, value]) => ({ text, value }));
    const emotions = Object.entries(emotionData).map(([text, value]) => ({ text, value }));

    console.log(marketCap, avgVolume, prevClose, keywordData, emotionData);
    
    const options = {
        rotations: 0,
        rotationAngles: [0, 0],
        fontSizes: [24, 96],
    };

    const { search, sentiment_score } = jsonData.result;

    const [comment, setComment] = useState('');

    const handleCommentSubmit = () => {
        var commentsArr = [];
        if(comment) {
           // Should send User ID and update the comments database through the endpoint provided by microservice
        //    console.log(comment);

           setComment('');
            // Company, Comment IF NOT SURE FOLLOW DOCS
            // When comment made, it comes in as array, need to shift right to add the new comment
            // Locally, the user will see all the comments he make plus the 5 from DB
            // Stored as dict key = company value = comment

        }
        localStorage.setItem("Comments",commentsArr.unshift(comment));

    };

    const handleFollowTrade = async() => {
        // Should be calling FollowTrades here
        // Store this email, ticker, targetDate, buyAmountPerFiling, maxBuyAmount and send

    };

    const handleBuyStock = async () => {
        // Should be calling Transaction here
        // Store company name, id, email, buy amount
        let url = "http://localhost:6002/transaction/newTrade";
        
        let data = {
            UserID: localStorage.getItem("id"),
            Email: localStorage.getItem("username"),
            Company: localStorage.getItem("companyName"),
            buyAmount: tradeAmount,
            Threshold: threshold
        }

        try {
            let response = await axios.post(url, data);
            console.log(response.data);
            alert('Transaction successful');
        } catch (error) {
            console.error(error);
            alert('Unable to process the transaction');
        }
    };

    const handleSellStock = async () => {
        // Should be calling FollowTrades here
        // Store this email, ticker, targetDate, buyAmountPerFiling, maxBuyAmount and send
        let url = "http://localhost:6002/transaction/newTrade";
        
        let data = {
            UserID: localStorage.getItem("id"),
            Email: localStorage.getItem("username"),
            Company: localStorage.getItem("companyName"),
            buyAmount: tradeAmount
        }

        try {
            let response = await axios.post(url, data);
            console.log(response.data);
            alert('Transaction successful');
        } catch (error) {
            console.error(error);
            alert('Unable to process the transaction');
        }
    };

    const [tradeAmount, setTradeAmount] = useState(0);
    const [maxBuy, setMaxBuy] = useState(0);
    const [threshold, setStopLoss] = useState(0);

    const MyWordCloud = React.memo(({ words, options }) => 
    <div style={{width: '600px', height: '400px'}}>
        <WordCloud words={words} options={options} />
    </div>
);

const [startDate, setStartDate] = useState(new Date());
const endDate = new Date(); // Current date

    return (
        <>
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-md-6 mt-3">
                        <h2>{companyName}</h2>
                        <p>Search Term: {companyName}</p>
                        <p>Ticker: {companySymbol}</p>
                        <p>Sentiment Score: {sentiment_score}</p>

                        <Form.Group>
                            <Form.Control
                            type="number"
                            id="tradeAmount"
                            name="tradeAmount"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" onClick={handleBuyStock} className="mt-3">Buy Stock</Button>
                        <Button variant="primary" onClick={handleSellStock} className="mt-3">Sell Stock</Button>


                        <h3>Date Range:</h3>
                        <div>
                            Start Date: <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} maxDate={endDate} />
                        </div>
                        <div>
                            End Date: {endDate.toLocaleDateString()}
                        </div>
                        
                        <div>
                            <h3>Max buy amount per filling ($)</h3>
                        </div>
                        <Form.Group>
                            <Form.Control
                            type="number"
                            id="maxBuy"
                            name="maxBuy"
                            value={maxBuy}
                            onChange={(e) => setMaxBuy(e.target.value)}
                            />

                            <Form.Control
                                    type="number"
                                    id="stopLoss"
                                    name="stopLoss"
                                    min="0"
                                    max="100"
                                    step="5"
                                    aria-label="Stop Loss Input"
                                    onChange={(e) => setStopLoss(e.target.value)}
                                />
                        </Form.Group>

                        <Button variant="primary" onClick={handleFollowTrade} className="mt-3">Follow Trade</Button>
                        
                    </div>

                        {/* It will re-render everyime when someone types something in the comment box. Hard limitation of the library used.
                        Can be done with lower level libraries but is very time intensive. Leave it as is? */}
                    <div className="col-md-6">
                        <MyWordCloud words={emotions} options={options} />
                    </div>
                </div>
            </div>

            {/* <div style={{width: '600px', height: '400px'}}>
                <WordCloud words={emotions} options={options} />
            </div> */}

            <div className='container'>
              <h3>Comments:</h3>
              <div className="m-3 p-3 shadow-sm rounded bg-light">        
                  <Form.Group controlId="commentInput" className="mb-3">
                      <Form.Control 
                          as="textarea" 
                          placeholder="Leave a comment..." 
                          rows={3}
                          className="mb-3"
                          value={comment} 
                          onChange={e => setComment(e.target.value)}
                          aria-label="Input comment here"
                      />
                      <Button variant="primary" onClick={handleCommentSubmit} className="float-end">Submit</Button>
                  </Form.Group>
              </div>
            </div>
        </div>

        <div className="section"  style={{backgroundColor: "#6082B6"}}>
          <Container>
            <Row>
              <Col lg="6" md="12">
              <MyWordCloud words={emotions} options={options} />
              </Col>
              <Col className="mx-auto" lg="6" md="12">
                <h2 className="title">{companyName}</h2>
                <div className="stats stats-right">
                  <div className="stars text-warning">
                    <i>{companySymbol}</i>
                  </div>
                </div>
                <br />
                <h2 className="main-price" style={{color: "#ffffff"}}>${currentPrice}</h2>
                <p style={{ color: 'red' }}>Sentiment Score: {sentiment_score}</p>
                {/* <h5 className="category">Description</h5>
                <p className="description">
                  Eres' daring 'Grigri Fortune' swimsuit has the fit and
                  coverage of a bikini in a one-piece silhouette. This fuchsia
                  style is crafted from the label's sculpting peau douce fabric
                  and has flattering cutouts through the torso and back. Wear
                  yours with mirrored sunglasses on vacation.
                </p> */}
                <br />
                <Row className="pick-size">
                  <Col lg="4" md="4">
                    <label>Previous close</label>
                    <h6 style={{color: "#ffffff"}}>${prevClose}</h6>
                  </Col>
                  <Col lg="4" md="4" sm="6">
                    <label>Avg. Volume</label>
                    <h6 style={{color: "#ffffff"}}>{avgVolume}</h6>
                  </Col>
                  <Col lg="4" md="4" sm="6">
                    <label>Market Cap</label>
                    <h6 style={{color: "#ffffff"}}>${marketCap}</h6>
                  </Col>
                </Row>
                <br />
                <Row className="justify-content-start">
                    <Col>
                    <Button className="ml-3" color="warning">
                        Buy Now
                    </Button>
                    </Col>
                    <Col>
                    <Button className="ml-3" color="warning">
                        Follow Trade
                    </Button>
                    </Col>
                </Row>
              </Col>
            </Row>
          </Container>
          <div className="section section-comments">
          <Container>
            <Row>
              <Col className="ml-auto mr-auto" md="8">
                <div className="media-area">
                  <h3 className="title text-center">3 Comments</h3>
                  <Media>
                    <a
                      className="pull-left"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="avatar">
                        <Media
                          alt="..."
                          className="img-raised"
                          src={require("Assets/img/shirt.png")}
                        />
                      </div>
                    </a>
                    <Media body>
                      <Media heading tag="h5">
                        Tina Andrew{" "}
                        <small className="text-muted">· 7 minutes ago</small>
                      </Media>
                      <p>
                        Chance too good. God level bars. I'm so proud of
                        @LifeOfDesiigner #1 song in the country. Panda! Don't be
                        scared of the truth because we need to restart the human
                        foundation in truth I stand with the most humility. We
                        are so blessed!
                      </p>
                      <p>
                        All praises and blessings to the families of people who
                        never gave up on dreams. Don't forget, You're Awesome!
                      </p>
                      <div className="media-footer">
                        <Button
                          className="btn-simple pull-right"
                          color="primary"
                          href="#pablo"
                          id="tooltip341431465"
                          onClick={(e) => e.preventDefault()}
                          size="sm"
                        >
                          <i className="tim-icons icon-send" /> Reply
                        </Button>
                        <UncontrolledTooltip
                          delay={0}
                          target="tooltip341431465"
                        >
                          Reply to Comment
                        </UncontrolledTooltip>
                        <Button
                          className="btn-simple pull-right"
                          color="danger"
                          href="#pablo"
                          onClick={(e) => e.preventDefault()}
                          size="sm"
                        >
                          <i className="tim-icons icon-heart-2" /> 243
                        </Button>
                      </div>
                    </Media>
                  </Media>
                  <Media>
                    <a
                      className="pull-left"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                    >
                      <div className="avatar">
                        <Media
                          alt="..."
                          className="img-raised"
                          src={require("Assets/img/shirt.png")}
                        />
                      </div>
                    </a>
                    <Media body>
                      <Media heading tag="h5">
                        John Camber{" "}
                        <small className="text-muted">· Yesterday</small>
                      </Media>
                      <p>
                        Hello guys, nice to have you on the platform! There will
                        be a lot of great stuff coming soon. We will keep you
                        posted for the latest news.
                      </p>
                      <p>Don't forget, You're Awesome!</p>
                      <div className="media-footer">
                        <Button
                          className="btn-simple pull-right"
                          color="primary"
                          href="#pablo"
                          id="tooltip871944617"
                          onClick={(e) => e.preventDefault()}
                          size="sm"
                        >
                          <i className="tim-icons icon-send" /> Reply
                        </Button>
                        <UncontrolledTooltip
                          delay={0}
                          target="tooltip871944617"
                        >
                          Reply to Comment
                        </UncontrolledTooltip>
                        <Button
                          className="btn-simple pull-right"
                          color="danger"
                          href="#pablo"
                          onClick={(e) => e.preventDefault()}
                          size="sm"
                        >
                          <i className="tim-icons icon-heart-2" /> 243
                        </Button>
                      </div>
                      <Media>
                        <a
                          className="pull-left"
                          href="#pablo"
                          onClick={(e) => e.preventDefault()}
                        >
                          <div className="avatar">
                            <Media
                              alt="..."
                              className="img-raised"
                              src={require("Assets/img/shirt.png")}
                            />
                          </div>
                        </a>
                        <Media body>
                          <Media heading tag="h5">
                            Tina Andrew{" "}
                            <small className="text-muted">· 2 Days Ago</small>
                          </Media>
                          <p>
                            Hello guys, nice to have you on the platform! There
                            will be a lot of great stuff coming soon. We will
                            keep you posted for the latest news.
                          </p>
                          <p>Don't forget, You're Awesome!</p>
                          <div className="media-footer">
                            <Button
                              className="btn-simple pull-right"
                              color="primary"
                              href="#pablo"
                              id="tooltip442113005"
                              onClick={(e) => e.preventDefault()}
                              size="sm"
                            >
                              <i className="tim-icons icon-send" /> Reply
                            </Button>
                            <UncontrolledTooltip
                              delay={0}
                              target="tooltip442113005"
                            >
                              Reply to Comment
                            </UncontrolledTooltip>
                            <Button
                              className="btn-simple pull-right"
                              color="danger"
                              href="#pablo"
                              onClick={(e) => e.preventDefault()}
                              size="sm"
                            >
                              <i className="tim-icons icon-heart-2" /> 243
                            </Button>
                          </div>
                        </Media>
                      </Media>
                    </Media>
                  </Media>
                </div>
                <h3 className="title text-center">Post your comment</h3>
                <Media className="media-post">
                  <a
                    className="pull-left author"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    <div className="avatar">
                      <Media
                        alt="..."
                        className="img-raised"
                        src={require("Assets/img/shirt.png")}
                      />
                    </div>
                  </a>
                  <Media body>
                    <Input
                      placeholder="Write a nice reply or go home..."
                      rows="4"
                      type="textarea"
                    />
                    <div className="media-footer">
                      <Button
                        className="pull-right"
                        color="primary"
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        Reply
                      </Button>
                    </div>
                  </Media>
                </Media>
                {/* end media-post */}
              </Col>
            </Row>
          </Container>
        </div>
        </div>
        
        </>
    );
}

export default Trade;