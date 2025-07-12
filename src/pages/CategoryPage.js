import React, { useEffect, useMemo, useState } from "react";
import axios from "../axios";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Shirts.css";
import { useAddToCartMutation } from "../services/appApi";
import { useSelector } from "react-redux";
import ToastMessage from "../components/ToastMessage";

function CategoryPage() {
  const { category = "all" } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [perPage, setPerPage] = useState(48);
  const [sortBy, setSortBy] = useState("featured");
  const [pageIdx, setPageIdx] = useState(0);
  const [showLoginToast, setShowLoginToast] = useState(false);

  const navigate = useNavigate();
  const [addToCart, { isSuccess }] = useAddToCartMutation();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/products");
        const list = data || [];

        setAllProducts(list);

        const uniqueCategories = [
          "All",
          ...new Set(list.map((p) => p.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Failed to load products:", err.message);
      }
    };

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    if (category.toLowerCase() === "all") return allProducts;
    return allProducts.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
  }, [allProducts, category]);

  const sorted = useMemo(() => {
    switch (sortBy) {
      case "priceAsc":
        return [...filtered].sort((a, b) => a.price - b.price);
      case "priceDesc":
        return [...filtered].sort((a, b) => b.price - a.price);
      case "az":
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case "za":
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [filtered, sortBy]);

  const pageCount = Math.ceil(sorted.length / perPage);
  const pageStart = pageIdx * perPage;
  const pageEnd = Math.min(pageStart + perPage, sorted.length);
  const paged = sorted.slice(pageStart, pageEnd);

  const sizeOptions = ["S", "M", "L"];
  const classOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="category-page-container">
      {isSuccess && (
        <ToastMessage
          bg="success"
          title="Added to cart"
          body={`Added in your cart`}
        />
      )}
      {showLoginToast && (
        <ToastMessage
          bg="danger"
          title="Login Required"
          body="Login to add items to your cart"
        />
      )}

      <div className="mb-5">
        <img
          src="https://stationers.pk/cdn/shop/files/IMG-20250228-WA0009.jpg?v=1741775104&width=2400"
          className="d-block w-100"
          alt="Banner"
        />
      </div>

      <Container fluid className="py-4">
        <Row>
          {/* Sidebar */}
          <Col md={2}>
            <ul className="list-group side-menu">
              {categories.map((cat) => (
                <Link
                  to={`/category/${cat.toLowerCase()}`}
                  key={cat}
                  className={`list-group-item ${
                    cat.toLowerCase() === category.toLowerCase()
                      ? "activate"
                      : ""
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </ul>
          </Col>

          {/* Products */}
          <Col md={10}>
            <div className="product-header d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h4 className="text-danger mb-0 text-capitalize">{category}</h4>
              <div className="d-flex align-items-center gap-3 text-muted small">
                <div>
                  Showing {sorted.length ? pageStart + 1 : 0} – {pageEnd} of{" "}
                  {sorted.length} products
                </div>
                <div>
                  Display:{" "}
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(+e.target.value);
                      setPageIdx(0);
                    }}
                  >
                    {[12, 24, 48, 96].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  Sort by:{" "}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="priceAsc">Price (low → high)</option>
                    <option value="priceDesc">Price (high → low)</option>
                    <option value="az">Name A-Z</option>
                    <option value="za">Name Z-A</option>
                  </select>
                </div>
                <div className="d-none d-md-block">
                  View: <i className="fas fa-th" />
                </div>
              </div>
            </div>

            <Row>
              {paged.map((prod) => (
                <Col md={3} sm={6} xs={12} key={prod._id} className="mb-4">
                  <div className="product-card text-center p-3 border rounded h-100 d-flex flex-column">
                    <img
                      src={prod.pictures?.[0]?.url}
                      alt={prod.name}
                      className="img-fluid mb-3"
                    />
                    <div className="product-info text-start flex-grow-1">
                      <div className="top-info">
                        <div className="info-row info-top">
                          {prod.category.toLowerCase() === "books" ? (
                            <div className="d-flex align-items-center">
                              <span className="label">sınıf:</span>
                              <Form.Select
                                size="sm"
                                className="value-dropdown text-danger"
                              >
                                {(Array.isArray(prod?.class)
                                  ? prod.class
                                  : classOptions
                                ).map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </Form.Select>{" "}
                            </div>
                          ) : (
                            <div className="d-flex align-items-center">
                              <span className="label">Beden:</span>
                              <Form.Select
                                size="sm"
                                className="value-dropdown text-danger"
                              >
                                {(Array.isArray(prod?.sizes)
                                  ? prod.sizes
                                  : sizeOptions
                                ).map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </Form.Select>
                            </div>
                          )}
                        </div>
                        <div className="info-row">
                          <span className="label">Fiyat:</span>
                          <span className="value">{prod.price} TL</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="choose-btn mt-3 w-100"
                      variant="danger"
                      onClick={() => {
                        if (!user) {
                          setShowLoginToast(true);
                          setTimeout(() => setShowLoginToast(false), 3000);
                          return;
                        }
                        addToCart({
                          userId: user._id,
                          productId: prod._id,
                          price: prod.price,
                          image: prod.pictures?.[0]?.url,
                        });
                      }}
                    >
                      Add To Cart
                    </Button>

                    <Button
                      className="quick-view-btn mt-2 w-100"
                      variant="light"
                      onClick={() => navigate(`/product/${prod._id}`)}
                    >
                      Detaylar{" "}
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={pageIdx === 0}
                  onClick={() => setPageIdx((p) => p - 1)}
                >
                  ‹ Prev
                </Button>
                <span className="align-self-center small">
                  Page {pageIdx + 1} / {pageCount}
                </span>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={pageIdx === pageCount - 1}
                  onClick={() => setPageIdx((p) => p + 1)}
                >
                  Next ›
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CategoryPage;
