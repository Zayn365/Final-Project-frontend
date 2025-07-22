import axios from "../axios";
import React, { useEffect, useState } from "react";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { Container, Row, Col, Badge, Button, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import SimilarProduct from "../components/SimilarProduct";
import "./ProductPage.css";
import { LinkContainer } from "react-router-bootstrap";
import { useAddToCartMutation } from "../services/appApi";
import ToastMessage from "../components/ToastMessage";

function ProductPage() {
  const { id } = useParams();
  const user = useSelector((state) => state.user);
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addToCart, { isSuccess }] = useAddToCartMutation();

  const handleDragStart = (e) => e.preventDefault();

  useEffect(() => {
    axios.get(`/products/${id}`).then(({ data }) => {
      setProduct(data.product);
      setSimilar(data.similar);
    });
  }, [id]);

  if (!product) return <Loading />;

  const responsive = {
    0: { items: 1 },
    568: { items: 2 },
    1024: { items: 3 },
  };

  const images = product.pictures.map((picture) => (
    <img
      className="product__carousel--image"
      src={picture.url}
      onDragStart={handleDragStart}
      key={picture.url}
    />
  ));

  const similarProducts = (similar || []).map((product, idx) => (
    <div className="item" data-value={idx} key={product._id}>
      <SimilarProduct {...product} />
    </div>
  ));
  console.log(product);
  return (
    <Container className="pt-4" style={{ position: "relative" }}>
      <Row>
        <Col lg={6}>
          <AliceCarousel
            mouseTracking
            items={images}
            controlsStrategy="alternate"
          />
        </Col>

        <Col lg={6} className="pt-4">
          <h1>{product.name}</h1>
          <p>
            <Badge bg="danger">{product.category}</Badge>
          </p>
          <p className="product__price">₺{product.price}</p>
          <p className="py-3" style={{ textAlign: "justify" }}>
            <strong>Açıklama:</strong> {product.description}
          </p>

          {user && !user.isAdmin && (
            <Form className="mb-4">
              <Row className="g-3 align-items-end">
                <Col xs={12} md={6}>
                  {product.class.length > 0 || product.hasClass === true ? (
                    <>
                      <Form.Label>Sinif: </Form.Label>
                      <span
                        className={
                          product?.class[0]
                            ? "text-dark"
                            : "text-muted fst-italic"
                        }
                      >
                        {" "}
                        {Array.isArray(product?.class)
                          ? product.class[0]
                          : "Mevcut değil"}
                      </span>
                      {/* <Form
                      {/* <Form.Select size="lg">
                        <option value="">-- Select sinif --</option>
                        {(Array.isArray(product?.class)
                          ? product.class
                          : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                        ).map((classNo) => (
                          <option key={classNo} value={classNo}>
                            {classNo}
                          </option>
                        ))}
                      </Form.Select> */}
                    </>
                  ) : (
                    <>
                      <Form.Label>Choose Size</Form.Label>
                      <Form.Select size="lg">
                        <option value="">-- Select size --</option>
                        {(Array.isArray(product?.sizes)
                          ? product.sizes
                          : ["S", "M", "L", "XL", "2XL", "3XL", "4XL"]
                        ).map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </Form.Select>
                    </>
                  )}
                </Col>

                <Col xs={6} md={3}>
                  <Form.Label>Quantity</Form.Label>
                  <div className="d-flex align-items-center">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      -
                    </Button>
                    <Form.Control
                      type="number"
                      value={quantity}
                      min={1}
                      max={99}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= 99) {
                          setQuantity(val);
                        }
                      }}
                      className="mx-2 text-center"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    >
                      +
                    </Button>
                  </div>
                </Col>

                <Col xs={6} md={3}>
                  <Button
                    variant="danger"
                    size="lg"
                    className="w-100"
                    onClick={() =>
                      addToCart({
                        userId: user._id,
                        productId: id,
                        price: product.price,
                        image: product.pictures[0].url,
                        quantity,
                      })
                    }
                  >
                    Sepete Ekle{" "}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}

          {user && user.isAdmin && (
            <LinkContainer to={`/admin`}>
              <Button size="lg">Ürünü Düzenle</Button>
            </LinkContainer>
          )}

          {isSuccess && (
            <ToastMessage
              bg="info"
              title="Added to cart"
              body={`${product.name} is in your cart`}
            />
          )}
        </Col>
      </Row>

      <div className="my-4">
        <h2>Benzer Ürünler</h2>
        <div className="d-flex justify-content-center align-items-center flex-wrap">
          <AliceCarousel
            mouseTracking
            items={similarProducts}
            responsive={responsive}
            controlsStrategy="alternate"
          />
        </div>
      </div>
    </Container>
  );
}

export default ProductPage;
