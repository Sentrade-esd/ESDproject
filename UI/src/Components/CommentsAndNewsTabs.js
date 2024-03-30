import React, { useState } from 'react';
import { Container, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, Media, Input, Button, Card, CardBody, CardTitle, CardFooter } from 'reactstrap';
import Slick from "react-slick";

const CommentsAndNewsTabs = ({companySymbol, news, comments}) => {
  const [activeTab, setActiveTab] = useState('comments');

  const toggleTab = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };

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
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ],
  };



  return (
    <div className="section section-comments">
      <Container>
        <Row>
          <Col className="ml-auto mr-auto" md="8">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={`${activeTab === 'comments' ? 'active' : ''}`}
                  onClick={() => toggleTab('comments')}
                >
                  Comments
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={`${activeTab === 'news' ? 'active' : ''}`}
                  onClick={() => toggleTab('news')}
                >
                  News
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="comments">
                <div>
                  <h3 className="title text-center">Post your comment</h3>
                  {/* Your comment form */}
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
                  {/* Comment section */}
                  <div className="media-area">
                    <h3 className="title text-center">Comments</h3>
                    {/* Your comments */}
                    {comments.map((comment, index) => {
                      return (
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
                            {comment.commentTxt}
                          </p>
                          <br></br>
                        </Media>
                        </Media>
                      )
                    })}
                    {/* <Media>
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
                    </Media> */}
                  </div>
                </div>
              </TabPane>
              <TabPane tabId="news">
                {/* Your news section */}
                <h3 className="title text-center">News</h3>
                {/* Your news content */}
                <div className="blogs-5">
                  <Row>
                    <Col className="ml-auto mr-auto">
                    {news.map((item, index) => {
                      const date = new Date(item.pubDate);
                      const readableDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

                      return (
                        <Card key={index} className="card-blog card-plain" style={{borderColor: 'white'}}>
                          <CardBody style={{ color: 'white' }}>
                            <h6 className="category text-warning">{companySymbol}</h6>
                            <CardTitle tag="h6">
                              <a href={item.link} onClick={(e) => e.preventDefault()}>
                                {item.title}
                              </a>
                            </CardTitle>
                            <CardFooter>
                              <div className="author" >
                                <span className="ml-1">{readableDate}</span>
                              </div>
                              <div className="stats stats-right">
                                <i className="tim-icons icon-heart-2" /> {item.likes}
                              </div>
                            </CardFooter>
                          </CardBody>
                        </Card>
                      );
                    })}
                      {/* <Card className="card-blog card-plain" style={{borderColor: 'white'}}>
                        <CardBody style={{ color: 'white' }}>
                          <h6 className="category text-warning">{companySymbol}</h6>
                          <CardTitle tag="h6">
                            <a href="#pablo" onClick={(e) => e.preventDefault()}>
                              Nvidia Just Bought 5 Artificial Intelligence (AI) Stocks. These 2 Stand Out the Most. - Yahoo Finance
                            </a>
                          </CardTitle>
                          <CardFooter>
                            <div className="author" >
                              <span className="ml-1">Marc Oliver</span>
                            </div>
                            <div className="stats stats-right">
                              <i className="tim-icons icon-heart-2" /> 2.4K
                            </div>
                          </CardFooter>
                        </CardBody>
                      </Card> */}
                    </Col>
                  </Row>
              </div>
              </TabPane>
            </TabContent>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const labelStyles = {
  color: '#d2d2d2',
};

const whiteColor = {
  color: '#ffffff',
};

export default CommentsAndNewsTabs;
