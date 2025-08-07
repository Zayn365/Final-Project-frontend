import React, { useEffect, useState, useMemo, useRef } from "react";
import { Badge, Button, Modal, Table, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import axios from "../axios";
import Loading from "./Loading";
import html2pdf from "html2pdf.js";

function OrdersAdminPage() {
  const [orders, setOrders] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [orderToShow, setOrderToShow] = useState(null);
  const [show, setShow] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const products = useSelector((state) => state.products);
  const printRef = useRef();
  const productList = useMemo(() => {
    if (!orderToShow || !orderToShow.products) return [];

    const productIds = Object.keys(orderToShow.products || {}).filter(
      (key) => key !== "count" && key !== "total"
    );

    return productIds.map((productId) => {
      const product = products.find((p) => p._id === productId);
      return {
        id: productId,
        name: product?.name || "Bilinmeyen Ürün",
        quantity: orderToShow.products[productId],
        image: product?.pictures?.[0]?.url || null,
      };
    });
  }, [orderToShow, products]);

  const handleClose = () => {
    setOrderToShow(null);
    setShow(false);
  };

  function markShipped(orderId, ownerId) {
    axios
      .patch(`/orders/${orderId}/mark-shipped`, { ownerId })
      .then(({ data }) => setOrders(data))
      .catch((e) => console.log(e));
  }

  function showOrderDetails(order) {
    setOrderToShow(order);
    setShow(true);
  }

  function deleteOrder(orderId) {
    axios
      .delete(`/orders/${orderId}`)
      .then(({ data }) => {
        setOrders(data);
        setDeleteConfirm({ show: false, id: null });
      })
      .catch((e) => {
        console.error(e);
        setDeleteConfirm({ show: false, id: null });
      });
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

  useEffect(() => {
    fetch("/students_parents.json")
      .then((res) => res.json())
      .then(setStudents)
      .catch((err) => {
        console.error("Failed to load students JSON:", err);
        setStudents([]);
      });
  }, []);

  const studentSchoolMap = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      map[s.Ogrenci_TC] = s.Okul;
    });
    return map;
  }, [students]);

  const schoolOptions = useMemo(() => {
    return Array.from(
      new Set(students.map((s) => s.Okul?.trim()).filter(Boolean))
    );
  }, [students]);
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const name = order.owner?.name || "";
      const addr = order.address || "";
      const school = order.schoolName || "";
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSchool = selectedSchool
        ? school?.toLowerCase().trim() === selectedSchool.toLowerCase().trim()
        : true;
      return matchesSearch && matchesSchool;
    });
  }, [orders, searchTerm, selectedSchool, studentSchoolMap]);

  if (loading) return <Loading />;
  if (orders.length === 0)
    return <h1 className="text-center pt-4">No orders yet</h1>;

  const handlePrint = () => {
    const element = printRef.current;
    const opt = {
      margin: 0.5,
      filename: "siparis-detayi.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true }, // ⬅️ critical for images!
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };
  return (
    <>
      {/* Search + School Filter */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <Form.Control
          type="search"
          placeholder="İsimle Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <Form.Select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          style={{ maxWidth: "300px" }}
        >
          <option value="">Tüm Okullar</option>
          {schoolOptions.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
        </Form.Select>
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
            <th>Okul</th>
            {/* <th>School Name</th> */}
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
              {/* <td>{studentSchoolMap[order.username] || "Bilinmiyor"}</td> */}
              <td>{order.schoolName}</td>
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
                  onClick={() => showOrderDetails(order)}
                  className="text-primary me-3"
                >
                  View order <i className="fa fa-eye"></i>
                </span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setDeleteConfirm({ show: true, id: order._id })
                  }
                  className="text-danger"
                >
                  Delete <i className="fa fa-trash"></i>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* View Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sipariş Detayları</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderToShow && (
            <div className="px-2" ref={printRef}>
              <p>
                <strong>Sipariş No:</strong> {orderToShow._id}
              </p>
              <p>
                <strong>Müşteri:</strong> {orderToShow.owner?.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {orderToShow.owner?.email || "N/A"}
              </p>
              <p>
                <strong>Adres:</strong> {orderToShow.address}
              </p>
              <p>
                <strong>Ülke:</strong> {orderToShow.country || "N/A"}
              </p>
              {/* <p>
                <strong>Okul:</strong>{" "}
                {studentSchoolMap[orderToShow.username] || "Bilinmiyor"}
              </p> */}
              <p>
                <strong>Okul:</strong> {orderToShow.schoolName}
              </p>
              <p>
                <strong>Durum:</strong> {orderToShow.status}
              </p>
              <p>
                <strong>Ürünler:</strong>
              </p>
              <ul>
                {productList.map((item, index) => (
                  <li key={index} className="mb-2">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                          marginRight: "10px",
                        }}
                      />
                    )}
                    {item.quantity} x {item.name}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Tutar:</strong> ₺{orderToShow.total}
              </p>
              <p>
                <strong>Tarih:</strong> {orderToShow.date?.slice(0, 10)}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Kapat
          </Button>
          <Button variant="primary" onClick={handlePrint}>
            PDF İndir
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={deleteConfirm.show}
        onHide={() => setDeleteConfirm({ show: false, id: null })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Silme Onayı</Modal.Title>
        </Modal.Header>
        <Modal.Body>Silmek istediğinize emin misiniz?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setDeleteConfirm({ show: false, id: null })}
          >
            Hayır
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteOrder(deleteConfirm.id)}
          >
            Evet
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default OrdersAdminPage;
