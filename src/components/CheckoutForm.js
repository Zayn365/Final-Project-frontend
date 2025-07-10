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

  // Form fields
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
    // ⚠️ MUTE PAYMENT CALL FOR NOW — Enable in production
    // const { client_secret } = await fetch(
    //   "https://final-project-backend-m9nb.onrender.com/create-payment",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: "Bearer ",
    //     },
    //     body: JSON.stringify({ amount: user.cart.total }),
    //   }
    // ).then((res) => res.json());

    // const { paymentIntent } = await stripe.confirmCardPayment(client_secret, {
    //   payment_method: {
    //     card: elements.getElement(CardElement),
    //   },
    // });

    setPaying(true);

    // Mute payment
    const paymentIntent = { status: "succeeded" };

    setPaying(false);

    if (paymentIntent) {
      const fullAddress = `${street}, ${area}, ${city} ${zipCode}, ${country}`;
      createOrder({
        userId: user._id,
        cart: user.cart,
        address: fullAddress,
        country,
      }).then((res) => {
        if (!isLoading && !isError) {
          setAlertMessage(`Payment ${paymentIntent.status}`);
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
          title="Order Placed Successfully"
          body="Your order has been placed and is being processed."
        />
      )}
      <Col className="cart-payment-container">
        <Form
          onSubmit={handlePay}
          style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}
        >
          {alertMessage && <Alert variant="success">{alertMessage}</Alert>}

          {/* Name + Email */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={user.email} disabled />
          </Form.Group>

          {/* Address */}
          <Form.Group controlId="street" className="mb-3">
            <Form.Label>Street Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="Street Address"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="area">
                <Form.Label>Area</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="city">
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="City"
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
                <Form.Label>Zip Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Zip Code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="country">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Card Field */}
          {/* <Form.Group controlId="cardDetails" className="mb-4">
          <Form.Label>Card Details</Form.Label>
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
              {paying ? "Processing..." : "Pay Now"}
            </Button>
          </div>
        </Form>
      </Col>
    </>
  );
}

export default CheckoutForm;
