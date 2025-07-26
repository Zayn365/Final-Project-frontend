import React, { useEffect, useState } from "react";
import { Badge, Button, Container, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import Loading from "../components/Loading";
import "./OrdersPage.css";

function OrdersPage() {
  const user = useSelector((state) => state.user);
  const products = useSelector((state) => state.products);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  if (loading) return <Loading />;

  if (orders.length === 0) {
    return (
      <Container className="py-5">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "60vh" }}
        >
          <h2 className="text-muted mb-3">Henüz siparişiniz yok</h2>
          <p
            className="text-secondary text-center"
            style={{ maxWidth: "400px" }}
          >
            Sipariş verdiğinizde burada görünecek. Ana sayfadan ürünleri sepete
            ekleyip kolayca sipariş oluşturabilirsiniz.
          </p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => navigate("/")}
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </Container>
    );
  }
  console.log(orders);
  return (
    <Container className="py-4">
      <h2 className="text-center mb-4">Siparişlerim</h2>
      <Table
        responsive
        bordered
        hover
        className="order-table text-center align-middle"
      >
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Durum</th>
            <th>Tarih</th>
            <th>Adet</th>
            <th>Ürünler</th>
            <th>Adres</th>
            <th>Toplam</th>
            <th>Ad Soyad</th> {/* New Column */}
            <th>Okul</th> {/* New Column */}
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
                name: product?.name || "Bilinmeyen Ürün",
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
                <td style={{ textAlign: "left", maxWidth: "240px" }}>
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
                      <div
                        className="text-truncate"
                        style={{ maxWidth: "160px" }}
                      >
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
                    ₺
                    {parseFloat(
                      order.products?.total ?? order.total ?? 0
                    ).toFixed(2)}
                  </strong>
                </td>
                <td>{order.username || user.name}</td>
                <td>{order.schoolName || "Belirtilmedi"}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="text-center mt-4">
        <Button variant="secondary" onClick={() => navigate("/")}>
          Ana Sayfaya Dön
        </Button>
      </div>
    </Container>
  );
}

export default OrdersPage;
