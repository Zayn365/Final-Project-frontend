import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCreateOrderMutation } from "../services/appApi";
import ToastMessage from "../components/ToastMessage";
import axios from "axios";
import { bankBins } from "../utils/bankBins";
function CheckoutForm({ products, total }) {
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
  const [is3DSecure, setIs3DSecure] = useState(true); // Toggle for 3D Secure
  useEffect(() => {
    const listener = async (event) => {
      if (event.data?.type === "3DS_DONE" && event.data.success) {
        // Now we know payment succeeded — create the order
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
            setAlertMessage("3D Secure ödeme başarılı. Sipariş oluşturuldu.");
            setShowToast(true);
            setTimeout(() => navigate("/orders"), 1000);
          }
        } catch (err) {
          setAlertVariant("danger");
          setAlertMessage("Sipariş oluşturulurken bir hata oluştu.");
        } finally {
          setPaying(false);
        }
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [user, street, area, city]);

  async function postToZiraat3DSecure(sessionToken, data) {
    const popup = window.open("", "_blank", "width=600,height=800");

    if (!popup) {
      alert("Popup blocked! Please allow popups for this website.");
      return;
    }

    // ✅ Start monitoring if popup is closed
    const popupInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupInterval);
        setPaying(false); // reset paying flag
      }
    }, 500);

    const formAction = `https://vpos.ziraatpay.com.tr/ziraatpay/api/v2/post/sale3d/${sessionToken}`;
    const formInputs = Object.entries(data)
      .map(
        ([key, value]) =>
          `<input type="hidden" name="${key}" value="${value}" />`
      )
      .join("");

    const formHtml = `
  <!DOCTYPE html>
  <html>
     <head>
        <title>Sample POST Form</title>
        <meta charset="utf-8">
        <script>
                function hideCardPANData() {
                  if (document
                      .getElementById('isPayWithCardToken').checked) {
                    document.getElementById('cardPANData').style.display = 'none';
                    document
                        .getElementById('cardTokenContainer').style.display = 'block';
                  } else {
                    document
                        .getElementById('cardTokenContainer').style.display = 'none';
                    document.getElementById('cardPANData').style.display = 'block';
                  }
                }
              </script>
        <style type="text/css">
  form {
    display: table;
  }
  p {
    display: table-row;
  }
  label {
    display: table-cell;
  }
  input {
    display: table-cell;
  }
  </style>
     </head>
     <body onload="hideCardPANData();">
        <form
      action="${formAction}"
      method="post">
           <div>
              <label for="isPayWithCardToken">Pay with Card Token</label>
              <input type="checkbox" onclick="hideCardPANData();"
          name="isPayWithCardToken" id="isPayWithCardToken" autocomplete="off"
          maxlength="32" />
           </div>
           <div class="container">
              <div id="cardPANData">
                 <p>
                    <label for="cardOwner">Card Owner Name</label>
                    <input type="text"  name="cardOwner" id="cardOwner"
              autocomplete="off" maxlength="32" />
                 </p>
                 <p>
                    <label for="pan">Card Number (PAN)</label>
                    <input type="text" id="pan" name="pan"
              autocomplete="off" maxlength="19" />
                 </p>
                 <p>
                    <label for="expiryMonth">Expiration Date</label>
                    <select name="expiryMonth" id="expiryMonth">
                       <option value="01">January</option>
                       <option value="02">February</option>
                       <option value="03">March</option>
                       <option value="04">April</option>
                       <option value="05">May</option>
                       <option value="06">June</option>
                       <option value="07">July</option>
                       <option value="08">August</option>
                       <option value="09">September</option>
                       <option value="10">October</option>
                       <option value="11">November</option>
                       <option value="12">December</option>
                    </select>
                    <select name="expiryYear" id="expiryYear">
                       <option value="2024">2024</option>
                       <option value="2025">2025</option>
                       <option value="2026">2026</option>
                       <option value="2027">2027</option>
                       <option value="2028">2028</option>
                       <option value="2029">2029</option>
                       <option value="2030">2030</option>
                       <option value="2031">2031</option>
                       <option value="2032">2032</option>
                       <option value="2033">2033</option>
                       <option value="2034">2034</option>
                    </select>
                 </p>
                 <p>
                    <label for="cvv">Security Code (CVV)</label>
                    <input type="input" name="cvv" id="cvv"
              autocomplete="off" maxlength="4" />
                 </p>
                 <p>
                    <label for="saveCard">Save Card</label>
                    <input type="checkbox" name="saveCard" id="saveCard"
              value="YES" />
                 </p>
                 <p>
                    <label for="cardName">Card Name</label>
                    <input type="text" name="cardName" id="cardName" />
                 </p>
                 <p>
                    <label for="installmentCount">Installment Count</label>
                    <input disabled type="text" name="installmentCount"
              id="installmentCount" />
                 </p>
                 <input type="hidden" value="" name="points" id="points" />
           <input type="hidden" value="" name="paymentSystem"
            id="paymentSystem" />
              </div>
           </div>
           <div id="cardTokenContainer">
              <p>
                 <label for="cardToken">Card Token</label>
                 <input type="text" name="cardToken" id="cardToken"
            autocomplete="off" maxlength="64" />
              </p>
              <p>
                 <label for="installmentCount">Installment Count</label>
                 <input type="text" disabled name="installmentCount"
            id="installmentCount" />
              </p>
           </div>
           <input type="submit" value="Submit" />
          </form>
         
         <script type="text/javascript" src="https://ZIRAATPAY_HOST/ziraatpay/static/external/whitewolf-v3.js"></script>
      <script type="text/javascript">
        whitewolf.run(h.online-metrix.net, ORG_ID, SESSIONTOKEN);
      </script>
      <noscript>
          <iframe
              style="width: 100px; height: 100px; border: 0; position: absolute; top: -5000px;"
              src="https://h.online-metrix.net/tags?org_id=ORG_ID&session_id=UNIQUE_SESSION_ID&pageid=PAGEID">
          </iframe>
      </noscript>
      </body>
  </html>
  `;

    popup.document.open();
    popup.document.write(formHtml);
    popup.document.close();
  }

  function waitForPopupCompletion() {
    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.data?.type === "3DS_DONE") {
          window.removeEventListener("message", handler);
          resolve(event.data.success); // true or false
        }
      };
      window.addEventListener("message", handler);
    });
  }
  const createPaymentSession = async (user) => {
    const userCardBin = cardNumber?.substring(0, 6);
    const binExists = bankBins.some((entry) => entry.bin === userCardBin);
    const isOtherCard = !binExists;
    try {
      const body = {
        amount: total || user.cart.total,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone || "5380000000",
        returnUrl: "https://store.bikev.k12.tr/payment/result",
        isOtherCard: isOtherCard,
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
      };
      const response = await axios.post(
        `https://final-project-backend-m9nb.onrender.com/${
          is3DSecure ? "payment" : "payment"
        }`,
        body
      );

      if (is3DSecure) {
        await postToZiraat3DSecure(response.data.sessionToken, {
          ACTION: "SALE",
          SESSIONTOKEN: response.data.sessionToken,
          CARDPAN: `${cardNumber}`,
          CARDEXPIRY: `${expDate}`,
          CARDCVV: `${cvv}`,
          INSTALLMENTS: "",
          NAMEONCARD: `${nameOnCard}`,
          CARDOWNER: `${nameOnCard}`,
        });
        await waitForPopupCompletion(); // ✅ fix
        return response.data.sessionToken;
      } else {
        // return response.data.sessionToken;
      }
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

    if (!is3DSecure) {
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

      // Only non-3D payment creates the order here
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
        setAlertVariant("danger");
        setAlertMessage("Sipariş oluşturulurken bir hata oluştu.");
      } finally {
        setPaying(false);
      }
    }

    // If 3D Secure, wait for the postMessage in useEffect
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
          <Form.Group controlId="is3DSecure" className="mb-3">
            <Form.Check
              type="checkbox"
              label="3D Secure Kart ile ödeme yap"
              checked={is3DSecure}
              disabled={is3DSecure}
              required
              onChange={(e) => setIs3DSecure(e.target.checked)}
            />
          </Form.Group>
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
          {/* {!is3DSecure && (
            <>
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
            </>
          )} */}
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
