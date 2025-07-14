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

const stripePromise = loadStripe(
  "pk_test_51QM6P3G00VUibJn8VLhisXcULn8mq8mouOEmH4lIFqL6iptyBYLYkiSR66YxyjyJTvfr4Q9lVYiyeJhtD42OMKQG00qNiRS25v"
);

function CartPage() {
  const user = useSelector((state) => state.user);
  const products = useSelector((state) => state.products);
  const [increaseCart] = useIncreaseCartProductMutation();
  const [decreaseCart] = useDecreaseCartProductMutation();
  const [removeFromCart, { isLoading }] = useRemoveFromCartMutation();

  const userCart = user.cart;
  const cartItems = products.filter((product) => userCart[product._id]);

  const handleDecrease = (product) => {
    if (user.cart[product.productId] <= 1) return;
    decreaseCart(product);
  };

  return (
    <Container className="cart-container py-4" style={{ minHeight: "95vh" }}>
      <Row>
        <Col>
          <h1 className="h3 mb-3">Your Shopping Cart</h1>
          {cartItems.length === 0 ? (
            <Alert variant="info">
              Your cart is currently empty. Add some products to proceed.
            </Alert>
          ) : (
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          )}
        </Col>

        {cartItems.length > 0 && (
          <Col md={5}>
            <Table responsive="sm" className="cart-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Product</th>
                  <th>Fiyat</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
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
                        style={{ width: 80, height: 80, objectFit: "cover" }}
                      />
                    </td>
                    <td>₺{parseFloat(item.price).toFixed(2)}</td>
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
                        <span>{user.cart[item._id]}</span>
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
                    <td>
                      ₺
                      {(parseFloat(item.price) * user.cart[item._id]).toFixed(
                        2
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <h4 className="text-end pt-3">
              Total: ₺{user.cart.total?.toFixed(2)}
            </h4>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default CartPage;
