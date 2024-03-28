import React from 'react';
// import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
// import money from '../assets/money.jpg';
// import coolguy from '../assets/coolguy.jpg';
// import '../styles/HomeBody.css';
import "assets/css/nucleo-icons.css";
import "assets/css/blk-design-system-pro-react.css";
import NavBar from 'components/NavBar';
import {useState, useEffect} from 'react';

import {
    Button,
    UncontrolledCollapse,
    Label,
    FormGroup,
    Input,
    InputGroupAddon,
    InputGroupText,
    InputGroup,
    NavbarBrand,
    Navbar,
    NavItem,
    NavLink,
    Nav,
    Container,
    Row,
    Col,
  } from "reactstrap";

function Home(){

  // const [hasUserSession , setHasUserSession] = useState(false);

  // // // fake function to check if user is logged in
  // // function functionTocheckUserSession() {
  // //   return new Promise((resolve, reject) => {
  // //     setTimeout(() => {
  // //       resolve(false);
  // //     }, 1000);
  // //   });
  // // }

  // useEffect(() => {
  //   const checkUserSession = async() => {
  //     console.log('Check noW ==============================')
  //     const userSessionExist = await checkUser();
  //     setHasUserSession(userSessionExist);
  //   }

  //   checkUserSession();
  // }, []);


  // async function checkUser() {
  //   const savedUsername = localStorage.getItem("username");
    
  //   if (savedUsername) {
  //     console.log("User is logged in");
  //     return true;
  //   }
  //   console.log("User is not logged in")
  //   return true;
  // }


  return (
    //     <Container fluid>

    //     <Row>
    //         <Col xs={12} md={6}>
    //             <img src={money} alt="Description of Image 1" className="img-fluid"/>
    //         </Col>
    //         <Col xs={12} md={6} style={{textAlign: 'justify'}}>
    //             <h1>FAST CASH</h1>
    //             <p>GET RICH NOW LOSER. FAST MONEY. EASY MONEY</p>
    //         </Col>
    //     </Row>
    //     <Row>
    //         <Col xs={12} md={{ span: 6, order: 'last' }}>
    //             <img src={coolguy} alt="Description of Image 2" className="img-fluid"/>
    //         </Col>
    //         <Col xs={12} md={{ span: 6, order: 'first' }}>
    //             <h1>LOOK AT THIS COOL GUY</h1>
    //             <p>THIS GUY MAKES SO MUCH GODDAMN MONEY. FOLLOW HIS TRADES!</p>
    //         </Col>
    //     </Row>
    //     <Row>
    //         <Col xs={12} md={6}>
    //             <img src="image3.jpg" alt="Description of Image 3" className="img-fluid"/>
    //         </Col>
    //         <Col xs={12} md={6}>
    //             <h1>Sentiment Analysis</h1>
    //             <p>Just place some detail here, too lazy for it now</p>
    //         </Col>
    //     </Row>
    // </Container>
    <>
          {/* ********* HEADER 4 w/ VIDEO ********* */}
          <div className="header header-4">
          <div className="header-wrapper">
            {/* <Navbar className="navbar-transparent" expand="lg">
              <Container>
                <div className="navbar-translate">
                  <button className="navbar-toggler" id="example-header-4">
                    <span className="navbar-toggler-bar bar1" />
                    <span className="navbar-toggler-bar bar2" />
                    <span className="navbar-toggler-bar bar3" />
                  </button>
                  <NavbarBrand
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    SenTrade
                  </NavbarBrand>
                </div>
                <UncontrolledCollapse navbar toggler="#example-header-4">
                  <div className="navbar-collapse-header">
                    <Row>
                      <Col className="collapse-brand" xs="6">
                        <a href="#pablo" onClick={(e) => e.preventDefault()}>
                          SenTrade
                        </a>
                      </Col>
                      <Col className="collapse-close text-right" xs="6">
                        <button
                          className="navbar-toggler"
                          id="example-header-4"
                        >
                          <i className="tim-icons icon-simple-remove" />
                        </button>
                      </Col>
                    </Row>
                  </div>
                  <Nav className="mx-auto" navbar>
                    <NavItem className="active">
                      <NavLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        Home
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        About Us
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        Products
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        Contact Us
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <Nav className="nav navbar-right" navbar>
                    <NavItem>
                      <NavLink
                        href="https://twitter.com/CreativeTim"
                        target="_blank"
                      >
                        <i className="fab fa-twitter" />
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="https://www.facebook.com/CreativeTim"
                        target="_blank"
                      >
                        <i className="fab fa-facebook-square" />
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="https://www.instagram.com/CreativeTimOfficial"
                        target="_blank"
                      >
                        <i className="fab fa-instagram" />
                      </NavLink>
                    </NavItem>
                  </Nav>
                </UncontrolledCollapse>
              </Container>
            </Navbar> */}
            <NavBar transparent={true} />
            <div className="page-header header-video header-filter">
              <div className="overlay" />
              <video
                autoPlay="autoplay"
                loop="loop"
                muted="muted"
                playsInline="playsinline"
              >
                <source
                  src={require("../assets/video/Mt_Baker.mp4")}
                  type="video/mp4"
                />
              </video>
              <Container className="text-center">
                <div className="video-text">
                  <h2 className="description">An Innovative Approach</h2>
                  <h1 className="title"></h1>
                  <br />
                  <Button
                    className="btn-simple btn-neutral"
                    color="default"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    Start Now
                  </Button>
                </div>
              </Container>
            </div>
          </div>
        </div>
        {/* ********* END HEADER 4 ********* */}
    </>
    
    );
}
export default Home;