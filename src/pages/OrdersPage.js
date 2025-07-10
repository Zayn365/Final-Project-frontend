import React, { useEffect, useState } from "react";
import { Badge, Container, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "../axios";
import Loading from "../components/Loading";
import "./OrdersPage.css";

function OrdersPage() {
  const user = useSelector((state) => state.user);
  const products = useSelector((state) => state.products);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/users/${user._id}/orders`)
      .then(({ data }) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to fetch orders:", e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (orders.length === 0) {
    return <h1 className="text-center pt-3">No orders yet</h1>;
  }

  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Your Orders</h2>
      <Table
        responsive
        bordered
        hover
        className="order-table text-center align-middle"
      >
        <thead>
          <tr>
            <th>#</th>
            <th>Status</th>
            <th>Date</th>
            <th>Items</th>
            <th>Products</th>
            <th>Shipping To</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const productIds = Object.keys(order.products || {}).filter(
              (key) => key !== "count" && key !== "total"
            );

            const items = productIds.map((productId) => {
              const product = products.find((p) => p._id === productId);
              return {
                id: productId,
                name: product?.name || "Unknown",
                quantity: order.products[productId],
                image: product?.pictures?.[0]?.url || null,
              };
            });

            return (
              <tr key={order._id}>
                <td>
                  <code>{order._id.slice(0, 8)}</code>
                </td>
                <td>
                  <Badge
                    bg={
                      order.status === "processing"
                        ? "warning"
                        : order.status === "shipped"
                        ? "info"
                        : "success"
                    }
                    text="dark"
                  >
                    {order.status}
                  </Badge>
                </td>
                <td>{order.date}</td>
                <td>{order.products?.count || 0}</td>
                <td style={{ textAlign: "left", maxWidth: "200px" }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="mb-2 d-flex align-items-center gap-2"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          width={32}
                          height={32}
                          style={{
                            objectFit: "cover",
                            borderRadius: 4,
                            border: "1px solid #ccc",
                          }}
                        />
                      )}
                      <div>
                        <strong>{item.name}</strong> × {item.quantity}
                      </div>
                    </div>
                  ))}
                </td>
                <td className="text-wrap" style={{ maxWidth: "160px" }}>
                  {order.address}
                </td>
                <td>
                  <strong>
                    $
                    {parseFloat(
                      order.products?.total ?? order.total ?? 0
                    ).toFixed(2)}
                  </strong>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
}

export default OrdersPage;
