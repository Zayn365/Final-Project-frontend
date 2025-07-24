import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useCreateCampaignMutation } from "../services/appApi";
import { useSelector } from "react-redux";

const today = new Date().toISOString().split("T")[0];

function NewCampaignModal({ show, handleClose }) {
  const [form, setForm] = useState({
    products: [],
    type: "percentage",
    amount: "",
    start_Date: today,
    end_date: today,
  });

  const [createCampaign, { isLoading, isSuccess, isError, error }] =
    useCreateCampaignMutation();

  const products = useSelector((state) => state.products || []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      amount: Number(form.amount),
    };

    if (
      !payload.type ||
      isNaN(payload.amount) ||
      payload.products.length === 0
    ) {
      return alert("Lütfen tüm alanları doğru giriniz");
    }

    const { data } = await createCampaign(payload);
    if (data) {
      handleClose();
      window.location.reload();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Kampanya Ekle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {isSuccess && <Alert variant="success">Kampanya eklendi</Alert>}
          {isError && (
            <Alert variant="danger">{error?.data || "Hata oluştu"}</Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Tip</Form.Label>
            <Form.Select
              value={form.type}
              onChange={handleChange("type")}
              required
            >
              <option value="percentage">percentage</option>
              <option value="fixed">fixed</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Miktar</Form.Label>
            <Form.Control
              type="number"
              value={form.amount}
              onChange={handleChange("amount")}
              required
              placeholder="İndirim miktarı (örn: 10)"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Başlangıç Tarihi</Form.Label>
            <Form.Control
              type="date"
              value={form.start_Date}
              onChange={handleChange("start_Date")}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Bitiş Tarihi</Form.Label>
            <Form.Control
              type="date"
              value={form.end_date}
              onChange={handleChange("end_date")}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ürünler</Form.Label>

            <div className="d-flex flex-wrap gap-2 mb-2">
              {form.products.map((id) => {
                const p = products.find((prod) => prod._id === id);
                return (
                  <div
                    key={id}
                    className="d-flex align-items-center border rounded p-1 pe-2"
                  >
                    <img
                      src={p?.pictures?.[0]?.url}
                      alt=""
                      style={{
                        width: 30,
                        height: 30,
                        objectFit: "cover",
                        marginRight: 5,
                        borderRadius: 4,
                      }}
                    />
                    <span className="me-2">{p?.name}</span>
                    <i
                      className="fa fa-times text-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          products: prev.products.filter((pid) => pid !== id),
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>

            <Form.Select
              onChange={(e) => {
                const selectedId = e.target.value;
                if (
                  selectedId &&
                  !form.products.includes(selectedId) &&
                  products.find((p) => p._id === selectedId)
                ) {
                  setForm((prev) => ({
                    ...prev,
                    products: [...prev.products, selectedId],
                  }));
                }
              }}
            >
              <option value="">Ürün Seçiniz</option>
              {products.map((prod) => (
                <option key={prod._id} value={prod._id}>
                  {prod.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button type="submit" disabled={isLoading}>
            Kaydet
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default NewCampaignModal;
