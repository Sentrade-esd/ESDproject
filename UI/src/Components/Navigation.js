import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

const Navigation = () => {
  const [modalShow, setModalShow] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setIsLoggedIn(true);
      setUsername(savedUsername);
    }
  }, []);

const handleLogin = (username, password) => {
  
  axios.get(`http://localhost:5000/user/${username}`)
    .then((response) => {
      if (response.data.code === 200) {
        if (password === response.data.data.Password) {
          console.log(response.data.data);
          sessionStorage.setItem('username', username);
          sessionStorage.setItem("id", response.data.data.UserID);
          setIsLoggedIn(true);
          setUsername(username); 
          setModalShow(false);
        } else {
          console.error('Wrong password');
        }
      } else {
        console.error('User does not exist');
      }
    })
    .catch((error) => {
      console.error('There was an error!', error);
    });
};

  const handleLogout = () => {
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
  };

  const handleSignup = (Email, Password, TelegramHandle) => {
    axios.post('http://127.0.0.1:5000/user', {
      Email: Email,
      Password: Password,
      telegram_handle: TelegramHandle
    }).then(response => {
      setIsLoggedIn(true);
      setUsername(Email); 
      setModalShow(false);
    }).catch(error => {
      console.error('There was an error!', error);
    });
  };


  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="home">Navbar</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="home">Home</Nav.Link>
          <Nav.Link href="search">Search</Nav.Link>
        </Nav>
        {isLoggedIn ? (
          <React.Fragment>
            <Navbar.Text>Signed in as: {username}</Navbar.Text>
            <Button onClick={handleLogout} variant="outline-info">Logout</Button>
          </React.Fragment>
        ) : (
          <Button variant="outline-info" onClick={() => setModalShow(true)}>
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        )}
      </Container>
      {isLoggedIn ? null : isLogin ? 
        <LoginModal handleLogin={handleLogin} show={modalShow} onHide={() => setModalShow(false)} flipModal={() => setIsLogin(!isLogin)} />  
        :
        <SignupModal handleSignup={handleSignup} show={modalShow} onHide={() => setModalShow(false)} flipModal={() => setIsLogin(!isLogin)} />
      }
    </Navbar>
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
            <Form.Control type="text" placeholder="Enter username" value={username} onChange={(event) => setUsername(event.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </Form.Group>
          <Button variant="primary" type="submit">Submit</Button>
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

const SignupModal = ({ handleSignup, flipModal, ...props }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");

  const onSubmit = (event) => {
    event.preventDefault();
    handleSignup(email, password, telegramHandle);
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
            <Form.Control type="email" placeholder="Enter email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Telegram Handle</Form.Label>
            <Form.Control type="text" placeholder="Enter Telegram handle" value={telegramHandle} onChange={(event) => setTelegramHandle(event.target.value)} required />
          </Form.Group>
          <Button variant="primary" type="submit">Submit</Button>
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

export default Navigation;