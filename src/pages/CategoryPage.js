import React, { useEffect, useMemo, useState } from "react";
import axios from "../axios";
import { Container, Row, Col, Button, Form, Badge } from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./Shirts.css";
import { useAddToCartMutation } from "../services/appApi";
import { useDispatch, useSelector } from "react-redux";
import ToastMessage from "../components/ToastMessage";
import { formatWithCommas } from "../hooks/formatFuctions";
import { addSizeWithId, addSizes } from "../features/personalSlice";
function CategoryPage() {
  const dispatch = useDispatch();
  const { category = "all" } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [perPage, setPerPage] = useState(12);
  const [sortBy, setSortBy] = useState("featured");
  const [pageIdx, setPageIdx] = useState(0);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const navigate = useNavigate();
  const [addToCart, { isSuccess, reset }] = useAddToCartMutation();
  const user = useSelector((state) => state.user);
  const campaigns = useSelector((state) => state.campaigns || []);
  const [orders, setOrders] = useState([]);
  const [toastError, setToastError] = useState(false);
  const [selectedGiftSizes, setSelectedGiftSizes] = useState([]);
  console.log("TCL ~ CategoryPage ~ selectedGiftSizes:", selectedGiftSizes);

  // const [openGifts, setOpenGifts] = useState({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/products");
        const list = data || [];

        axios.get("/orders").then(({ data }) => setOrders(data));
        setAllProducts(list);

        // Step 1: Group products by category
        const categoryMap = {};
        for (const p of list) {
          if (!p.category) continue;
          if (!categoryMap[p.category]) categoryMap[p.category] = [];
          categoryMap[p.category].push(p);
        }

        // Step 2: Remove categories with only 1 product and that product is disabled
        const filteredCategories = Object.entries(categoryMap)
          .filter(([_, products]) => {
            const allDisabled = products.every((p) => p.isDisabled);
            const onlyOneAndDisabled =
              products.length === 1 && products[0].isDisabled;
            return !onlyOneAndDisabled && !allDisabled;
          })
          .map(([category]) => category);

        // Step 3: Add 'All' at the top
        // const uniqueCategories = ["All", ...filteredCategories, "Hediye"];
        const uniqueCategories = ["All", ...filteredCategories];
        // Step 4: Update categories
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Failed to load products:", err.message);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    if (isSuccess) {
      setShowSuccessToast(true);
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const filtered = useMemo(() => {
    if (category.toLowerCase() === "all") return allProducts;

    const exactMatch = allProducts.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
    if (exactMatch.length > 0) return exactMatch;

    return allProducts.filter((p) =>
      p.category?.toLowerCase().includes(category.toLowerCase())
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
  const filterK12 = useMemo(() => {
    if (!user?.k12?.students?.length) return [];

    const normalize = (val) =>
      String(val)
        .toLowerCase()
        .replace(/\./g, "")
        .replace(/sınıf/g, "")
        .replace(/\s+/g, "")
        .replace(/[\(\)\-]/g, "") // remove brackets and dashes
        .trim();

    const studentGrades = user.k12.students.map((s) => normalize(s.gradeLevel));
    const studentClassNums = user.k12.students
      .map((s) => parseInt(s.gradeLevel))
      .filter((n) => !isNaN(n));

    // Map for preschool logic
    const preschoolMap = {
      hazırlık4860ay: "4yaş",
      hazırlık6066ay: "5yaş", // ✅ ADD THIS
      hazırlık6672ay: "5yaş",
      önhazırlık3648ay: "3yaş",
      hazırlık3648: "3yaş",
    };
    // Handle preschool filtering
    const matchedPreschoolAges = studentGrades
      .filter((grade) => grade in preschoolMap)
      .map((grade) => preschoolMap[grade]);

    const isAna = studentGrades.includes("ana");

    if (matchedPreschoolAges.length || isAna) {
      if (isAna) return []; // Ana shows no books

      const allowed = new Set(matchedPreschoolAges.map(normalize));

      return sorted.filter((product) => {
        const classes = Array.isArray(product.class) ? product.class : [];
        return classes.some((cls) => allowed.has(normalize(cls)));
      });
    }

    // Normal logic for primary + others
    return sorted.filter((product) => {
      const classes = Array.isArray(product.class) ? product.class : [];

      return classes.some((cls) => {
        const norm = normalize(cls); // assume this lowercases and trims
        if (["3yaş", "4yaş", "5yaş"].includes(norm)) return false;

        // Try to extract a number from the normalized class string
        const clsNumMatch = norm.match(/\d+/); // match any digit(s)
        const clsNum = clsNumMatch ? parseInt(clsNumMatch[0]) : null;

        if (studentGrades.includes(norm)) return true;
        if (clsNum && studentClassNums.includes(clsNum)) return true;

        return false;
      });
    });
  }, [user, sorted]);
  const prod = user && user.isAdmin ? sorted : filterK12;
  const pageCount = Math.ceil(prod.length / perPage);
  const pageStart = pageIdx * perPage;
  const pageEnd = Math.min(pageStart + perPage, prod.length);
  const disabledProd = prod.filter((p) => !p.isDisabled); // or p.isPasif
  const sortedProd = [...disabledProd].sort((a, b) => {
    const priority = {
      "Eğitim Seti": 1,
      "Kırtasiye Seti": 2,
    };

    const aPriority = priority[a.category] || 99;
    const bPriority = priority[b.category] || 99;

    return aPriority - bPriority;
  });

  const paged = sortedProd.slice(pageStart, pageEnd);

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
      {showSuccessToast && (
        <ToastMessage
          bg="success"
          title="Sepete Eklendi"
          body="Ürün sepetinize eklendi"
          onClose={() => {
            setShowSuccessToast(false);
            reset();
          }}
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
            <Row>
              {/* {category.toLowerCase() === "hediye" ? (
                <>
                  {campaigns
                    .filter(
                      (c) =>
                        Array.isArray(c.selectedUsers) &&
                        c.selectedUsers.includes(user?.tc_id) &&
                        Array.isArray(c.subItems?.items) &&
                        c.subItems.items.length > 0
                    )
                    .flatMap((campaign) =>
                      campaign.subItems.items.map((gift, idx) => {
                        const finalPrice = campaign.subItems.price || 0;
                        const campaignAmount = gift.price - finalPrice;
                        const hasSize = Array.isArray(gift.sizes);
                        const uniqueSizes = hasSize
                          ? [...new Set(gift.sizes)]
                          : [];

                        return (
                          <Col
                            md={3}
                            sm={6}
                            xs={12}
                            key={gift._id || idx}
                            className="mb-4"
                          >
                            <div
                              style={{ position: "relative" }} // ✅ needed for absolute label
                              className="product-card text-center p-3 border rounded h-100 d-flex flex-column"
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: "10px",
                                  left: "10px",
                                  backgroundColor: "#dc3545",
                                  color: "white",
                                  padding: "4px 10px",
                                  borderRadius: "5px",
                                  fontWeight: "bold",
                                  fontSize: "13px",
                                  zIndex: 10,
                                }}
                              >
                                🎁 Hediye
                              </div>

                              <img
                                src={
                                  gift.pictures?.[0]?.url || "/placeholder.jpg"
                                }
                                alt={gift.name}
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
                                      {gift.name}
                                    </span>
                                  </div>
                                </div>
                                <div className="top-info">
                                  <div className="info-row info-top flex-column">
                                    {hasSize && (
                                      <div className="d-flex align-items-center">
                                        <span className="label">Beden:</span>
                                        <Form.Select
                                          size="sm"
                                          className="value-dropdown text-danger ms-2"
                                          style={{ width: "auto" }}
                                        >
                                          {uniqueSizes.map((s) => (
                                            <option key={s}>{s}</option>
                                          ))}
                                        </Form.Select>
                                      </div>
                                    )}
                                    <div className="d-flex align-items-center mb-1">
                                      <span className="label">Stok:</span>
                                      <span className="ms-1">
                                        {gift.stock ?? 0}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="info-row">
                                    <span className="label">Fiyat:</span>
                                    <span
                                      style={{
                                        textDecoration: "line-through",
                                        color: "red",
                                        fontSize: "16px",
                                      }}
                                    >
                                      {gift.price}TL
                                    </span>
                                    <span className="value text-success">
                                      {formatWithCommas(finalPrice.toFixed(0))}{" "}
                                      TL
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* {campaignAmount > 0 && (
                                <div className="d-flex justify-content-center mt-2">
                                  <Badge bg="success">
                                    ₺{campaignAmount} İNDİRİM
                                  </Badge>
                                </div>
                              )} */}
              {/* <Button
                                className="mt-2"
                                variant="success"
                                onClick={() => {
                                  const parentProduct = allProducts.find((p) =>
                                    campaign.products?.includes(p.category)
                                  );

                                  if (!parentProduct) {
                                    alert("Ana ürün bulunamadı.");
                                    return;
                                  }

                                  const parentCampaign = campaigns.find(
                                    (c) =>
                                      c.products?.includes(
                                        parentProduct.category
                                      ) &&
                                      Array.isArray(c.selectedUsers) &&
                                      c.selectedUsers.includes(user?.tc_id)
                                  );

                                  let finalPrice =
                                    Number(parentProduct.price) || 0;
                                  if (
                                    parentCampaign &&
                                    typeof parentCampaign.amount === "number" &&
                                    !isNaN(parentCampaign.amount)
                                  ) {
                                    if (parentCampaign.type === "percentage") {
                                      finalPrice -=
                                        (finalPrice * parentCampaign.amount) /
                                        100;
                                    } else if (
                                      parentCampaign.type === "fixed"
                                    ) {
                                      finalPrice -= parentCampaign.amount;
                                    }
                                    finalPrice = Math.max(finalPrice, 0);
                                  }
                                  dispatch(addSizes(uniqueSizes));

                                  addToCart({
                                    userId: user._id,
                                    productId: parentProduct._id,
                                    price: finalPrice,
                                  });
                                }}
                              >
                                Ana Ürünü Sepete Ekle
                              </Button> */}
              {/* 
                              <Button
                                className="choose-btn mt-3 w-100"
                                variant="danger"
                                disabled={gift.stock <= 0}
                                onClick={() => {
                                  addToCart({
                                    userId: user._id,
                                    productId: gift._id,
                                    price: finalPrice,
                                  });
                                }}
                              >
                                {gift.stock <= 0 ? "Stokta Yok" : "Sepete Ekle"}
                              </Button>

                              <Button
                                className="quick-view-btn mt-2 w-100"
                                variant="light"
                                onClick={() => navigate(`/product/${gift._id}`)}
                              >
                                Detaylar
                              </Button> */}
              {/* </div>
                          </Col>
                        );
                      })
                    )} */}

              {/* {campaigns.filter(
                    (c) =>
                      Array.isArray(c.selectedUsers) &&
                      c.selectedUsers.includes(user?.tc_id) &&
                      Array.isArray(c.subItems?.items) &&
                      c.subItems.items.length > 0
                  ).length === 0 && (
                    <div className="text-center text-muted py-5 w-100">
                      <h5>Hediye bulunamadı</h5>
                      <p>Size özel bir hediye kampanyası bulunamadı.</p>
                    </div>
                  )}
                </>
              ) : ( */}
              <>
                {paged.length === 0 && (
                  <div className="text-center text-muted py-5">
                    <h5>Ürün bulunamadı</h5>
                    <p>Aramanızla eşleşen ürün bulunamadı.</p>
                  </div>
                )}

                {paged.map((prod) => {
                  let campaignAmount;
                  const campaign = campaigns.find(
                    (c) =>
                      c.products?.includes(prod.category) &&
                      Array.isArray(c.selectedUsers) &&
                      c.selectedUsers.includes(user?.tc_id)
                  );
                  let finalPrice = Number(prod.price) || 0;
                  const subItems = campaign?.subItems?.items || [];
                  const isGiftVisible = true;
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
                  let allSizes = paged
                    .filter((prod) => prod.hasSize && Array.isArray(prod.sizes))
                    .flatMap((prod) => prod.sizes);

                  // Remove duplicates
                  let uniqueSizes = [...new Set(allSizes)];
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
                                prod.class.length > 0 &&
                                user?.k12?.students?.length > 0 && (
                                  <div className="d-flex align-items-center mb-1">
                                    <span className="label">Sınıf:</span>
                                    <span className="ms-1">
                                      {(() => {
                                        const normalize = (val) =>
                                          String(val)
                                            .toLowerCase()
                                            .replace(/\./g, "")
                                            .replace(/sınıf/g, "")
                                            .replace(/\s+/g, "")
                                            .trim();

                                        const studentGrades =
                                          user.k12.students.map((s) =>
                                            normalize(s.gradeLevel)
                                          );

                                        const match = prod.class.find((cls) =>
                                          studentGrades.includes(normalize(cls))
                                        );

                                        return match || "Mevcut değil";
                                      })()}
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
                              <div className="d-flex align-items-center mb-1">
                                <span className="label">Stok:</span>
                                <span className="ms-1">{prod.stock ?? 0}</span>
                              </div>
                            </div>

                            {/* {subItems.length > 0 && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="w-100 mb-2"
                              onClick={() =>
                                setOpenGifts((prev) => ({
                                  ...prev,
                                  [prod._id]: !prev[prod._id],
                                }))
                              }
                            >
                              {isGiftVisible
                                ? "Hediye Ürünlerini Gizle"
                                : "Hediye Ürünlerini Gör"}
                            </Button>
                          )} */}

                            <div className="info-row">
                              <span className="label">Fiyat:</span>
                              <span className="value">
                                {formatWithCommas(finalPrice.toFixed(0))} TL
                              </span>
                            </div>
                          </div>
                        </div>
                        {isGiftVisible && subItems.length > 0 && (
                          <div className="gift-section border p-2 rounded mb-2 bg-light">
                            {subItems.map((gift, idx) => {
                              return (
                                <>
                                  {" "}
                                  <div
                                    key={gift._id || idx}
                                    className="d-flex align-items-center gap-2 mb-1"
                                  >
                                    <img
                                      src={
                                        gift.pictures?.[0]?.url ||
                                        "/placeholder.jpg"
                                      }
                                      alt={gift.name}
                                      style={{
                                        width: 40,
                                        height: 40,
                                        objectFit: "contain",
                                      }}
                                    />
                                    <span className="small">{gift.name}</span>
                                  </div>
                                  {gift.sizes && (
                                    <div className="d-flex justify-items-center align-items-center">
                                      <span className="label small">
                                        Beden:
                                      </span>
                                      <Form.Select
                                        size="sm"
                                        className="value-dropdown text-danger ms-2"
                                        style={{ width: "auto" }}
                                        onChange={(e) => {
                                          setSelectedGiftSizes((prev) => ({
                                            ...prev,
                                            [gift._id]: e.target.value,
                                          }));
                                        }}
                                      >
                                        {(Array.isArray(gift?.sizes)
                                          ? uniqueSizes
                                          : gift.sizes
                                        ).map((s) => (
                                          <option key={s}>{s}</option>
                                        ))}
                                      </Form.Select>
                                      <span
                                        style={{
                                          textDecoration: "line-through",
                                          color: "red",
                                          marginRight: "4px",
                                          marginLeft: "4px",
                                        }}
                                      >
                                        ₺{gift.price}
                                      </span>

                                      <span
                                        style={{
                                          color: "green",
                                          marginRight: "4px",
                                          marginLeft: "4px",
                                        }}
                                      >
                                        ₺{campaign?.subItems?.price}
                                      </span>
                                    </div>
                                  )}
                                </>
                              );
                            })}
                          </div>
                        )}
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
                        <Button
                          className="choose-btn mt-3 w-100"
                          variant="danger"
                          disabled={prod.stock <= 0}
                          onClick={() => {
                            if (
                              prod.category === "Eğitim Seti" ||
                              prod.category === "Kırtasiye Seti"
                            ) {
                              const currentYear = new Date().getFullYear();

                              // Step 1: Filter only orders by the current user
                              const userOrders = orders.filter(
                                (order) => order?.owner?._id === user?._id
                              );

                              // Step 2: Check if product was ordered in the current year
                              const alreadyOrdered = userOrders?.some(
                                (order) => {
                                  const orderYear = new Date(
                                    order.date || order.createdAt
                                  ).getFullYear();
                                  if (orderYear !== currentYear) return false;

                                  const productIds = Object.keys(
                                    order.products || {}
                                  );
                                  return productIds.includes(prod._id);
                                }
                              );

                              if (alreadyOrdered) {
                                setToastError(true);
                                return;
                              }
                            }
                            dispatch(addSizes(uniqueSizes));
                            addToCart({
                              userId: user._id,
                              productId: prod._id,
                              price: finalPrice,
                            });
                            dispatch(addSizeWithId(selectedGiftSizes));
                          }}
                        >
                          {prod.stock <= 0 ? "Stokta Yok" : "Sepete Ekle"}
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
              </>
              {/* )} */}
            </Row>
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
