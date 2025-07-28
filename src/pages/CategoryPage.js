import React, { useEffect, useMemo, useState } from "react";
import axios from "../axios";
import { Container, Row, Col, Button, Form, Badge } from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Shirts.css";
import { useAddToCartMutation } from "../services/appApi";
import { useSelector } from "react-redux";
import ToastMessage from "../components/ToastMessage";
import { formatWithCommas } from "../hooks/formatFuctions";

function CategoryPage() {
  const { category = "all" } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [perPage, setPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("featured");
  const [pageIdx, setPageIdx] = useState(0);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const navigate = useNavigate();
  const [addToCart, { isSuccess }] = useAddToCartMutation();
  const user = useSelector((state) => state.user);
  const campaigns = useSelector((state) => state.campaigns || []);
  const [orders, setOrders] = useState([]);
  const [toastError, setToastError] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/products");
        const list = data || [];
        axios.get("/orders").then(({ data }) => {
          setOrders(data);
        });
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

    const exactMatch = allProducts.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
    if (exactMatch.length > 0) return exactMatch;

    const partialMatch = allProducts.filter((p) =>
      p.category?.toLowerCase().includes(category.toLowerCase())
    );
    return partialMatch;
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

  const k12Filtered = useMemo(() => {
    if (!user?.k12?.students?.length) return sorted;

    const studentGrades = user.k12.students.map((s) =>
      typeof s.gradeLevel === "string" ? s.gradeLevel.trim() : `${s.gradeLevel}`
    );
    console.log("🧠 Student Grades (normalized):", studentGrades);

    const preschoolLabels = [
      "hazırlık (48-60 ay)",
      "hazırlık (60-66 ay)",
      "hazırlık (66-72 ay)",
      "ana",
    ];

    const isPreschoolStudent = (grade) => {
      const normalized = grade?.toString().toLowerCase().trim();
      return preschoolLabels.includes(normalized);
    };

    const isBookCategory = (cat) => {
      const c = (cat || "").toLowerCase();
      return (
        c.includes("eğitim") ||
        c.includes("set") ||
        c.includes("kitap") ||
        c.includes("book")
      );
    };

    const preschoolBookClasses = ["3 yaş", "4 yaş", "5 yaş"];
    const isStudentPreschool = studentGrades.some(isPreschoolStudent);

    const filtered = sorted.filter((product) => {
      const productCategory = (product.category || "").toLowerCase();
      const classes = product.class || [];

      // ✅ Allow no-class Anaokulu Kıyafet
      if (
        productCategory === "anaokulu kıyafet" &&
        isStudentPreschool &&
        (!product.class || product.class.length === 0)
      ) {
        console.log("✅ Allowing no-class Anaokulu Kıyafet:", product.name);
        return true;
      }

      if (!Array.isArray(classes)) {
        console.log("⛔ Invalid class for product:", product.name);
        return false;
      }

      return classes.some((cls) => {
        const normalizedClass = cls
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\./g, "")
          .replace(/\s+/g, " ");

        // 👶 Preschool Books
        if (isBookCategory(productCategory)) {
          if (isStudentPreschool) {
            const match = preschoolBookClasses.includes(normalizedClass);
            console.log(
              `📘 Book "${product.name}" | normalized class: "${normalizedClass}" | match:`,
              match
            );
            return match;
          } else {
            const match = studentGrades.some((grade) =>
              normalizedClass.includes(grade.toLowerCase())
            );
            return match;
          }
        }

        // 👕 Clothing logic (including special case)
        const studentClassNums = studentGrades
          .map((g) => parseInt(g))
          .filter((n) => !isNaN(n));

        // ✅ Class-specific category enforcement
        if (
          studentClassNums.includes(6) &&
          productCategory !== "ortaokul kıyafet"
        ) {
          return false;
        }

        if (
          studentClassNums.includes(11) &&
          productCategory !== "lise kıyafet"
        ) {
          return false;
        }

        // Normal numeric class matching
        const classNumMatch = normalizedClass.match(/^\d+$/);
        if (classNumMatch) {
          const classNum = parseInt(classNumMatch[0]);
          return studentClassNums.some((g) => {
            if (classNum >= 1 && classNum <= 4 && g >= 1 && g <= 4)
              return productCategory === "ilkokul kıyafet";
            if (classNum >= 5 && classNum <= 8 && g >= 5 && g <= 8)
              return productCategory === "ortaokul kıyafet";
            if (classNum >= 9 && classNum <= 12 && g >= 9 && g <= 12)
              return productCategory === "lise kıyafet";
            return false;
          });
        }

        // 👕 Preschool clothing
        if (preschoolLabels.includes(normalizedClass)) {
          return isStudentPreschool && productCategory === "anaokulu kıyafet";
        }

        return false;
      });
    });

    console.log(
      "✅ Final k12Filtered products:",
      filtered.map((p) => p.name)
    );
    return filtered;
  }, [sorted, user]);

  const nonClassBased = useMemo(() => {
    return sorted.filter(
      (product) => !product.class?.length && !product.hasClass
    );
  }, [sorted]);

  const finalProducts = useMemo(() => {
    if (!user || !user.k12?.students?.length) return sorted;

    // ✅ Always prefer k12Filtered (already filtered by student + product logic)
    const results = k12Filtered.length > 0 ? k12Filtered : nonClassBased;

    console.log(
      "🧾 Final Rendered Products:",
      results.map((p) => p.name)
    );

    return results;
  }, [k12Filtered, nonClassBased, sorted, user]);

  const pageCount = Math.ceil(finalProducts.length / perPage);
  const pageStart = pageIdx * perPage;
  const pageEnd = Math.min(pageStart + perPage, finalProducts.length);
  const paged = finalProducts.slice(pageStart, pageEnd);

  const sizeOptions = [
    "5-6",
    "7-8",
    "9-10",
    "11-12",
    "13-14",
    "15-16",
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "3XL",
    "4XL",
  ];

  useEffect(() => {
    if (showLoginToast) {
      const timer = setTimeout(() => setShowLoginToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showLoginToast]);

  useEffect(() => {
    if (toastError) {
      const timer = setTimeout(() => setToastError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastError]);
  return (
    <div className="category-page-container">
      {isSuccess && (
        <ToastMessage
          bg="success"
          title="Sepete Eklendi"
          body={`sepetinize eklendi`}
        />
      )}
      {showLoginToast && (
        <ToastMessage
          bg="danger"
          title="Giriş Gerekli"
          body="Ürün eklemek için giriş yapmalısınız"
          onClose={() => setShowLoginToast(false)}
        />
      )}
      {toastError && (
        <ToastMessage
          bg="danger"
          title="Zaten Alındı"
          body="Bu ürünü daha önce almışsınız."
          onClose={() => setToastError(false)}
        />
      )}

      <Container fluid className="py-4">
        <Row>
          <Col md={2}>
            <ul className="list-group side-menu">
              {categories.map((cat) => (
                <Link
                  to={`/category/${cat.toLowerCase()}`}
                  key={cat}
                  onClick={() => setPageIdx(0)}
                  className={`list-group-item ${
                    cat.toLowerCase() === category.toLowerCase()
                      ? "activate"
                      : ""
                  }`}
                >
                  {cat.toLowerCase() === "all" ? "Hepsi" : cat}
                </Link>
              ))}
            </ul>
          </Col>

          <Col md={10}>
            <div className="product-header d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h4 className="text-danger mb-0 text-capitalize">
                {category.toLowerCase() === "all" ? "Hepsi" : category}
              </h4>
              <div className="d-flex align-items-center gap-3 text-muted small">
                <div>
                  {finalProducts.length ? pageStart + 1 : 0} – {pageEnd} arası,
                  toplam {finalProducts.length} ürün gösteriliyor
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

            <Row>
              {paged.length === 0 ||
                (!user && (
                  <div className="text-center text-muted py-5">
                    <h5>Ürün bulunamadı</h5>
                    <p>Aramanızla eşleşen ürün bulunamadı.</p>
                  </div>
                ))}
              {user &&
                paged.map((prod) => {
                  let campaignAmount;
                  const campaign = campaigns.find(
                    (c) =>
                      c.products?.includes(prod.category) &&
                      Array.isArray(c.selectedUsers) &&
                      c.selectedUsers.includes(user?.tc_id)
                  );
                  let finalPrice = Number(prod.price) || 0;

                  if (
                    campaign &&
                    typeof campaign.amount === "number" &&
                    !isNaN(campaign.amount)
                  ) {
                    if (campaign.type === "percentage") {
                      campaignAmount = campaign.amount;
                      finalPrice -= (finalPrice * campaign.amount) / 100;
                    } else if (campaign.type === "fixed") {
                      campaignAmount = campaign.amount;
                      finalPrice -= campaign.amount;
                    }
                    finalPrice = Math.max(finalPrice, 0);
                  }

                  return (
                    <Col md={3} sm={6} xs={12} key={prod._id} className="mb-4">
                      <div className="product-card text-center p-3 border rounded h-100 d-flex flex-column">
                        <img
                          src={prod.pictures?.[0]?.url}
                          alt={prod.name}
                          className="img-fluid mb-3"
                        />
                        <div className="product-info text-start flex-grow-1">
                          <div className="mb-2">
                            <div className="d-flex">
                              <span
                                className="text-dark text-center text-wrap"
                                style={{
                                  lineHeight: "1.3em",
                                  fontSize: "16px",
                                }}
                              >
                                {prod.name}
                              </span>
                            </div>
                          </div>
                          <div className="top-info">
                            <div className="info-row info-top flex-column">
                              {prod.hasClass &&
                                Array.isArray(prod.class) &&
                                prod.class.length > 0 && (
                                  <div className="d-flex align-items-center mb-1">
                                    <span className="label">Sınıf:</span>
                                    <span className="ms-1">
                                      {prod.class[0] || "Mevcut değil"}
                                    </span>
                                  </div>
                                )}
                              {prod.hasSize && (
                                <div className="d-flex align-items-center">
                                  <span className="label">Beden:</span>
                                  <Form.Select
                                    size="sm"
                                    className="value-dropdown text-danger ms-2"
                                    style={{ width: "auto" }}
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

                            {campaignAmount && (
                              <Col
                                sm={12}
                                className="d-flex justify-content-center"
                              >
                                <Badge bg="success">
                                  ₺{campaignAmount} İNDİRİM
                                </Badge>
                              </Col>
                            )}
                            <div className="info-row">
                              <span className="label">Fiyat:</span>
                              <span className="value">
                                {formatWithCommas(finalPrice.toFixed(0))} TL
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          className="choose-btn mt-3 w-100"
                          variant="danger"
                          onClick={() => {
                            const currentYear = new Date().getFullYear();

                            const alreadyOrdered = orders.some((order) => {
                              const year = new Date(
                                order.date || order.createdAt
                              ).getFullYear();
                              const productIds = Object.keys(
                                order.products || {}
                              );
                              console.log(
                                "TCL ~ year !== currentYear:",
                                year,
                                currentYear
                              );
                              if (year !== currentYear) {
                                console.log("nigger works");
                                return false;
                              }

                              return productIds.includes(prod._id);
                            });
                            console.log(
                              "TCL ~ alreadyOrdered:",
                              alreadyOrdered
                            );

                            if (alreadyOrdered) {
                              setToastError(true);
                              return;
                            }
                            console.log(prod._id);
                            addToCart({
                              userId: user._id,
                              productId: prod._id,
                              price: finalPrice,
                            });
                          }}
                        >
                          Sepete Ekle
                        </Button>

                        <Button
                          className="quick-view-btn mt-2 w-100"
                          variant="light"
                          onClick={() => navigate(`/product/${prod._id}`)}
                        >
                          Detaylar
                        </Button>
                      </div>
                    </Col>
                  );
                })}
            </Row>

            {user && pageCount > 1 && (
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
