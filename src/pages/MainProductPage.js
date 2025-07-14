import React, { useEffect, useMemo, useState } from "react";
import axios from "../axios";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import "./Shirts.css";

function MainProductPage() {
  /* ---------- DATA ---------- */
  const [products, setProducts] = useState([]);
  const [mainCategories, setMainCats] = useState([]);
  const [activeCat, setActiveCat] = useState("");

  /* ---------- UI STATE ---------- */
  const [perPage, setPerPage] = useState(48);
  const [sortBy, setSortBy] = useState("featured");
  const [pageIdx, setPageIdx] = useState(0); // 0-based page index

  /* ---------- GET PRODUCTS ---------- */
  useEffect(() => {
    axios.get("/products").then(({ data }) => {
      const list = data.products || [];
      setProducts(list);

      const cats = [...new Set(list.map((p) => p.mainCategory))];
      setMainCats(cats);
      if (!activeCat) setActiveCat(cats[0] || "");
    });
  }, []); // run once

  /* ---------- SIZE / AGE MASTER LISTS ---------- */
  const sizeMaster = useMemo(
    () => [...new Set(products.map((p) => p.size).filter(Boolean))],
    [products]
  );
  const ageMaster = useMemo(
    () => [...new Set(products.map((p) => p.age).filter(Boolean))],
    [products]
  );

  /* ---------- FILTER → SORT → PAGE ---------- */
  const filtered = useMemo(
    () => products.filter((p) => p.mainCategory === activeCat),
    [products, activeCat]
  );

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
        return filtered; // featured
    }
  }, [filtered, sortBy]);

  const pageCount = Math.ceil(sorted.length / perPage);
  const pageStart = pageIdx * perPage;
  const pageEnd = Math.min(pageStart + perPage, sorted.length);
  const paged = sorted.slice(pageStart, pageEnd);

  /* ---------- HANDLERS ---------- */
  const handlePerPage = (e) => {
    setPerPage(+e.target.value);
    setPageIdx(0);
  };
  const handleSort = (e) => setSortBy(e.target.value);
  const handlePage = (dir) => {
    setPageIdx((p) => Math.min(Math.max(p + dir, 0), pageCount - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="category-page-container">
      {/* --- banner --- */}
      <div className="mb-5">
        <img
          src="https://stationers.pk/cdn/shop/files/IMG-20250228-WA0009.jpg?v=1741775104&width=2400"
          className="d-block w-100"
          alt="School Accessories"
        />
      </div>

      <Container fluid className="py-4">
        <Row>
          {/* -------------- SIDEBAR -------------- */}
          <Col md={2}>
            <ul className="list-group side-menu">
              {mainCategories.map((cat) => (
                <li
                  key={cat}
                  className={`list-group-item ${
                    cat === activeCat ? "activate" : ""
                  }`}
                  onClick={() => {
                    setActiveCat(cat);
                    setPageIdx(0);
                  }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          </Col>

          {/* -------------- PRODUCT SECTION -------------- */}
          <Col md={10}>
            {/* header */}
            <div className="product-header d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h4 className="text-danger mb-0 text-capitalize">{activeCat}</h4>

              <div className="d-flex align-items-center gap-3 text-muted small">
                <div>
                  {sorted.length ? pageStart + 1 : 0} – {pageEnd} arası, toplam{" "}
                  {sorted.length} ürün gösteriliyor
                </div>
                <div>
                  Göster:{" "}
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
                  Sırala:{" "}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Öne Çıkanlar</option>
                    <option value="priceAsc">Fiyat (artan)</option>
                    <option value="priceDesc">Fiyat (azalan)</option>
                    <option value="az">İsim A-Z</option>
                    <option value="za">İsim Z-A</option>
                  </select>
                </div>
                <div className="d-none d-md-block">
                  Görünüm: <i className="fas fa-th" />
                </div>
              </div>
            </div>

            {/* grid */}
            <Row>
              {paged.map((prod) => (
                <Col
                  md={3}
                  sm={6}
                  xs={12}
                  key={prod._id || prod.name}
                  className="mb-4"
                >
                  <div className="product-card text-center p-3 border rounded h-100 d-flex flex-column">
                    <img
                      src={prod.pictures?.[0]?.url}
                      alt={prod.name}
                      className="img-fluid mb-3"
                    />

                    <div className="product-info text-start flex-grow-1">
                      <div className="top-info">
                        <div className="info-row info-top">
                          {/* size */}
                          <div className="d-flex align-items-center">
                            <span className="label">Beden:</span>
                            {prod.size ? (
                              <span className="value">{prod.size}</span>
                            ) : (
                              <Form.Select
                                size="sm"
                                className="value-dropdown text-danger"
                              >
                                {sizeMaster.map((s) => (
                                  <option key={s}>{s}</option>
                                ))}
                              </Form.Select>
                            )}
                          </div>

                          {/* age */}
                          <div className="d-flex align-items-center">
                            <span className="label">Yaş:</span>
                            {prod.age ? (
                              <span className="value">{prod.age}</span>
                            ) : (
                              <Form.Select
                                size="sm"
                                className="value-dropdown text-danger"
                              >
                                {ageMaster.map((a) => (
                                  <option key={a}>{a}</option>
                                ))}
                              </Form.Select>
                            )}
                          </div>
                        </div>

                        {/* price */}
                        <div className="info-row">
                          <span className="label">Fiyat:</span>
                          <span className="value">{prod.price} TL</span>
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
                      Detaylar{" "}
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>

            {/* pagination buttons */}
            {pageCount > 1 && (
              <div className="d-flex justify-content-center gap-3 mt-4">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  disabled={pageIdx === 0}
                  onClick={() => handlePage(-1)}
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
                  onClick={() => handlePage(1)}
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

export default MainProductPage;
