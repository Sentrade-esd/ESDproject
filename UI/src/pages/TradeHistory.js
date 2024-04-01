import React, { useState, useEffect } from 'react';
import axios, { all } from 'axios';
import { Card, CardGroup, Row, Col } from 'react-bootstrap'
import { Container, FormGroup, Input, Button, Badge, CardHeader, CardTitle, CardBody, Carousel, CarouselIndicators, CarouselItem, Nav, NavItem, NavLink, tabs, TabContent, TabPane, Table, Label, FormText  } from 'reactstrap';
import Slick from "react-slick";
import "../Styles/global.css";
import classnames from "classnames";


const items2 = [
    {content:
      {
          companySymbol: 'AAPL',
          companyName: 'Apple Inc',
          buyAmount: 100,
          stopLoss: 0.5,
          stocksHeld: 0.5,
      }
    },
    {content:
      {
          companySymbol: 'TSLA',
          companyName: 'Tesla',
          buyAmount: 100,
          stopLoss: 0.5,
          stocksHeld: 0.5,
      }
    },
    {content:
      {
          companySymbol: 'NVDA',
          companyName: 'Nvidia',
          buyAmount: 100,
          stopLoss: 0.5,
          stocksHeld: 0.5,
      }
    },
    {content:
      {
          companySymbol: 'AAPL',
          companyName: 'Apple',
          buyAmount: 100,
          stopLoss: 0.5,
          stocksHeld: 0.5,
      }
    },
    {content: 
      {
          companySymbol: 'SMSG',
          companyName: 'Samsung',
          buyAmount: 100,
          stopLoss: 0.5,
          stocksHeld: 0.5,
      }
    },
  ];

const allTransactions = [
  {
    "BuyAmount": 100,
    "Company": "LCID",
    "DateTimestamp": "Sun, 24 Mar 2024 01:12:29 GMT",
    "Email": "web2@example.com",
    "SellAmount": null,
    "StocksHeld": 25,
    "StopLossSentimentThreshold": 0.05,
    "TotalAccountValue": 900.0,
    "TransactionID": 1,
    "UserID": 4
  },
  {
    "BuyAmount": 100.0,
    "Company": "NVDA",
    "DateTimestamp": "Sun, 24 Mar 2024 02:12:11 GMT",
    "Email": "test2@t.com",
    "SellAmount": 134.00,
    "StocksHeld": 1,
    "StopLossSentimentThreshold": 0.05,
    "TotalAccountValue": 934.00,
    "TransactionID": 2,
    "UserID": 4
  },
  {
    "BuyAmount": 220.0,
    "Company": "AAPL",
    "DateTimestamp": "Sun, 24 Mar 2024 03:12:11 GMT",
    "Email": "test2@t.com",
    "SellAmount": 310.00,
    "StocksHeld": 2,
    "StopLossSentimentThreshold": 0.05,
    "TotalAccountValue": 1024.00,
    "TransactionID": 3,
    "UserID": 4
  },
  {
    "BuyAmount": 100,
    "Company": "LCID",
    "DateTimestamp": "Sun, 24 Mar 2024 01:12:29 GMT",
    "Email": "web2@example.com",
    "SellAmount": 75,
    "StocksHeld": 25,
    "StopLossSentimentThreshold": 0.05,
    "TotalAccountValue": 999.00,
    "TransactionID": 1,
    "UserID": 4
  },
  {
    "BuyAmount": 130.0,
    "Company": "NVDA",
    "DateTimestamp": "Sun, 24 Mar 2024 04:12:11 GMT",
    "Email": "test2@t.com",
    "SellAmount": null,
    "StocksHeld": 1,
    "StopLossSentimentThreshold": 0.05,
    "TotalAccountValue": 869.00,
    "TransactionID": 4,
    "UserID": 4
  },
  {
    "BuyAmount": 139.00,
    "Company": "NVDA",
    "DateTimestamp": "Sun, 24 Mar 2024 05:12:11 GMT",
    "Email": "test2@t.com",
    "SellAmount": null,
    "StocksHeld": 1,
    "StopLossSentimentThreshold": 0.05,
    "TotalAccountValue": 730.00,
    "TransactionID": 5,
    "UserID": 4
  },
  {
    "BuyAmount": 140.00,
    "Company": "NVDA",
    "DateTimestamp": "Sun, 24 Mar 2024 06:12:11 GMT",
    "Email": "test2@t.com",
    "SellAmount": null,
    "StocksHeld": 1,
    "StopLossSentimentThreshold": 0.05,
    "TotalAccountValue": 590.00,
    "TransactionID": 6,
    "UserID": 4
  },
  {
    "BuyAmount": 130.00,
    "Company": "NVDA",
    "DateTimestamp": "Sun, 24 Mar 2024 05:12:11 GMT",
    "Email": "test2@t.com",
    "SellAmount": 150.00,
    "StocksHeld": 1,
    "StopLossSentimentThreshold": 0.05,
    "TotalAccountValue": 740.00,
    "TransactionID": 5,
    "UserID": 4
  }
]


  

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
  
const TradeHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [tabs, setTabs] = React.useState(1);
    const [carousel1Index, setCarousel1Index] = React.useState(0);
    const [carousel2Index, setCarousel2Index] = React.useState(0);
    const [animating1, setAnimating1] = React.useState(false);
    const [animating2, setAnimating2] = React.useState(false);
    const [categorizedItems, setCategorizedItems] = useState({});
    const [currentBalance, setCurrentBalance] = useState(0);
    const [openTrades, setOpenTrades] = useState([]);
    const [closedTrades, setClosedTrades] = useState([]);
    const [pnL , setPnL] = useState(0);


    // const email = sessionStorage.getItem('username');
    const wrapper = React.useRef(null);
    React.useEffect(() => {
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      wrapper.current.scrollTop = 0;
      document.body.classList.add("blog-post");
      return function cleanup() {
        document.body.classList.remove("blog-post");
      };
    }, []);

    useEffect(() => {
        const UserID = sessionStorage.getItem('id'); 
        if (UserID) { // check if email is present
            axios.get(`http://127.0.0.1:5004/transaction/total/${UserID}`)
        .then(response => {
            // setTransactions(response.data);
            setTransactions(response.data.data.Transaction);
        })
        .catch(error => {
            console.error('There was an error!', error);
        });
        }
    }, []);

    // useEffect(() => {
    //   const categorizedItems = items2.reduce((categories, item) => {
    //     const key = item.content.companySymbol;
    
    //     if (!categories[key]) {
    //       categories[key] = {
    //         content: {
    //           companySymbol: key,
    //           position: 0.0,
    //           totalValue: 0.0,
    //           // Add other properties as needed
    //         },
    //       };
    //     }
    
    //     categories[key].content.position += item.content.stocksHeld;
    //     categories[key].content.totalValue += item.content.buyAmount;
    //     // Add other properties as needed
    
    //     return categories;
    //   }, {});

    //   setCategorizedItems(categorizedItems);
    //   console.log(categorizedItems);
    // }, [items2]);


    useEffect(() => {
      const openTrades = allTransactions.filter((transaction) => transaction.SellAmount === null);
      setOpenTrades(openTrades);
      const closedTrades = allTransactions.filter((transaction) => transaction.SellAmount !== null);
      setClosedTrades(closedTrades);
      

      const newCategorizedItems = openTrades.reduce((categories, item) => {
        const key = item.Company;
    
        if (!categories[key]) {
          categories[key] = {
            content: {
              companySymbol: key,
              position: 0.0,
              totalValue: 0.0,
              // Add other properties as needed
            },
          };
        }
    
        categories[key].content.position += item.StocksHeld;
        categories[key].content.totalValue += item.BuyAmount;
        // Add other properties as needed    
        return categories;
      }, {});

      setCategorizedItems(newCategorizedItems);

      const currentBalance = allTransactions[allTransactions.length - 1].TotalAccountValue;
      setCurrentBalance(currentBalance);

      let newPnL = 1000 - currentBalance;
      setPnL(newPnL);

      // try{
      //   await fetchPrices(openTrades);
      // } catch (error){
      //   console.log(error);
      // }

    }, [allTransactions]);

    // async function fetchPrices(openTrades){
    //   const promises = openTrades.map(async (trade) => {
    //     const response = await axios.get(`http://
    // }


    const onExiting = (carousel) => {
        if (carousel === 1) {
          setAnimating1(true);
        } else {
          setAnimating2(true);
        }
      };
    
    const onExited = (carousel) => {
    if (carousel === 1) {
        setAnimating1(false);
    } else {
        setAnimating2(false);
    }
    };
    
    const next = (carousel, items) => {
    if (carousel === 1) {
        if (animating1) {
        return;
        }
    } else {
        if (animating2) {
        return;
        }
    }
    let currentIndex = -1;
    if (carousel === 1) {
        currentIndex = carousel1Index;
    } else {
        currentIndex = carousel2Index;
    }
    const nextIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    if (carousel === 1) {
        setCarousel1Index(nextIndex);
    } else {
        setCarousel2Index(nextIndex);
    }
    };
    const previous = (carousel, items) => {
    if (carousel === 1) {
        if (animating1) {
        return;
        }
    } else {
        if (animating2) {
        return;
        }
    }
    let currentIndex = -1;
    if (carousel === 1) {
        currentIndex = carousel1Index;
    } else {
        currentIndex = carousel2Index;
    }
    const nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    if (carousel === 1) {
        setCarousel1Index(nextIndex);
    } else {
        setCarousel2Index(nextIndex);
    }
    };
    const goToIndex = (newIndex, carousel) => {
    if (carousel === 1) {
        if (animating1) {
        return;
        }
    } else {
        if (animating2) {
        return;
        }
    }
    if (carousel === 1) {
        setCarousel1Index(newIndex);
    } else {
        setCarousel2Index(newIndex);
    }
    };

    return (
        <>
        <div className="wrapper" ref={wrapper}>
            <div className='testimonials-4' style={{backgroundColor: '#1D304f'}}>
            <Container className='pt-5 pb-5'>
                <Row>
                  <Col md="6">
                      <Carousel
                      activeIndex={carousel2Index}
                      // next={() => next(2, items2)}
                      // previous={() => previous(2, items2)}
                      next={() => next(2, openTrades)}
                      previous={() => previous(2, openTrades)}
                      >
                      <CarouselIndicators
                          // items={items2}
                          // activeIndex={carousel2Index}
                          // onClickHandler={(newIndex) => goToIndex(newIndex, 2)}
                          items={openTrades}
                          activeIndex={carousel2Index}
                          onClickHandler={(newIndex) => goToIndex(newIndex, 2)}
                      />
                      {openTrades.map((item, key) => {
                          console.log("ITEM", item);
                          return (
                              <CarouselItem
                              onExiting={() => onExiting(2)}
                              onExited={() => onExited(2)}
                              key={key}
                              className="justify-content-center  pb-5"
                            >
                              <Row className='justify-content-center'>
                                  <Col md='6'>
                                      <Card className="card-pricing">
                                          <CardHeader className="bg-info">
                                              <Badge className="badge-default">{item.Company}</Badge>
                                              <CardTitle tag="h3">
                                              {item.Company}
                                              </CardTitle>
                                              <br></br>
                                          </CardHeader>
                                          <CardBody style={openTradesCard}>
                                              <ul>
                                              <li>
                                                <b style={{color: 'white'}}>Buy Amount: </b>{item.BuyAmount}
                                              </li>
                                              <li>
                                                  <b style={{color: 'white'}}>Stop Loss: </b>{item.StopLossSentimentThreshold}
                                              </li>
                                              <li>
                                                  <b style={{color: 'white'}}>Stocks Held: </b>{item.StocksHeld}
                                              </li>
                                              </ul>
                                              <Button
                                              className="mt-4"
                                              color="info"
                                              href="#pablo"
                                              onClick={(e) => e.preventDefault()}
                                              >
                                              Sell Now
                                              </Button>
                                          </CardBody>
                                      </Card> 
                                  </Col>
                              </Row>
                          </CarouselItem>
                          // <CarouselItem
                          //     onExiting={() => onExiting(2)}
                          //     onExited={() => onExited(2)}
                          //     key={key}
                          //     className="justify-content-center  pb-5"
                          // >
                          //     <Row className='justify-content-center'>
                          //         <Col md='6'>
                          //             <Card className="card-pricing">
                          //                 <CardHeader className="bg-info">
                          //                     <Badge className="badge-default">{item.content.companySymbol}</Badge>
                          //                     <CardTitle tag="h3">
                          //                     {item.content.companyName}
                          //                     </CardTitle>
                          //                     <br></br>
                          //                 </CardHeader>
                          //                 <CardBody style={openTradesCard}>
                          //                     <ul>
                          //                     <li>
                          //                       <b style={{color: 'white'}}>Buy Amount: </b>{item.content.buyAmount}
                          //                     </li>
                          //                     <li>
                          //                         <b style={{color: 'white'}}>Stop Loss: </b>{item.content.stopLoss}
                          //                     </li>
                          //                     <li>
                          //                         <b style={{color: 'white'}}>Stocks Held: </b>{item.content.stocksHeld}
                          //                     </li>
                          //                     </ul>
                          //                     <Button
                          //                     className="mt-4"
                          //                     color="info"
                          //                     href="#pablo"
                          //                     onClick={(e) => e.preventDefault()}
                          //                     >
                          //                     Sell Now
                          //                     </Button>
                          //                 </CardBody>
                          //             </Card> 
                          //         </Col>
                          //     </Row>
                          // </CarouselItem>
                          );
                      })}
                      <a
                          className="carousel-control-prev"
                          data-slide="prev"
                          href="#pablo"
                          onClick={(e) => {
                          e.preventDefault();
                          // previous(2, items2);
                          previous(2, openTrades);
                          }}
                          role="button"
                      >
                          <i className="tim-icons icon-minimal-left" />
                      </a>
                      <a
                          className="carousel-control-next"
                          data-slide="next"
                          href="#pablo"
                          onClick={(e) => {
                          e.preventDefault();
                          // next(2, items2);
                          next(2, openTrades);
                          }}
                          role="button"
                      >
                          <i className="tim-icons icon-minimal-right" />
                      </a>
                      </Carousel>
                  </Col>
                  <Col md='6'>
                    <Col md='10'>
                      <Card className="card-coin card-plain">
                        <CardHeader>
                          <img
                            alt="..."
                            className="img-center img-fluid rounded-circle"
                            src={require("Assets/img/logo-nav.png")}
                          />
                          <h4 className="title">My Account</h4>
                        </CardHeader>
                        <CardBody>
                          <Nav
                            className="nav-tabs-primary justify-content-center"
                            tabs
                          >
                            <NavItem>
                              <NavLink
                                className={classnames({
                                  active: tabs === 1,
                                })}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setTabs(1);
                                }}
                                href="#pablo"
                              >
                                Balance
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                className={classnames({
                                  active: tabs === 2,
                                })}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setTabs(2);
                                }}
                                href="#pablo"
                              >
                                Portfolio
                              </NavLink>
                            </NavItem>
                          </Nav>
                          <TabContent
                            className="tab-subcategories"
                            activeTab={"tab" + tabs}
                          >
                            <TabPane tabId="tab1">
                            <CardBody >
                              <Table className="tablesorter" responsive >
                                <tbody>
                                  <tr>
                                    <td className="text-left" style={{backgroundColor: '#1D304f'}}>
                                      {/* <i className="tim-icons icon-atom" /> */}
                                      Buying Power
                                    </td>
                                    <td className="text-right" style={{backgroundColor: '#1D304f'}}>${currentBalance}</td>
                                  </tr>
                                  <tr>
                                    <td className="text-left" style={{backgroundColor: '#1D304f'}}>
                                      {/* <i className="tim-icons icon-user-run" /> */}
                                      Profit / Loss
                                    </td>
                                    <td className="text-right" style={{backgroundColor: '#1D304f'}}>${pnL}</td>
                                  </tr>
                                  <tr>
                                    <td className="text-left" style={{backgroundColor: '#1D304f'}}>
                                      {/* <i className="tim-icons icon-chart-bar-32" /> */}
                                      Total Assets
                                    </td>
                                    <td className="text-right" style={{backgroundColor: '#1D304f'}}>${}</td>
                                  </tr>
                                </tbody>
                              </Table>
                            </CardBody>
                              {/* <Row>
                                <Label sm="3">Pay to</Label>
                                <Col sm="9">
                                  <FormGroup>
                                    <Input
                                      placeholder="e.g. 1Nasd92348hU984353hfid"
                                      type="text"
                                    />
                                    <FormText color="default" tag="span">
                                      Please enter a valid address.
                                    </FormText>
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <Label sm="3">Amount</Label>
                                <Col sm="9">
                                  <FormGroup>
                                    <Input placeholder="1.587" type="text" />
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Button
                                className="btn-simple btn-icon btn-round float-right"
                                color="primary"
                              >
                                <i className="tim-icons icon-send" />
                              </Button> */}
                            </TabPane>
                            <TabPane tabId="tab2">
                              <Table className="tablesorter no-gap" style={{backgroundColor: '#1D304f'}} responsive>
                                <thead className="text-primary">
                                  <tr>
                                    <th className="header" style={{backgroundColor: 'grey'}}>Stock</th>
                                    <th className="header" style={{backgroundColor: 'grey'}}>Position</th>
                                    <th className="header" style={{backgroundColor: 'grey'}}>Total Value</th>
                                  </tr>
                                </thead>
                              </Table>
                              <div className='scrollable-table'>
                                <Table className="tablesorter no-gap" responsive>
                                <tbody>
                                  {Object.keys(categorizedItems).map((key) => {
                                    const item = categorizedItems[key];
                                    return (
                                      <tr key={key}>
                                        <td style={{backgroundColor: '#1D304f'}}>{item.content.companySymbol}</td>
                                        <td style={{backgroundColor: '#1D304f'}}>{item.content.position}</td>
                                        <td style={{backgroundColor: '#1D304f'}}>{item.content.totalValue}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                </Table>
                              </div>
                            </TabPane>
                            {/* <TabPane tabId="tab3">
                              <Table className="tablesorter" responsive>
                                <thead className="text-primary">
                                  <tr>
                                    <th className="header">Latest Crypto News</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>The Daily: Nexo to Pay on Stable...</td>
                                  </tr>
                                  <tr>
                                    <td>Venezuela Begins Public of Nation...</td>
                                  </tr>
                                  <tr>
                                    <td>PR: BitCanna – Dutch Blockchain...</td>
                                  </tr>
                                </tbody>
                              </Table>
                            </TabPane> */}
                          </TabContent>
                        </CardBody>
                      </Card>
                    </Col>
                  </Col>
                </Row>
            </Container>
            </div>
            <div className="tables-2" style={{backgroundColor: '#1D304f'}}>
              <Container>
                <Row>
                  <Col className="ml-auto mr-auto text-center" md="6">
                    <h2 className="title mb-4">My Transactions</h2>
                    <div className="section-space" />
                  </Col>
                </Row>
                <Row>
                  <Col className="mx-aut mb-5" md="12" >
                    <div>
                      <Card>
                        <CardBody>
                          <div className="table-responsive mb-0">
                            <Table className="table-pricing">
                              <thead className="text-primary">
                                <tr>
                                  <th className="p-5">
                                    <img
                                      alt="..."
                                      className="background"
                                      style={{width:"100px"}}
                                      src={require("Assets/img/logo-nav.png")}
                                    />
                                  </th>
                                  <th className="text-center">
                                    <CardTitle tag="h5">Stock</CardTitle>
                                  </th>
                                  <th className="text-center">
                                    <CardTitle tag="h5">Buy Amount</CardTitle>
                                  </th>
                                  <th className="text-center">
                                    <CardTitle tag="h5">Sell Amount</CardTitle>
                                  </th>
                                  <th className="text-center">
                                    <CardTitle tag="h5">Stop Loss Sentiment Threshold</CardTitle>
                                  </th>
                                  <th className="text-center">
                                    <CardTitle tag="h5">Stocks Held</CardTitle>
                                  </th>
                                  <th className="text-center">
                                    <CardTitle tag="h5">Total Account Value</CardTitle>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {closedTrades.map((item) => {
                                    return (
                                      <tr>
                                        <td>{item.TransactionID}</td>
                                        <td>{item.Company}</td>
                                        <td>{item.BuyAmount}</td>
                                        <td>{item.SellAmount}</td>
                                        <td>{item.StopLossSentimentThreshold}</td>
                                        <td>{item.StocksHeld}</td>
                                        <td>{item.TotalAccountValue}</td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </Table>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </Col>
                </Row>
              </Container>
            </div>
        </div>

        {/* <div>
            <CardGroup className='mt-3 row row-cols-3 row-cols-md-2 g-4'>
                {transactions.map((transaction, index) => (
                // <Col sm={12} md={6} lg={4} xl={3} key={transaction.TransactionID}>
                    <Card style={{ width: '18rem' }}>
                    <Card.Body>
                        <Card.Title>{transaction.Email}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{transaction.Company}</Card.Subtitle>
                        <Card.Text>
                        Data and time: {new Date(transaction.DateTimestamp).toLocaleString()} <br />
                        Buy amount: {transaction.BuyAmount.toFixed(2)} <br />
                        Sell amount: {transaction.SellAmount.toFixed(2)} <br />
                        Stop loss sentiment threshold: {transaction.StopLossSentimentThreshold.toFixed(2)} <br />
                        Total account value: {transaction.TotalAccountValue.toFixed(2)}
                        </Card.Text>
                    </Card.Body>
                    </Card>
                // </Col>
                ))}
            </CardGroup>
        </div> */}



        </>
        );
    };


const openTradesCard = {
    backgroundColor: '#1D304f',
}

export default TradeHistory;