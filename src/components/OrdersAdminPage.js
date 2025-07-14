import React, { useEffect, useState, useMemo } from "react";
import { Badge, Button, Modal, Table, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "../axios";
import Loading from "./Loading";

function OrdersAdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const products = useSelector((state) => state.products);
  const [orderToShow, setOrderToShow] = useState([]);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  function markShipped(orderId, ownerId) {
    axios
      .patch(`/orders/${orderId}/mark-shipped`, { ownerId })
      .then(({ data }) => setOrders(data))
      .catch((e) => console.log(e));
  }

  function showOrder(productsObj) {
    let productsToShow = products.filter((product) => productsObj[product._id]);
    productsToShow = productsToShow.map((product) => {
      const productCopy = { ...product };
      productCopy.count = productsObj[product._id];
      delete productCopy.description;
      return productCopy;
    });
    setShow(true);
    setOrderToShow(productsToShow);
  }

  useEffect(() => {
    setLoading(true);
    axios
      .get("/orders")
      .then(({ data }) => {
        setLoading(false);
        setOrders(data);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const name = order.owner?.name || "";
      const addr = order.address || "";
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addr.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [orders, searchTerm]);

  if (loading) return <Loading />;
  if (orders.length === 0)
    return <h1 className="text-center pt-4">No orders yet</h1>;

  return (
    <>
      {/* Search */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <Form.Control
          type="search"
          placeholder="İsimle Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <div className="text-muted small">
          {filteredOrders.length} sonuç gösteriliyor
        </div>
      </div>

      <Table responsive striped bordered hover className="bg-white shadow-sm">
        <thead>
          <tr>
            <th>Sipariş No</th>
            <th>Müşteri Adı</th>
            <th>Ürünler</th>
            <th>Sipariş Tutarı</th>
            <th>Adres</th>
            <th>Durum</th>
            <th>Detaylar</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.owner?.name}</td>
              <td>{order.count}</td>
              <td>{order.total}</td>
              <td>{order.address}</td>
              <td>
                {order.status === "processing" ? (
                  <Button
                    size="sm"
                    onClick={() => markShipped(order._id, order.owner?._id)}
                  >
                    Mark as shipped
                  </Button>
                ) : (
                  <Badge bg="success">Shipped</Badge>
                )}
              </td>
              <td>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => showOrder(order.products)}
                >
                  View order <i className="fa fa-eye"></i>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Order details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderToShow.map((order, idx) => (
            <div
              key={idx}
              className="order-details__container d-flex justify-content-around py-2"
            >
              <img
                src={order.pictures[0].url}
                alt="product"
                style={{ maxWidth: 100, height: 100, objectFit: "cover" }}
              />
              <p>
                <span>{order.count} x </span> {order.name}
              </p>
              <p>Fiyat: ${Number(order.price) * order.count}</p>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default OrdersAdminPage;
