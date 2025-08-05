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

const stripePromise = loadStripe("pk_test_...");

function CartPage() {
  const user = useSelector((state) => state.user);
  const products = useSelector((state) => state.products);
  const campaigns = useSelector((state) => state.campaigns);
  const [increaseCart] = useIncreaseCartProductMutation();
  const [decreaseCart] = useDecreaseCartProductMutation();
  const [removeFromCart, { isLoading }] = useRemoveFromCartMutation();

  const userCart = user.cart;
  const cartItems = products.filter((product) => userCart[product._id]);

  const getCampaignForProduct = (product) =>
    campaigns.find(
      (c) =>
        Array.isArray(c.products) &&
        c.products.includes(product.category) &&
        (Array.isArray(c.selectedUsers)
          ? c.selectedUsers.includes(user?.tc_id)
          : c.selectedUser === user?.tc_id)
    );

  const getDiscountedPrice = (product) => {
    const campaign = getCampaignForProduct(product);
    if (!campaign) return parseFloat(product.price);
    if (campaign.type === "percentage") {
      return parseFloat(product.price) * (1 - campaign.amount / 100);
    } else if (campaign.type === "fixed") {
      return Math.max(parseFloat(product.price) - campaign.amount, 0);
    }
    return parseFloat(product.price);
  };

  const total = cartItems.reduce((acc, item) => {
    const quantity = userCart[item._id];
    const discountedPrice = getDiscountedPrice(item);
    const campaign = getCampaignForProduct(item);
    const subItemsTotal = campaign?.subItems?.price || 0;
    return acc + discountedPrice * quantity + subItemsTotal;
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
                  const campaign = getCampaignForProduct(item);
                  const subItems = campaign?.subItems?.price || 0;
                  return {
                    ...item,
                    price: discountedPrice + subItems,
                  };
                })}
                total={total}
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
                  const campaign = getCampaignForProduct(item);
                  const subItems = campaign?.subItems?.items || [];

                  return (
                    <>
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
                              <span className=" text-danger text-decoration-line-through">
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

                      {subItems.map((sub, index) => (
                        <tr
                          key={`${item._id}-sub-${index}`}
                          className="bg-light"
                        >
                          <td>
                            <img
                              src={sub.pictures[0]?.url}
                              alt={sub.name}
                              style={{
                                width: 40,
                                height: 40,
                                objectFit: "cover",
                              }}
                            />
                          </td>
                          <td colSpan={2}>
                            <span className="fw-bold">{sub.name}</span>
                          </td>
                          <td colSpan={2} className="text-end text-muted">
                            +₺{campaign?.subItems.price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </>
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
