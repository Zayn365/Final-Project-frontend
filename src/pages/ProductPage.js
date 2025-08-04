import axios from "../axios";
import React, { useEffect, useState } from "react";
import AliceCarousel from "react-alice-carousel";
import "react-alice-carousel/lib/alice-carousel.css";
import { Container, Row, Col, Badge, Button, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
// import SimilarProduct from "../components/SimilarProduct";
import "./ProductPage.css";
import { LinkContainer } from "react-router-bootstrap";
import { useAddToCartMutation } from "../services/appApi";
import ToastMessage from "../components/ToastMessage";
import { formatWithCommas } from "../hooks/formatFuctions";

function ProductPage() {
  const { id } = useParams();
  const user = useSelector((state) => state.user);
  const [product, setProduct] = useState(null);
  // const [similar, setSimilar] = useState(null);
  const [orders, setOrders] = useState([]);
  const [toastError, setToastError] = useState(false);
  const [showGifts, setShowGifts] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [addToCart, { isSuccess }] = useAddToCartMutation();
  const handleDragStart = (e) => e.preventDefault();
  const campaigns = useSelector((state) => state.campaigns || []);
  useEffect(() => {
    if (user) {
      axios.get("/orders").then(({ data }) => {
        setOrders(data || []);
      });
    }
  }, [user]);

  useEffect(() => {
    axios.get(`/products/${id}`).then(({ data }) => {
      setProduct(data.product);
      // setSimilar(data.similar);
    });
  }, [id]);
  useEffect(() => {
    if (toastError) {
      const timer = setTimeout(() => setToastError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastError]);
  if (!product) return <Loading />;

  // const responsive = {
  //   0: { items: 1 },
  //   568: { items: 2 },
  //   1024: { items: 3 },
  // };

  const images = product.pictures.map((picture) => (
    <img
      className="product__carousel--image"
      src={picture.url}
      onDragStart={handleDragStart}
      key={picture.url}
    />
  ));

  // const similarProducts = (similar || []).map((product, idx) => (
  //   <div className="item" data-value={idx} key={product._id}>
  //     <SimilarProduct {...product} />
  //   </div>
  // ));
  return (
    <Container className="pt-4" style={{ position: "relative" }}>
      {toastError && (
        <ToastMessage
          bg="danger"
          title="Zaten Alındı"
          body="Bu ürünü daha önce almışsınız."
          onClose={() => setToastError(false)}
        />
      )}

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
            const campaign = campaigns.find((c) => {
              return (
                Array.isArray(c.products) &&
                c.products.includes(product.category) &&
                (Array.isArray(c.selectedUsers)
                  ? c.selectedUsers.includes(user?.tc_id)
                  : c.selectedUser === user?.tc_id)
              );
            });
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

            const subItems = campaign?.subItems?.items || [];

            return (
              <>
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

                {subItems.length > 0 && (
                  <div className="text-center mb-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setShowGifts((prev) => !prev)}
                    >
                      {showGifts ? "Hediyeleri Gizle" : "Hediyeleri Gör"}
                    </Button>

                    {showGifts && (
                      <div className="border mt-3 p-2 rounded bg-light text-start">
                        <h6 className="mb-2">Hediye Ürünler:</h6>
                        <p className="text-success">
                          Fiyat: ₺{campaign?.subItems?.price}
                        </p>
                        {subItems.map((item) => (
                          <div
                            key={item._id}
                            className="d-flex align-items-center gap-2 mb-2"
                          >
                            <img
                              src={item.pictures?.[0]?.url}
                              alt={item.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                            />
                            <span className="small">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
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
                  product.class.length > 0 &&
                  user?.k12?.students?.length > 0 && (
                    <Col xs={12} md={4}>
                      <Form.Label>Sınıf:</Form.Label>
                      <Form.Control
                        type="text"
                        value={(() => {
                          const normalize = (val) =>
                            String(val)
                              .toLowerCase()
                              .replace(/\./g, "")
                              .replace(/sınıf/g, "")
                              .replace(/\s+/g, "")
                              .trim();

                          const studentGrades = user.k12.students.map((s) =>
                            normalize(s.gradeLevel)
                          );

                          const matchedClass = product.class.find((cls) =>
                            studentGrades.includes(normalize(cls))
                          );

                          return matchedClass || "Mevcut değil";
                        })()}
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
                    onClick={() => {
                      const currentYear = new Date().getFullYear();

                      const alreadyOrdered = orders.some((order) => {
                        const year = new Date(
                          order.date || order.createdAt
                        ).getFullYear();
                        const productIds = Object.keys(order.products || {});
                        if (year !== currentYear) return false;
                        return productIds.includes(product._id);
                      });

                      if (alreadyOrdered) {
                        setToastError(true);
                        return;
                      }

                      addToCart({
                        userId: user._id,
                        productId: product._id,
                        price: product.price,
                      });
                    }}
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

      {/* <div className="my-4">
        <h2>Benzer Ürünler</h2>
        <div className="d-flex justify-content-center align-items-center flex-wrap">
          <AliceCarousel
            mouseTracking
            items={similarProducts}
            responsive={responsive}
            controlsStrategy="alternate"
          />
        </div>
      </div> */}
    </Container>
  );
}

export default ProductPage;
