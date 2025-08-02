import React, { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "../services/appApi";
import ToastMessage from "../components/ToastMessage";
import axios from "axios";

function CheckoutForm({ products }) {
  const stripe = true;
  const elements = true;
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("success"); // NEW
  const [showToast, setShowToast] = useState(false);
  const [paying, setPaying] = useState(false);
  const [createOrder, { isLoading, isError, isSuccess }] =
    useCreateOrderMutation();

  const [firstName, setFirstName] = useState(user.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user.name?.split(" ")[1] || "");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expDate, setExpDate] = useState("");

  const createPaymentSession = async (user) => {
    try {
      const response = await axios.post(
        "https://final-project-backend-m9nb.onrender.com/payment",
        {
          amount: user.cart.total,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phone || "5380000000",
          returnUrl: "https://store.bikev.k12.tr/",
          orderItems: products
            ? products.map((product) => ({
                productCode: product.id,
                name: product.name,
                description: product.description,
                quantity: user.cart[product._id],
                amount: product.price,
              }))
            : [
                {
                  productCode: "001",
                  name: "Test Product",
                  description: "This is a test item",
                  quantity: 1,
                  amount: 720,
                },
              ],
        }
      );
      return response.data.sessionToken;
    } catch (error) {
      console.error("Error creating payment session", error);
      return null;
    }
  };

  const chargeCard = async ({
    sessionToken,
    cardPan,
    cardExpiry,
    cardCvv,
    nameOnCard,
  }) => {
    try {
      const response = await axios.post(
        "https://final-project-backend-m9nb.onrender.com/payment/card",
        {
          sessionToken,
          cardPan,
          cardExpiry,
          cardCvv,
          nameOnCard,
          installments: "1",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Card charge failed", error);
      return null;
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || user.cart.count <= 0) return;

    setPaying(true);
    setAlertMessage("");
    setAlertVariant("success");

    const sessionToken = await createPaymentSession(user);
    if (!sessionToken) {
      setAlertMessage("Oturum oluşturulamadı.");
      setAlertVariant("danger");
      setPaying(false);
      return;
    }

    const chargeResult = await chargeCard({
      sessionToken,
      cardPan: cardNumber,
      cardExpiry: expDate,
      cardCvv: cvv,
      nameOnCard,
    });

    if (!chargeResult || chargeResult.responseMsg !== "Approved") {
      setAlertVariant("danger");
      setAlertMessage(
        chargeResult?.errorMsg ||
          "Ödeme başarısız. Lütfen tekrar deneyiniz veya başka bir kart kullanınız."
      );
      setPaying(false);
      return;
    }

    const fullAddress = `${street}, ${area}, ${city}`;
    try {
      const res = await createOrder({
        userId: user._id,
        cart: user.cart,
        address: fullAddress,
        country: "Türkiye",
        username: user.name,
        schoolName: user.k12?.schoolName || "",
      });

      if (res?.data) {
        setAlertVariant("success");
        setAlertMessage("Ödeme durumu: Başarılı");
        setShowToast(true);
        setTimeout(() => navigate("/orders"), 1000);
      }
    } catch (err) {
      console.error("Order creation failed", err);
      setAlertVariant("danger");
      setAlertMessage("Sipariş oluşturulurken bir hata oluştu.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      {showToast && (
        <ToastMessage
          bg="success"
          title="Sipariş Başarıyla Oluşturuldu"
          body="Siparişiniz alındı ve işleme alındı."
        />
      )}
      <Col className="cart-payment-container">
        <Form
          onSubmit={handlePay}
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}
        >
          {alertMessage && <Alert variant={alertVariant}>{alertMessage}</Alert>}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="firstName">
                <Form.Label>Ad</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Adınızı girin"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="lastName">
                <Form.Label>Soyad</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Soyadınızı girin"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>E-posta</Form.Label>
            <Form.Control type="email" value={user.email} disabled />
          </Form.Group>

          <Form.Group controlId="street" className="mb-3">
            <Form.Label>Adres</Form.Label>
            <Form.Control
              type="text"
              placeholder="Adresinizi girin"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="area">
                <Form.Label>İlçe</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="İlçenizi girin"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="city">
                <Form.Label>Şehir</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Şehrinizi girin"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="nameOnCard" className="mb-3">
            <Form.Label>Kart Üzerindeki İsim</Form.Label>
            <Form.Control
              type="text"
              value={nameOnCard}
              placeholder="Kart Üzerindeki İsim"
              onChange={(e) => setNameOnCard(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="cardNumber" className="mb-3">
            <Form.Label>Kart Numarası</Form.Label>
            <Form.Control
              type="text"
              placeholder="Kart Numarası"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="cvv">
                <Form.Label>CVV</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  pattern="\d{3,4}"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // only digits
                    if (value.length <= 4) setCvv(value);
                  }}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="expDate">
                <Form.Label>Son Kullanma Tarihi</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="MM/YY"
                  inputMode="numeric"
                  maxLength={5}
                  value={expDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^\d]/g, "");

                    if (value.length >= 3) {
                      value = value.slice(0, 2) + "/" + value.slice(2, 4);
                    }

                    if (value.length <= 5) setExpDate(value);
                  }}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-grid">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={user.cart.count <= 0 || paying || isSuccess}
            >
              {paying ? "İşleniyor..." : "Şimdi Sipariş Ver"}
            </Button>
          </div>
        </Form>
      </Col>
    </>
  );
}

export default CheckoutForm;
