import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "../services/appApi";
import ToastMessage from "../components/ToastMessage";

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [createOrder, { isLoading, isError, isSuccess }] =
    useCreateOrderMutation();

  const [firstName, setFirstName] = useState(user.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user.name?.split(" ")[1] || "");
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [paying, setPaying] = useState(false);

  async function handlePay(e) {
    e.preventDefault();
    if (!stripe || !elements || user.cart.count <= 0) return;

    setPaying(true);

    const paymentIntent = { status: "succeeded" };

    setPaying(false);
    if (paymentIntent) {
      const fullAddress = `${street}, ${area}, ${city} ${zipCode}, ${country}`;
      createOrder({
        userId: user._id,
        cart: user.cart,
        address: fullAddress,
        country,
        username: user.name,
        schoolName: user.k12?.schoolName || "",
      }).then((res) => {
        if (!isLoading && !isError) {
          setAlertMessage(`Ödeme durumu: ${paymentIntent.status}`);
          setShowToast(true);
          setTimeout(() => {
            navigate("/orders");
          }, 3000);
        }
      });
    }
  }

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
          {alertMessage && <Alert variant="success">{alertMessage}</Alert>}

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
            <Form.Label>Sokak Adresi</Form.Label>
            <Form.Control
              type="text"
              placeholder="Sokak adresinizi girin"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="area">
                <Form.Label>Bölge</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Bölgenizi girin"
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

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="zipCode">
                <Form.Label>Posta Kodu</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Posta kodunuzu girin"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="country">
                <Form.Label>Ülke</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ülkenizi girin"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Kredi Kartı Alanı (isteğe bağlı) */}
          {/* <Form.Group controlId="cardDetails" className="mb-4">
            <Form.Label>Kart Bilgileri</Form.Label>
            <div
              style={{
                padding: "10px",
                border: "1px solid #ced4da",
                borderRadius: "5px",
                backgroundColor: "#f8f9fa",
              }}
            >
              <CardElement id="card-element" />
            </div>
          </Form.Group> */}

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
