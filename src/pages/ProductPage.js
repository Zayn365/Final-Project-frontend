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
import { formatWithCommas, unformatNumber } from "../hooks/formatFuctions";

function ProductPage() {
  const { id } = useParams();
  const user = useSelector((state) => state.user);
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addToCart, { isSuccess }] = useAddToCartMutation();
  const handleDragStart = (e) => e.preventDefault();
  const campaigns = useSelector((state) => state.campaigns || []);

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
          {(() => {
            let finalPrice = Number(product.price) || 0;
            let campaignAmount;
            const campaign = campaigns.find(
              (c) =>
                Array.isArray(c.products) &&
                c.products.includes(product.category) &&
                c.selectedUser === user?.tc_id
            );

            if (
              campaign &&
              typeof campaign.amount === "number" &&
              !isNaN(campaign.amount)
            ) {
              if (campaign.type === "percentage") {
                campaignAmount = `${campaign.amount}%`;
                finalPrice -= (finalPrice * campaign.amount) / 100;
              } else if (campaign.type === "fixed") {
                campaignAmount = `₺${campaign.amount}`;
                finalPrice -= campaign.amount;
              }
              finalPrice = Math.max(finalPrice, 0);
            }

            return (
              <div className="d-flex flex-column align-items-center text-center mb-3">
                {campaignAmount && (
                  <Badge bg="success" className="mb-2">
                    {campaignAmount} İNDİRİM
                  </Badge>
                )}

                <p className="product__price mb-0">
                  ₺ {formatWithCommas(finalPrice.toFixed(0))}{" "}
                  {campaignAmount && (
                    <span className="text-muted text-decoration-line-through ms-2 small">
                      ₺ {formatWithCommas(Number(product.price).toFixed(0))}
                    </span>
                  )}
                </p>
              </div>
            );
          })()}

          <p className="py-3" style={{ textAlign: "justify" }}>
            <strong>Ürün Adı:</strong> {product.description}
          </p>

          {user && !user.isAdmin && (
            <Form className="mb-4">
              <Row className="g-3 align-items-end text-center">
                {/* Sınıf */}
                {product.hasClass &&
                  Array.isArray(product.class) &&
                  product.class.length > 0 && (
                    <Col xs={12} md={4}>
                      <Form.Label>Sınıf:</Form.Label>
                      <Form.Control
                        type="text"
                        value={product.class[0] || "Mevcut değil"}
                        readOnly
                        className="w-100 text-center"
                      />
                    </Col>
                  )}

                {/* Beden */}
                {product.hasSize && (
                  <Col xs={12} md={4}>
                    <Form.Label>Beden:</Form.Label>
                    <Form.Select className="w-100 text-center">
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
                  </Col>
                )}

                {/* Miktar */}
                <Col xs={12} md={4}>
                  <Form.Label>Miktar:</Form.Label>
                  <div className="d-flex justify-content-between align-items-center w-100 gap-2">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex-grow-1"
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
                      className="text-center flex-grow-2"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                      className="flex-grow-1"
                    >
                      +
                    </Button>
                  </div>
                </Col>

                {/* Add to Cart Button */}
                <Col xs={12}>
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
                    Sepete Ekle
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
              bg="success"
              title="Sepete Eklendi"
              body={`${product.name} sepetinize eklendi`}
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
