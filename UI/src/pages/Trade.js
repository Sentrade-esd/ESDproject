import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsonData from '../test.json';
// import WordCloud from 'react-wordcloud';
import { useLocation } from 'react-router-dom';
import { Form, 
    // Button 
} from 'react-bootstrap';
import WordCloud from 'Components/WordCloud'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import Select from "react";
import Slick from "react-slick";


// import React from "react";
// import ProgressBar from "@ramonak/react-progress-bar";


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
import CommentsAndNewsTabs from 'Components/CommentsAndNewsTabs';

    // custom previous button for the slick component
const PrevButton = (props) => {
  return (
    <Button
      className="btn-round btn-icon btn-simple slick-prev slick-arrow"
      color="primary"
      aria-label="Previous"
      type="button"
      onClick={props.onClick}
    >
      <i className="tim-icons icon-minimal-left" />
    </Button>
  );
};
// custom next button for the slick component
const NextButton = (props) => {
  return (
    <Button
      className="btn-round btn-icon btn-simple slick-next slick-arrow"
      color="primary"
      aria-label="Next"
      type="button"
    >
      <i className="tim-icons icon-minimal-right" onClick={props.onClick} />
    </Button>
  );
};

  let slickSettings = {
    dots: false,
    infinite: true,
    centerMode: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    prevArrow: <PrevButton />,
    nextArrow: <NextButton />,
    className: "center slider",
    slide: "section",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const news = [ 
    {
      title: "Nvidia Just Bought 5 Artificial Intelligence (AI) Stocks. These 2 Stand Out the Most. - Yahoo Finance" , 
      link : "https://news.google.com/rss/articles/CBMiTWh0dHBzOi8vZmluYW5jZS55YWhvby5jb20vbmV3cy9udmlkaWEtanVzdC1ib3VnaHQtNS1hcnRpZmljaWFsLTA5MjgwMDM5My5odG1s0gEA?oc=5",
      pubDate: "2024-03-21T17:28:00.000+00:00"
    }, 
    {
      title: "Nvidia Just Bought 5 Artificial Intelligence (AI) Stocks. These 2 Stand Out the Most. - Yahoo Finance" , 
      link : "https://news.google.com/rss/articles/CBMiTWh0dHBzOi8vZmluYW5jZS55YWhvby5jb20vbmV3cy9udmlkaWEtanVzdC1ib3VnaHQtNS1hcnRpZmljaWFsLTA5MjgwMDM5My5odG1s0gEA?oc=5",
      pubDate: "2024-03-21T17:28:00.000+00:00"
    }, 
    {
      title: "Nvidia Just Bought 5 Artificial Intelligence (AI) Stocks. These 2 Stand Out the Most. - Yahoo Finance" , 
      link : "https://news.google.com/rss/articles/CBMiTWh0dHBzOi8vZmluYW5jZS55YWhvby5jb20vbmV3cy9udmlkaWEtanVzdC1ib3VnaHQtNS1hcnRpZmljaWFsLTA5MjgwMDM5My5odG1s0gEA?oc=5",
      pubDate: "2024-03-21T17:28:00.000+00:00"
    }, 
  ]

  const comments = [ 
    {
      commentTxt: "Apple sucks ass. THey dont produce good products. Samsung is going to take over. "
    }, 
    {
      commentTxt: "Apple Number 1"
    }, 
    {
      commentTxt: "Apple's car is the number 1 thing next time. No cap"
    }, 
  ]



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
    React.useEffect(() => {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      wrapper.current.scrollTop = 0;
      document.body.classList.add("product-page");
      return function cleanup() {
        document.body.classList.remove("product-page");
      };
    }, []);


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

    // const MyWordCloud = React.memo(({ words, options }) => 
    // <div style={{width: '600px', height: '400px'}}>
    //     <WordCloud words={words} options={options} />
    // </div>

  const [startDate, setStartDate] = useState(new Date());
  const endDate = new Date(); // Current date

  const sentimentColor = sentiment_score < 0 ? 'red' : 'green';

  // Normalize sentiment_score from range [-50, 50] to [0, 100]
  const normalizedScore = Math.abs((sentiment_score / 50) * 100);

  const progressBarStyles = {
      width: `${normalizedScore}%`,
      backgroundColor: sentimentColor,
      height: '20px',
      position: 'absolute',
      top: 0,
      [sentiment_score < 0 ? 'right' : 'left']: '50%',
  };
  const scoreStyles = {
      position: 'absolute',
      top: '-40px',
      [sentiment_score < 0 ? 'left' : 'right']: `${Math.abs(50 - normalizedScore)}%`,
      transform: `translateX(${sentiment_score < 0 ? '-100%' : '0%'})`,
      color: `${sentimentColor} !important`,
      fontSize: '20px !important',
      zIndex: 999,

  };

  const words = [
    { text: 'Hello', size: 40 },
    { text: 'World', size: 30 },
    { text: 'React', size: 35 },
    { text: 'Fun', size: 60 },
    { text: 'HaHA', size: 70 },
    { text: 'LOL', size: 30 },
    { text: 'USELESS', size: 15 },
    { text: 'Lousy', size: 35 },
    { text: 'Trash', size: 60 },
    { text: 'Bull', size: 70 },
    { text: 'Bear', size: 30 },
    { text: 'Noob', size: 15 },
    // Add more words as needed
  ];

  const keyWords = [
    { text: 'Hello', size: 40 },
    { text: 'World', size: 30 },
    { text: 'React', size: 35 },
    { text: 'Fun', size: 60 },
    { text: 'HaHA', size: 70 },
    { text: 'LOL', size: 30 },
    { text: 'USELESS', size: 15 },
    { text: 'Lousy', size: 35 },
    { text: 'Trash', size: 60 },
    { text: 'Bull', size: 70 },
    { text: 'Bear', size: 30 },
    { text: 'Noob', size: 15 },
    // Add more words as needed
  ];


    return (
      <>
      <div className="wrapper" ref={wrapper} style={{backgroundColor: "#1D304f"}}>
        {/* <div className="page-header page-header-small">
        <img
            alt="..."
            className="path shape"
            src={require("Assets/img/shape-s.png")}
          />
          <Container>
            <h1 className="h1-seo">Our products</h1>
            <h3>This is the best way to find your favorite stuff</h3>
          </Container>
        </div> */}
        {/* <Col className="ml-auto mr-auto" md="8"> */}
          <div className="testimonials-4">
            <Container fluid>
              {/* <Row>
                <Col className="ml-auto mr-auto text-center" md="6">
                  <h2 className="title">Join our world</h2>
                </Col>
              </Row> */}
              <Row>
                <Col className="positioned" lg="4" md="8" xs="10">
                  <h1 className="title" style={{padding: '0px 0px 30px 0px'}}>{companyName}<span className="mx-3"><i className="text-warning" style={{fontSize: '20px'}}>{companySymbol}</i></span></h1>
                  <div style={{ overflow: 'hidden', position: 'relative', backgroundColor: 'lightgray', height: '20px', borderRadius: '20px' }}>
                      <div style={progressBarStyles}></div>
                      <div style={scoreStyles}>{sentiment_score}</div>
                  </div>
                  <p style={{ color: sentimentColor }}>Sentiment Score: {sentiment_score}</p>
                  <br />
                  <Row className="pick-size">
                    <Col lg="4" md="4">
                      <label style={labelStyles}>Current Price</label>
                      <h6 style={{color: "#ffffff"}}>${currentPrice}</h6>
                    </Col>
                    <Col lg="4" md="4" sm="6">
                      <label style={labelStyles}><i>Avg. Volume</i></label>
                      <h6 style={{color: "#ffffff"}}>{avgVolume}</h6>
                    </Col>
                    <Col lg="4" md="4" sm="6">
                      <label style={labelStyles}>Market Cap</label>
                      <h6 style={{color: "#ffffff"}}>${marketCap}</h6>
                    </Col>
                  </Row>
                  <br />
                  {/* <p className="description text-white">
                    Meet Wingman, a robust suite of styled pages and components,
                    powered by Bootstrap 4. The ideal starting point for product
                    landing pages, stylish web-apps and complete company websites.
                  </p> */}
                <Row>
                  <Col>
                    <Button color="info" href="#pablo" onClick={(e) => e.preventDefault()} size="lg" style={{color: 'white'}}>
                      Buy Now
                    </Button>
                  </Col>
                  <Col>
                    <Button color="info" href="#pablo" onClick={(e) => e.preventDefault()} size="lg" style={{color: 'white'}}>
                      Follow Trade
                    </Button>
                  </Col>
                </Row>
                </Col>
                <Col md="12">
                  <Slick {...slickSettings}>
                    <div>
                      <div className="info text-left">
                      <h4 style={wordCloudCardHeadingStyles}>Keywords</h4>
                        <WordCloud words={keyWords} />
                      </div>
                    </div>
                    <div>
                      <div className="info text-left">
                      <h4 style={wordCloudCardHeadingStyles}>Emotions</h4>
                        <WordCloud words={words} />
                      </div>
                    </div>
                    <div>
                      <div className="info text-left">
                      <h4 style={wordCloudCardHeadingStyles}>Keywords</h4>
                        <WordCloud words={keyWords} />
                      </div>
                    </div>
                    <div>
                      <div className="info text-left">
                      <h4 style={wordCloudCardHeadingStyles}>Emotions</h4>
                        <WordCloud words={words} />
                      </div>
                    </div>
                    <div>
                      <div className="info text-left">
                      <h4 style={wordCloudCardHeadingStyles}>Keywords</h4>
                        <WordCloud words={keyWords} />
                      </div>
                    </div>
                    <div>
                      <div className="info text-left">
                      <h4 style={wordCloudCardHeadingStyles}>Emotions</h4>
                        <WordCloud words={words} />
                      </div>
                    </div>
                  </Slick>
                </Col>
              </Row>
            </Container>
          </div>
          {/* <div className="section">
            <Container>
              <Row>
                <Col lg="6" md="12">
                <WordCloud words={words} />
                </Col>
                <Col className="mx-auto" lg="6" md="12">
                  <h2 className="title">{companyName}</h2>
                  <div className="stats stats-right">
                    <div className="stars text-warning">
                      <i>{companySymbol}</i>
                    </div>
                  </div>
                  <br />
                  <br></br>
                  <br></br>
                  <div style={{ overflow: 'absolute', position: 'relative', backgroundColor: 'lightgray', height: '20px', borderRadius: '20px'}}>
                      <div style={progressBarStyles}></div>
                      <div style={scoreStyles}>{sentiment_score}</div>
                  </div>
                  <p style={{ color: sentimentColor }}>Sentiment Score</p>
                  <br />
                  <Row className="pick-size">
                    <Col lg="4" md="4">
                      <label style={labelStyles}>Current Price</label>
                      <h6 style={{color: "#ffffff"}}>${currentPrice}</h6>
                    </Col>
                    <Col lg="4" md="4" sm="6">
                      <label style={labelStyles}><i>Avg. Volume</i></label>
                      <h6 style={{color: "#ffffff"}}>{avgVolume}</h6>
                    </Col>
                    <Col lg="4" md="4" sm="6">
                      <label style={labelStyles}>Market Cap</label>
                      <h6 style={{color: "#ffffff"}}>${marketCap}</h6>
                    </Col>
                  </Row>
                  <br />
                  <Row className="justify-content-start">
                      <Col>
                      <Button className="ml-3" color="success">
                          Buy Now
                      </Button>
                      </Col>
                      <Col>
                      <Button className="ml-3" color="success">
                          Follow Trade
                      </Button>
                      </Col>
                  </Row>
                </Col>
              </Row>
            </Container>
          </div> */}
        {/* </Col> */}
        {/* <div className="section section-comments">
          <Container>
            <Row>
              <Col className="ml-auto mr-auto" md="8">
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
                        src={require("Assets/img/logo-nav.png")}
                      />
                    </div>
                  </a>
                  <Media body>
                    <Input
                      placeholder="Write about the company"
                      rows="4"
                      type="textarea"
                    />
                    <div className="media-footer">
                      <Button
                        className="pull-right"
                        color="info"
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        Reply
                      </Button>
                    </div>
                  </Media>
                </Media>
                <div className="media-area">
                  <h3 className="title text-center">Comments</h3>
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
                          src={require("Assets/img/logo-nav.png")}
                        />
                      </div>
                    </a>
                    <Media body>
                      <Media heading tag="h5" style={labelStyles}>
                        Anonymous{" "}
                      </Media>
                      <p>
                        Chance too good. God level bars. I'm so proud of
                        @LifeOfDesiigner #1 song in the country. Panda! Don't be
                        scared of the truth because we need to restart the human
                        foundation in truth I stand with the most humility. We
                        are so blessed!
                      </p>
                      <br></br>
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
                          src={require("Assets/img/logo-nav.png")}
                        />
                      </div>
                    </a>
                    <Media body>
                      <Media heading tag="h5" style={labelStyles}>
                        Anonymous{" "}
                      </Media>
                      <p>
                        Chance too good. God level bars. I'm so proud of
                        @LifeOfDesiigner #1 song in the country. Panda! Don't be
                        scared of the truth because we need to restart the human
                        foundation in truth I stand with the most humility. We
                        are so blessed!
                      </p>
                      <br></br>
                    </Media>
                  </Media>
                </div>
              </Col>
            </Row>
          </Container>
        </div> */}

        <CommentsAndNewsTabs companySymbol={companySymbol} news={news} comments={comments}></CommentsAndNewsTabs>
      </div>
      {/* <diym
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
                    <div className="col-md-6">
                        <MyWordCloud words={emotions} options={options} />
                    </div>
                </div>
            </div>

            <div style={{width: '600px', height: '400px'}}>
                <WordCloud words={emotions} options={options} />
            </div>

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
        </div> */}
        </>
    );
}



const labelStyles = {
  color: '#d2d2d2',
};

const wordCloudCardHeadingStyles = {
  color:'white', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: "10px"
};




export default Trade;