import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import money from '../Assets/money.jpg';
import coolguy from '../Assets/coolguy.jpg';
import '../Styles/HomeBody.css';

function HomeBody(){
    return (
        <Container fluid>

        <Row>
            <Col xs={12} md={6}>
                <img src={money} alt="Description of Image 1" className="img-fluid"/>
            </Col>
            <Col xs={12} md={6} style={{textAlign: 'justify'}}>
                <h1>FAST CASH</h1>
                <p>GET RICH NOW LOSER. FAST MONEY. EASY MONEY</p>
            </Col>
        </Row>
        <Row>
            <Col xs={12} md={{ span: 6, order: 'last' }}>
                <img src={coolguy} alt="Description of Image 2" className="img-fluid"/>
            </Col>
            <Col xs={12} md={{ span: 6, order: 'first' }}>
                <h1>LOOK AT THIS COOL GUY</h1>
                <p>THIS GUY MAKES SO MUCH GODDAMN MONEY. FOLLOW HIS TRADES!</p>
            </Col>
        </Row>
        <Row>
            <Col xs={12} md={6}>
                <img src="image3.jpg" alt="Description of Image 3" className="img-fluid"/>
            </Col>
            <Col xs={12} md={6}>
                <h1>Sentiment Analysis</h1>
                <p>Just place some detail here, too lazy for it now</p>
            </Col>
        </Row>
    </Container>
    );
}
export default HomeBody;