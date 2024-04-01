import React from "react";
// import { Navbar, Container, Nav } from 'react-bootstrap';
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import {
  // Button,
  UncontrolledCollapse,
  // Label,
  // FormGroup,
  // Input,
  // InputGroupAddon,
  // InputGroupText,
  // InputGroup,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col,
} from "reactstrap";

const NavBar = ({ transparent }) => {
  const navClass = transparent ? "navbar-transparent" : "bg-default";

  const [modalShow, setModalShow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  // const [telegramID, setTelegramID] = useState(
  //   localStorage.getItem("telegramID") || null
  // );
  const [teleID, setTeleID] = useState(localStorage.getItem("teleID") || null);

  const [pendingTeleID, setPendingTeleID] = useState(
    localStorage.getItem("pendingTeleId") || "false"
  );
  useEffect(() => {
    // const savedUsername = localStorage.getItem("username");
    const savedUsername = "hello";
    if (savedUsername) {
      setIsLoggedIn(true);
      console.log("isloggedin", isLoggedIn);
      setUsername(savedUsername);
    }
  }, []);
  useEffect(() => {
    console.log("isl", isLoggedIn);
    console.log("islogin", isLogin);
  }, [isLoggedIn, isLogin]);
  useEffect(() => {
    // Get userId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const teleIdFromUrl = urlParams.get("teleId");
    // const editFromUrl = urlParams.get("edit");
    console.log(isLoggedIn);
    console.log(isLogin);
    if (teleIdFromUrl !== null && !isLoggedIn) {
      // Store userId in local storage
      console.log("hi");
      localStorage.setItem("teleID", teleIdFromUrl);
      localStorage.setItem("pendingTeleId", "false");
      setPendingTeleID("false");
      handleSignup(email, password, telegramHandle, teleIdFromUrl);
      // localStorage.setItem("edit", editFromUrl);
      // Set userId state
      setTeleID(teleIdFromUrl);

      // setEdit(editFromUrl);
      // uncomment below before pushing
      // setIsLoggedIn(false);
      setIsLogin(true);
      setModalShow(true);
    }

    // if (editFromUrl === "true") {
    // }
    console.log("teleIdFromUrl", teleIdFromUrl);
  }, []);
  const handleLogin = (username, password) => {
    axios
      .get(`http://localhost:5000/user/${username}`)
      .then((response) => {
        if (response.data.code === 200) {
          if (password === response.data.data.Password) {
            console.log(response.data.data);
            localStorage.setItem("username", username); // Note that username is actually the email
            localStorage.setItem("id", response.data.data.UserID);
            setIsLoggedIn(true);
            setUsername(username);
            setModalShow(false);
          } else {
            console.error("Wrong password");
          }
        } else {
          console.error("User does not exist");
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
  };

  const sendToTele = (Email, Password, TelegramHandle) => {
    // axios
    //   .post("http://127.0.0.1:5000/user", {
    //     Email: Email,
    //     Password: Password,
    //     telegram_handle: TelegramHandle,
    //   })
    //   .then((response) => {
    //     if (response.data.code === 200) {
    //       axios.get(`http://localhost:5000/user/${Email}`).then((response) => {
    //         if (response.data.code === 200) {
    //           localStorage.setItem("username", Email);
    //           localStorage.setItem("id", response.data.data.UserID);
    //           setIsLoggedIn(true);
    //           setUsername(Email);
    //         } else {
    //           console.error("Fetch data after signup failed");
    //         }
    //       });
    //     } else {
    //       console.error("Signup failed");
    //     }
    //     setModalShow(false);

    //   })
    //   .catch((error) => {
    //     console.error("There was an error while signing up!", error);
    //   });
    const redirectToTelegramBot = async () => {
      localStorage.setItem("pendingTeleId", "true");
      setPendingTeleID("true");
      try {
        const response = await axios.get(
          "http://localhost:3002/teleBot/redirect",
          {
            headers: {
              bro: window.location.href,
            },
          }
        );

        if (response.status === 200) {
          const redirectUrl = response.data;
          console.log(`Redirecting to: ${redirectUrl}`);
          window.location.href = redirectUrl;
        } else {
          console.error("Failed to redirect");
        }
      } catch (error) {
        console.error(`Error: ${error.message}`);
      }
    };
    setJustSignedUp(true);

    setTimeout(() => {
      redirectToTelegramBot();

      // localStorage.setItem("telegramPage", "true");
    }, 3000);
  };
  const handleSignup = (Email, Password, TelegramHandle, TeleId) => {
    axios
      .post("http://127.0.0.1:5000/user", {
        Email: Email,
        Password: Password,
        Telehandle: TelegramHandle,
        TeleID: TeleId,
      })
      .then((response) => {
        if (response.data.code === 200) {
          axios.get(`http://localhost:5000/user/${Email}`).then((response) => {
            if (response.data.code === 200) {
              localStorage.setItem("username", Email);
              localStorage.setItem("id", response.data.data.UserID);
              // setIsLoggedIn(true);
              // setUsername(Email);
            } else {
              console.error("Fetch data after signup failed");
            }
          });
        } else {
          console.error("Signup failed");
        }
        // setModalShow(false);
      })
      .catch((error) => {
        console.error("There was an error while signing up!", error);
      });
  };

  //   const handleNewUser = (Email) => {

  //   };

  const navigate = useNavigate();
  const handleTradeHistoryClick = () => {
    if (!isLoggedIn) {
      setModalShow(true);
    } else {
      navigate("/TradeHistory");
    }
  };
  const handleSearchClick = () => {
    navigate("/search");
  };
  return (
    <>
      {!justSignedUp && (
        <Navbar className={navClass} expand="lg">
          <Container>
            <div className="navbar-translate">
              <button className="navbar-toggler" id="example-header-4">
                <span className="navbar-toggler-bar bar1" />
                <span className="navbar-toggler-bar bar2" />
                <span className="navbar-toggler-bar bar3" />
              </button>
              <NavbarBrand href="#pablo" onClick={(e) => e.preventDefault()}>
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
                    <button className="navbar-toggler" id="example-header-4">
                      <i className="tim-icons icon-simple-remove" />
                    </button>
                  </Col>
                </Row>
              </div>
              <Nav className="mx-auto" navbar>
                {isLoggedIn ? (
                  <>
                    {/* <NavItem className="active">
            <NavLink
              href="#pablo"
              onClick={(e) => e.preventDefault()}
            >
              Home
            </NavLink>
          </NavItem> */}
                    <NavItem>
                      <NavLink
                        href="landing"
                        // onClick={}
                      >
                        Home
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink href="search" onClick={handleSearchClick}>
                        Search
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink onClick={handleTradeHistoryClick}>
                        Trades
                      </NavLink>
                    </NavItem>
                  </>
                ) : null}
              </Nav>
              <Nav className="nav navbar-right" navbar>
                {!isLoggedIn ? (
                  <NavItem>
                    <NavLink onClick={() => setModalShow(true)}>Login</NavLink>
                  </NavItem>
                ) : (
                  <NavItem>
                    <NavLink href="#pablo" onClick={handleLogout}>
                      Logout
                    </NavLink>
                  </NavItem>
                )}
                {/* <NavItem>
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
          </NavItem> */}
              </Nav>
            </UncontrolledCollapse>
          </Container>
          {isLoggedIn ? null : isLogin ? (
            <LoginModal
              handleLogin={handleLogin}
              show={modalShow}
              onHide={() => setModalShow(false)}
              flipModal={() => setIsLogin(!isLogin)}
            />
          ) : (
            <SignupModal
              sendToTele={sendToTele}
              email={email}
              password={password}
              telegramHandle={telegramHandle}
              setEmail={setEmail}
              setPassword={setPassword}
              setTelegramHandle={setTelegramHandle}
              show={modalShow}
              onHide={() => setModalShow(false)}
              flipModal={() => setIsLogin(!isLogin)}
            />
          )}
        </Navbar>
      )}
      {justSignedUp && <LoadingModal></LoadingModal>}
      {pendingTeleID == "true" && <TelegramPage />}
    </>
    // <Navbar className={navClass} expand="lg">
    //   <Container>
    //     <Navbar.Brand href="#pablo">Brand</Navbar.Brand>
    //     <Navbar.Toggle aria-controls="basic-navbar-nav" />
    //     <Navbar.Collapse id="basic-navbar-nav">
    //       <Nav className="ml-auto">
    //         {loggedIn ? (
    //           <>
    //             <Nav.Link href="#pablo">Logout</Nav.Link>
    //             <Nav.Link href="#pablo">Profile</Nav.Link>
    //             {/* Add more links for logged in users here */}
    //           </>
    //         ) : (
    //           <>
    //             <Nav.Link href="#pablo">Login</Nav.Link>
    //             <Nav.Link href="#pablo">Register</Nav.Link>
    //             {/* Add more links for non-logged in users here */}
    //           </>
    //         )}
    //       </Nav>
    //     </Navbar.Collapse>
    //   </Container>
    // </Navbar>
  );
};
const LoadingModal = () => {
  return (
    <div class="loader-container">
      <div class="loader"></div>
      <div class="loader-text">Redirecting you to our TeleBot...</div>
    </div>
  );
};
const TelegramPage = () => {
  return (
    <div>
      <h1>Telegram Page</h1>
    </div>
  );
};
const LoginModal = ({ handleLogin, flipModal, ...props }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (event) => {
    event.preventDefault();
    handleLogin(username, password);
  };

  return (
    <Modal {...props} size="lg" aria-labelledby="login-modal">
      <Modal.Header closeButton>
        <Modal.Title id="login-modal">Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={flipModal}>
          Need an account? Sign up
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const SignupModal = ({
  sendToTele,
  email,
  password,
  telegramHandle,
  setEmail,
  setPassword,
  setTelegramHandle,
  flipModal,
  ...props
}) => {
  const onSubmit = (event) => {
    event.preventDefault();
    // handleSignup(email, password, telegramHandle);
    sendToTele();
  };

  return (
    <Modal {...props} size="lg" aria-labelledby="signup-modal">
      <Modal.Header closeButton>
        <Modal.Title id="signup-modal">Signup</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Telegram Handle</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Telegram handle"
              value={telegramHandle}
              onChange={(event) => setTelegramHandle(event.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={flipModal}>
          Have an account? Login
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
// const SignupModal = ({ handleSignup, flipModal, ...props }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [telegramHandle, setTelegramHandle] = useState("");

//   const onSubmit = (event) => {
//     event.preventDefault();
//     handleSignup(email, password, telegramHandle);
//   };

//   return (
//     <Modal {...props} size="lg" aria-labelledby="signup-modal">
//       <Modal.Header closeButton>
//         <Modal.Title id="signup-modal">Signup</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form onSubmit={onSubmit}>
//           <Form.Group className="mb-3">
//             <Form.Label>Email</Form.Label>
//             <Form.Control type="email" placeholder="Enter email" value={email} onChange={(event) => setEmail(event.target.value)} required />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>Password</Form.Label>
//             <Form.Control type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
//           </Form.Group>
//           <Form.Group className="mb-3">
//             <Form.Label>Telegram Handle</Form.Label>
//             <Form.Control type="text" placeholder="Enter Telegram handle" value={telegramHandle} onChange={(event) => setTelegramHandle(event.target.value)} required />
//           </Form.Group>
//           <Button variant="primary" type="submit">Submit</Button>
//         </Form>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={flipModal}>
//           Have an account? Login
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

export default NavBar;
