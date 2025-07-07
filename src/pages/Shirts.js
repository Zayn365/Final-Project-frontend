import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "./Shirts.css";

const categories = [
  "Kapsönlu Sweat T-Shirt",
  "Polo Yaka UzunKol T-Shirt",
  "Bisiklet Yaka Kısakol T-Shirt",
  "Polo Yaka Kısa Kol T-Shirt",
  "Eşofman Üst Fermuarlı",
  "Sport Eşofman Alt",
  "Kırtasiye Seti",
  "Yayın Seti",
];

const products = [
  {
    name: "Bisiklet Yaka Kısakol T-Shirt",
    size: "S",
    age: "11-12",
    price: "1200 TL",
  },
  {
    name: "Bisiklet Yaka Kısakol T-Shirt",
    size: "M",
    age: "12-13",
    price: "1200 TL",
  },
  {
    name: "Bisiklet Yaka Kısakol T-Shirt",
    size: "L",
    age: "13-14",
    price: "1200 TL",
  },
  {
    name: "Bisiklet Yaka Kısakol T-Shirt",
    size: "XL",
    age: "14-15",
    price: "1200 TL",
  },
];

function StaticCategoryPage() {
  return (
    <div className="category-page-container">
      <Container fluid className="py-4">
        <Row>
          {/* Sidebar */}
          <Col md={2}>
            <ul className="list-group side-menu">
              {categories.map((cat, idx) => (
                <li
                  key={idx}
                  className={`list-group-item ${
                    cat.includes("Bisiklet") ? "activate" : ""
                  }`}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </Col>

          {/* Product Grid */}
          <Col md={10}>
            <div className="product-header d-flex justify-content-between align-items-center mb-4">
              <h4 className="text-danger mb-0">
                Bisiklet Yaka Kısakol T-Shirt
              </h4>
              <div className="d-flex align-items-center gap-3 text-muted small">
                <div>Showing 1 - 48 of 574 products</div>
                <div>
                  Display:
                  <select className="ms-1">
                    <option>48 per page</option>
                  </select>
                </div>
                <div>
                  Sort by:
                  <select className="ms-1">
                    <option>Featured</option>
                  </select>
                </div>
                <div>
                  View:
                  <i className="fas fa-th ms-1"></i>
                </div>
              </div>
            </div>

            <Row>
              {products.map((product, idx) => (
                <Col key={idx} md={3} className="mb-4">
                  <div className="product-card text-center p-3 border rounded">
                    <img
                      src="https://pics.clipartpng.com/midle/Blue_T_Shirt_PNG_Clip_Art-3104.png"
                      alt="product"
                      className="img-fluid mb-3"
                    />
                    <div className="product-info text-start">
                      <div className="top-info">
                        <div className="info-row info-top">
                          <div>
                            <span className="label">Beden:</span>
                            <span className="value">{product.size}</span>
                          </div>
                          <div>
                            <span className="label">Yaş:</span>
                            <span className="value">{product.age}</span>
                          </div>
                        </div>
                        <div className="info-row">
                          <span className="label">Fiyat:</span>
                          <span className="value">{product.price}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="choose-btn mt-3 w-100" variant="danger">
                      Choose options
                    </Button>
                    <Button
                      className="quick-view-btn mt-2 w-100"
                      variant="light"
                    >
                      Quick view
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default StaticCategoryPage;
