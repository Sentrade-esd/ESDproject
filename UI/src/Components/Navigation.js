import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import React, { useState } from 'react';


const Navigation = () => {
    const [modalShow, setModalShow] = useState(false);
  
    return (
        <Navbar bg="dark" variant="dark">
            <Container>
            <Navbar.Brand href="/home">Navbar</Navbar.Brand>
            <Nav className="me-auto">
                <Nav.Link href="/home">Home</Nav.Link>
                <Nav.Link href="/search">Search</Nav.Link>
                <Nav.Link href="/trade">Trade</Nav.Link>
            </Nav>
              <Button variant="outline-info" onClick={() => setModalShow(true)}>Login</Button>
            </Container>

            <LoginModal
                show={modalShow}
                onHide={() => setModalShow(false)}
              />
        </Navbar>
    )
}

const LoginModal = (props) => {
    return (
        <Modal
            {...props}
            size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Login
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" placeholder="Enter username" />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder="Password" />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
          </Modal.Body>
        </Modal>
    )
}

export default Navigation;