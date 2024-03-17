import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

const Navigation = () => {
  const [modalShow, setModalShow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = (newUsername) => {
    localStorage.setItem('username', newUsername);
    setIsLoggedIn(true);
    setUsername(newUsername); 
    setModalShow(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
  };

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="home">Navbar</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="home">Home</Nav.Link>
          <Nav.Link href="search">Search</Nav.Link>
          {isLoggedIn && <Nav.Link href="trade">Trade</Nav.Link>}
        </Nav>
        {isLoggedIn ? (
          <React.Fragment>
            <Navbar.Text>Signed in as: {username}</Navbar.Text>
            <Button onClick={handleLogout} variant="outline-info">
              Logout
            </Button>
          </React.Fragment>
        ) : (
          <Button variant="outline-info" onClick={() => setModalShow(true)}>
            Login
          </Button>
        )}
      </Container>
      <LoginModal 
       handleLogin={handleLogin} 
       show={modalShow} 
       onHide={() => setModalShow(false)} 
      />
    </Navbar>
  );
};

const LoginModal = ({ handleLogin, ...props }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (event) => {
    event.preventDefault();
    handleLogin(username);
  };


  const LogoutModal = ({ handleLogout, ...props }) => {
    return (
      <Modal {...props} size="lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Confirmation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to logout?</p>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Modal.Body>
      </Modal>
    )
  }

  return (
    <Modal {...props} size="lg">
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};





export default Navigation;