import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Logo from "../assets/images/logo.png";
import "./Footer.css";

const Footer = () => {
  const user = useSelector((state) => state.user);

  return (
    <footer
      className="footer-section py-5 text-white"
      style={{ marginTop: "20px" }}
    >
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

          {/* Middle: Conditional Nav Links */}
          <Col md={4}>
            <h6 className="text-uppercase fw-bold mb-3">Navigasyon</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="footer-link">
                  Ana Sayfa
                </Link>
              </li>

              {!user && (
                <>
                  <li>
                    <Link to="/category/all" className="footer-link">
                      Kategoriler
                    </Link>
                  </li>
                </>
              )}

              {user && user.isAdmin && (
                <li>
                  <Link to="/admin" className="footer-link">
                    Yönetim Paneli
                  </Link>
                </li>
              )}

              {user && !user.isAdmin && (
                <>
                  <li>
                    <Link to="/cart" className="footer-link">
                      Sepet
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="footer-link">
                      Siparişlerim
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </Col>

          {/* Right: Newsletter */}
          <Col md={4}>
            <h6 className="text-uppercase fw-bold mb-3">Bülten</h6>
            <p>Tek noktadan tüm kırtasiye ihtiyaçlarınız için buradayız</p>
            <form>
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="form-control mb-2"
              />
              <button type="submit" className="btn btn-danger">
                Abone Ol
              </button>
            </form>
          </Col>
        </Row>

        {/* Social Icons */}
        <Row className="mt-5">
          <Col className="text-center">
            <p className="mb-2">Bizi Takip Edin</p>
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
            <p className="mb-1">BİRİKİM OKULLARI</p>
            <p>Tüm Hakları Saklıdır — 2025-26</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
