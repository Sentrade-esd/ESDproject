import React from "react";
// import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
// import money from '../Assets/money.jpg';
// import coolguy from '../Assets/coolguy.jpg';
// import '../styles/HomeBody.css';
import "Assets/css/nucleo-icons.css";
import "Assets/css/blk-design-system-pro-react.css";
import NavBar from "Components/NavBar";
import { useState, useEffect, useRef, useContext } from "react";
import { AlertContext } from '../Components/AlertContext'; // adjust the path as needed
import { useNavigate } from "react-router-dom";

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

function Home() {
  const navigate = useNavigate();
  const handleSearchClick = () => {
    navigate("/search");
  };

  const { alert, setAlert } = useContext(AlertContext);

  const [placeHolderText, setPlaceHolderText] = useState("");
  const index = useRef(0);
  const fullText = "  Search for sentiments of your favourite companies  ";

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (index.current < fullText.length) {
                setPlaceHolderText((prevText) => prevText + fullText.charAt(index.current));
                index.current++;
            } else {
                clearInterval(intervalId);
            }
        }, 100); // Speed of typewriter, adjust as needed
        return () => clearInterval(intervalId); // Clean up on unmount
    }, []);


  return (
    <>
      {/* {alert && <div className='alert'>{alert}</div>} */}
      {/* ********* HEADER 4 w/ VIDEO ********* */}
      <div className="header header-4">
        <div className="header-wrapper">
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
                src={require("../Assets/video/bgVideo.mp4")}
                type="video/mp4"
              />
            </video>
            <Container className="text-center">
              <div className="video-text">
                <h2 className="description">
                  {placeHolderText}
                </h2>
                <h1 className="title"></h1>
                <br />
                <Button
                  className="btn-simple btn-neutral"
                  color="default"
                  href="#pablo"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSearchClick();
                  }}
                >
                  Search Now
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
