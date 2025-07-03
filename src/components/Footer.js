import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-section py-5 text-white">
      <Container>
        <Row className="gy-4">
          {/* Left: Logo + Description */}
          <Col md={4}>
            <img src={Logo} alt="logo" className="mb-3" width={150} />
            <p>
              We offer a diverse selection of stationery, office, and school
              supplies, as well as gift and packaging products. Our inventory is
              carefully curated to provide the best quality and value for all
              your business and personal needs.
            </p>
          </Col>

          {/* Middle: Main Menu */}
          <Col md={4}>
            <h6 className="text-uppercase fw-bold mb-3">Main Menu</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/blogs" className="footer-link">
                  Blogs
                </Link>
              </li>
              <li>
                <Link to="/stationery" className="footer-link">
                  Stationery
                </Link>
              </li>
              <li>
                <Link to="/birthday" className="footer-link">
                  Birthday Items
                </Link>
              </li>
              <li>
                <Link to="/balloting" className="footer-link">
                  Balloting Offer
                </Link>
              </li>
            </ul>
          </Col>

          {/* Right: Newsletter */}
          <Col md={4}>
            <h6 className="text-uppercase fw-bold mb-3">Newsletter</h6>
            <p>Your one stop shop for all your stationery needs</p>
            <form>
              <input
                type="email"
                placeholder="Your email"
                className="form-control mb-2"
              />
              <button type="submit" className="btn btn-danger">
                Subscribe
              </button>
            </form>
          </Col>
        </Row>

        {/* Social Icons */}
        <Row className="mt-5">
          <Col className="text-center">
            <p className="mb-2">Follow Us</p>
            <div className="d-flex justify-content-center gap-3">
              <i className="fab fa-facebook-f social-icon"></i>
              <i className="fab fa-twitter social-icon"></i>
              <i className="fab fa-instagram social-icon"></i>
              <i className="fab fa-tiktok social-icon"></i>
              <i className="fab fa-linkedin-in social-icon"></i>
            </div>
          </Col>
        </Row>

        {/* Bottom line */}
        <hr className="border-light my-4" />
        <Row>
          <Col className="text-center small">
            <p className="mb-1"> BİRİKİM OKULLARI</p>
            <p>All Rights Reserved — 2025-26</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
