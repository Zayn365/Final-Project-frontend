import axios from "../axios";
import React, { useEffect } from "react";
import { Col, Row, Carousel } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import categories from "../categories";
import "./Home.css";
import { useDispatch, useSelector } from "react-redux";
import { updateProducts } from "../features/productSlice";
import { updateCampaigns } from "../features/campaignSlice";
import ProductPreview from "../components/ProductPreview";
import BrandGrid from "../components/BrandGrid";
import Testimonials from "../components/Testimonials";
import Location from "../components/Location";
import CategoryPage from "./CategoryPage";
import firstImage from "../assets/imagesSlider/1.jpeg";
import secondImage from "../assets/imagesSlider/2.jpeg";
import thirdImage from "../assets/imagesSlider/3.jpeg";
import forthImage from "../assets/imagesSlider/4.jpeg";
import fifthImage from "../assets/imagesSlider/5.jpeg";
import sixthImage from "../assets/imagesSlider/6.jpeg";
function Home() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products);
  const lastProducts = products.slice(0, 15); // Limit to 3 rows

  useEffect(() => {
    axios.get("/products").then(({ data }) => dispatch(updateProducts(data)));
    axios.get("/campaigns").then(({ data }) => dispatch(updateCampaigns(data)));
  }, []);

  return (
    <div>
      {/* Hero Carousel */}
      <Carousel fade className="hero-carousel">
        <Carousel.Item>
          <div className="hero-slide">
            <img
              src={firstImage}
              className="d-block w-100"
              alt="Office Accessories"
            />
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div className="hero-slide">
            <img
              src={secondImage}
              className="d-block w-100"
              alt="Office Accessories"
            />
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div className="hero-slide">
            <img
              src={thirdImage}
              className="d-block w-100"
              alt="Office Accessories"
            />
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div className="hero-slide">
            <img
              src={forthImage}
              className="d-block w-100"
              alt="Office Accessories"
            />
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div className="hero-slide">
            <img
              src={fifthImage}
              className="d-block w-100"
              alt="Office Accessories"
            />
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div className="hero-slide">
            <img
              src={sixthImage}
              className="d-block w-100"
              alt="Office Accessories"
            />
          </div>
        </Carousel.Item>
      </Carousel>
      <CategoryPage />
      {/* Last Ürünler */}
      {/* <div className="featured-products-container container mt-4">
        <h3 className="text-center fw-bold mb-4">Latest Ürünler</h3>
        <Row className="g-3 five-col-grid">
          {lastProducts.map((product) => (
            <Col
              key={product._id}
              xs={6}
              sm={4}
              md={3}
              lg={2}
              className="d-flex justify-content-center"
            >
              <ProductPreview {...product} />
            </Col>
          ))}
        </Row>
        <div>
          <Link
            to="/category/all"
            style={{
              textAlign: "right",
              display: "block",
              textDecoration: "none",
              marginTop: "10px",
              color: "#00214d",
            }}
          >
            <span
              className="text-danger hover-red"
              style={{ cursor: "pointer" }}
            >
              View more {">>"}
            </span>
          </Link>
        </div>
      </div> */}

      {/* Sale Banner */}
      {/* <div className="sale__banner--container mt-4">
        <img
          src="https://res.cloudinary.com/learn-code-10/image/upload/v1654093280/xkia6f13xxlk5xvvb5ed.png"
          width="100%"
          alt="Sale Banner"
        />
      </div> */}

      {/* Categories */}
      {/* <div className="recent-products-container container mt-4">
        <h3 className="text-center fw-bold mb-4">Categories</h3>
        <Row className="g-4">
          {categories.map((category) => (
            <LinkContainer
              to={`/category/${category.name.toLowerCase()}`}
              key={category.name}
            >
              <Col md={4} sm={6} xs={12}>
                <div
                  className="category-tile d-flex align-items-end justify-content-center text-white text-uppercase fw-bold"
                  style={{
                    height: "200px",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${category.img})`,
                    cursor: "pointer",
                  }}
                >
                  {category.name}
                </div>
              </Col>
            </LinkContainer>
          ))}
        </Row>
      </div> */}

      {/* Brands */}
      {/* <BrandGrid /> */}

      {/* Testimonials */}
      {/* <Testimonials /> */}
      {/* Testimonials */}
      {/* <Location /> */}
    </div>
  );
}

export default Home;
