import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Logo from "../assets/images/logo.png";
import "./Footer.css";

const Footer = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  return (
    <footer
      className="footer-section py-5 text-white position-relative"
      style={{ marginTop: "20px", overflowX: "hidden" }}
    >
      <Container>
        <Row className="gy-4">
          <Col md={4}>
            <img src={Logo} alt="logo" className="mb-3" width={150} />
            <p>
              Ofis, okul ve kırtasiye ürünlerinde kaliteli ve ekonomik çözümler
              sunuyoruz. Hem bireysel hem kurumsal ihtiyaçlar için yanınızdayız.
            </p>
          </Col>

          <Col md={4}>
            <h6 className="text-uppercase fw-bold mb-3">Navigasyon</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="footer-link">
                  Ana Sayfa
                </Link>
              </li>
              {!user && (
                <li>
                  <Link to="/category/all" className="footer-link">
                    Kategoriler
                  </Link>
                </li>
              )}
              {user?.isAdmin && (
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

          <Col md={4}>
            <h6 className="text-uppercase fw-bold mb-3">Bülten</h6>
            <p>Tüm kırtasiye ihtiyaçlarınız için buradayız.</p>
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

        <hr className="border-light my-4" />
        <Row>
          <Col className="text-center small">
            <p className="mb-1">BİKEV OKULLARI</p>
            <p>Tüm Hakları Saklıdır — 2025-26</p>
          </Col>
        </Row>
      </Container>

      {/* Sağ alt sabit admin giriş butonu */}
      <div
        onClick={() => navigate("/adminLogin")}
        style={{
          position: "absolute",
          bottom: "16px",
          right: "16px",
          width: "48px",
          height: "48px",
          backgroundColor: "#fff",
          color: "#000",
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          zIndex: 1, // footer içinde kalacak şekilde küçük z-index
        }}
        title="Yönetici Girişi"
      >
        <i className="fas fa-user-cog"></i>
      </div>
    </footer>
  );
};

export default Footer;
