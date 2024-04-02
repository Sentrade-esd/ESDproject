import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Media,
  Input,
  Button,
  Card,
  CardBody,
  CardTitle,
  CardFooter,
} from "reactstrap";
import Slick from "react-slick";
import "../Styles/global.css";
import axios from "axios";
const CommentsAndNewsTabs = ({
  companySymbol,
  companyName,
  news,
  comments,
  setComments,
}) => {
  const [activeTab, setActiveTab] = useState("comments");
  const [comment, setComment] = useState("");
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const handleCommentSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setComments((prevComments) => [...prevComments, comment]); // Add the new comment to the comments array
    localStorage.setItem("comments", JSON.stringify([...comments, comment])); // Store the updated comments array in local storage
    setComment(""); // Clear the comment input field
    try {
      const commentData = {
        company: companyName,
        comment: comment,
      };
      console.log("commentData", commentData);
      const CommentsResponse = await axios.post(
        `http://20.78.38.247:8000/comments/`,
        commentData
      );
      if (CommentsResponse.status === 200) {
        console.log("yes bro");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    // const savedUsername = "hello";
    if (savedUsername) {
      setIsLoggedIn(true);
      console.log("isloggedin", isLoggedIn);
      setUsername(savedUsername);
    }
  }, []);
  useEffect(() => {
    console.log("commentslol", comments);
    console.log("news", news);
  }, [comments, news]);

  return (
    <div className="section section-comments">
      <Container>
        <Row>
          <Col className="ml-auto mr-auto" md="8">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={`${activeTab === "comments" ? "active" : ""}`}
                  onClick={() => toggleTab("comments")}
                >
                  Comments
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={`${activeTab === "news" ? "active" : ""}`}
                  onClick={() => toggleTab("news")}
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
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <div className="media-footer">
                        <Button
                          className="pull-right"
                          color="info"
                          // href="#pablo"
                          onClick={handleCommentSubmit}
                          // disabled={!isLoggedIn}
                        >
                          Comment
                        </Button>
                      </div>
                    </Media>
                  </Media>
                  {/* Comment section */}
                  <div
                    className="media-area"
                    style={{ overflowY: "auto", maxHeight: "500px" }}
                  >
                    <h3 className="title text-center">Comments</h3>
                    {/* Your comments */}
                    {comments.map((comment, index) => {
                      return (
                        <Media>
                          <a
                            className="pull-left"
                            // href="#pablo"
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
                            <p>{comment}</p>
                            <br></br>
                          </Media>
                        </Media>
                      );
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
                <div
                  className="blogs-5"
                  style={{ overflowY: "auto", maxHeight: "500px" }}
                >
                  <Row>
                    <Col className="ml-auto mr-auto">
                      {news &&
                        news.map((item, index) => {
                          const date = new Date(item.datetime);
                          const readableDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

                          return (
                            <Card
                              key={index}
                              className="card-blog card-plain"
                              style={{ borderColor: "white" }}
                            >
                              <CardBody>
                                {/* <h6 className="category text-warning">{companySymbol}</h6> */}
                                <CardTitle tag="h6">
                                  <a
                                    href={item.link}
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    {item.title}
                                  </a>
                                </CardTitle>
                                <CardFooter>
                                  <div className="author">
                                    <span className="ml-1">{readableDate}</span>
                                  </div>
                                  <div className="stats stats-right">
                                    <i className="tim-icons icon-heart-2" />{" "}
                                    {item.likes}
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
  color: "#d2d2d2",
};

const whiteColor = {
  color: "#ffffff",
};

export default CommentsAndNewsTabs;
