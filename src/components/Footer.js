import React from "react";
import { Row, Col, Ratio } from "react-bootstrap";
import "./Footer.css";
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div
      className="bg-light jumbotron mt-5"
      style={{ top: "4vh" }}
    >
      <Row className="mr-0">
        <Col md={6}>
          <h3 className="pt-4 px-4">Ecomm</h3>
          <p className="py-1 px-4">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </p>
          <ul>
            <h4 className="pt-1 px-3">Navigate: </h4>
          <li className="pt-1 px-4"><Link to="/"><h5>Home</h5></Link></li>
          <li className="pt-1 px-4"><Link to="/category/all"><h5>Products</h5></Link></li>
          <li className="pt-1 px-4"><Link to="/login"><h5>Login</h5></Link></li>
          <li className="pt-1 px-4"><Link to="/signup"><h5>Signup</h5></Link></li>
          </ul>
        </Col>
        <Col md={6} className="p-0 mr-0">
          <h3 className="py-4 px-5">Location:</h3>
          <div style={{width: '80%'}}>
          <Ratio aspectRatio="4x3">
          {/* eslint-disable-next-line */}
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3441.3026709775263!2d-87.7789593!3d30.3991534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x889a16b47e522a71%3A0xd49e37cf6bbb8570!2sMay%20James%20W!5e0!3m2!1sen!2s!4v1686145952015!5m2!1sen!2s" width="300" height="150" style={{border: 0}} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </Ratio>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Footer;
