import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Alert, Col, Container, Row, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import CheckoutForm from "../components/CheckoutForm";
import {
  useIncreaseCartProductMutation,
  useDecreaseCartProductMutation,
  useRemoveFromCartMutation,
} from "../services/appApi";
import "./CartPage.css";
import { useState } from "react";

const stripePromise = loadStripe("pk_test_..."); // shortened for clarity

function CartPage() {
  const user = useSelector((state) => state.user);
  const products = useSelector((state) => state.products);
  const campaigns = useSelector((state) => state.campaigns); // 👈 get campaign state
  const [increaseCart] = useIncreaseCartProductMutation();
  const [decreaseCart] = useDecreaseCartProductMutation();
  const [removeFromCart, { isLoading }] = useRemoveFromCartMutation();

  const userCart = user.cart;
  const cartItems = products.filter((product) => userCart[product._id]);

  // Utility: Get discounted price if campaign exists
  const getDiscountedPrice = (product) => {
    if (campaigns.length <= 0 || !product.category) {
      return parseFloat(product.price);
    }

    const campaign = campaigns.find((c) => {
      return (
        Array.isArray(c.products) &&
        c.products.includes(product.category) &&
        (Array.isArray(c.selectedUsers)
          ? c.selectedUsers.includes(user?.tc_id)
          : c.selectedUser === user?.tc_id)
      );
    });

    if (!campaign) return parseFloat(product.price);

    if (campaign.type === "percentage") {
      const actualAmount =
        parseFloat(product.price) * (1 - campaign.amount / 100);
      return actualAmount;
    } else if (campaign.type === "fixed") {
      const actualAmountFixed = Math.max(
        parseFloat(product.price) - campaign.amount,
        0
      );
      return actualAmountFixed;
    }
    return parseFloat(product.price);
  };
  // Total price with campaign discounts
  const total = cartItems.reduce((acc, item) => {
    const quantity = userCart[item._id];
    const discountedPrice = getDiscountedPrice(item);
    return acc + discountedPrice * quantity;
  }, 0);

  const handleDecrease = (product) => {
    if (user.cart[product.productId] <= 1) return;
    decreaseCart(product);
  };

  return (
    <Container className="cart-container py-4" style={{ minHeight: "95vh" }}>
      <Row>
        <Col>
          <h1 className="h3 mb-3">Alışveriş Sepetiniz</h1>
          {cartItems.length === 0 ? (
            <Alert variant="info">
              Sepetiniz şu anda boş. Devam etmek için ürün ekleyin.
            </Alert>
          ) : (
            <Elements stripe={stripePromise}>
              <CheckoutForm
                products={cartItems.map((item) => {
                  const discountedPrice = getDiscountedPrice(item);
                  return {
                    ...item,
                    price: discountedPrice,
                  };
                })}
              />
            </Elements>
          )}
        </Col>

        {cartItems.length > 0 && (
          <Col md={5}>
            <Table responsive="sm" className="cart-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Ürün</th>
                  <th>Fiyat</th>
                  <th>Adet</th>
                  <th>Ara Toplam</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => {
                  const quantity = userCart[item._id];
                  const originalPrice = parseFloat(item.price);
                  const discountedPrice = getDiscountedPrice(item);
                  const hasDiscount = discountedPrice < originalPrice;
                  return (
                    <tr key={item._id}>
                      <td>
                        {!isLoading && (
                          <i
                            className="fa fa-times text-danger"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              removeFromCart({
                                productId: item._id,
                                price: item.price,
                                userId: user._id,
                              })
                            }
                          ></i>
                        )}
                      </td>
                      <td>
                        <img
                          src={item.pictures[0]?.url}
                          alt={item.name}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                          }}
                        />
                      </td>
                      <td>
                        ₺
                        {hasDiscount ? (
                          <>
                            <span className="text-muted text-decoration-line-through">
                              {originalPrice.toFixed(2)}
                            </span>{" "}
                            <span className="text-success fw-bold">
                              {discountedPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          originalPrice.toFixed(2)
                        )}
                      </td>
                      <td>
                        <div className="quantity-indicator">
                          <i
                            className="fa fa-minus-circle"
                            onClick={() =>
                              handleDecrease({
                                productId: item._id,
                                price: item.price,
                                userId: user._id,
                              })
                            }
                          ></i>
                          <span>{quantity}</span>
                          <i
                            className="fa fa-plus-circle"
                            onClick={() =>
                              increaseCart({
                                productId: item._id,
                                price: item.price,
                                userId: user._id,
                              })
                            }
                          ></i>
                        </div>
                      </td>
                      <td>₺{(discountedPrice * quantity).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <h4 className="text-end pt-3">Toplam: ₺{total.toFixed(2)}</h4>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default CartPage;
