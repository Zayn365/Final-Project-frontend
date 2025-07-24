import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useUpdateCampaignMutation } from "../services/appApi";
import axios from "../axios";

function EditCampaignModal({ show, handleClose, campaignId }) {
  const [form, setForm] = useState({
    type: "percentage",
    amount: "",
    start_Date: "",
    end_date: "",
    products: [],
  });

  const products = useSelector((state) => state.products || []);
  const [updateCampaign, { isLoading, isSuccess, isError, error }] =
    useUpdateCampaignMutation();

  // Load campaign data when modal is shown
  useEffect(() => {
    if (!campaignId || !show) return;

    axios.get(`/campaigns/single/${campaignId}`).then(({ data }) => {
      setForm({
        type: data.type || "percentage",
        amount: data.amount || "",
        start_Date: data.start_Date,
        end_date: data.end_date,
        products: data.products || [],
      });
    });
  }, [campaignId, show]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id: campaignId,
      ...form,
      amount: Number(form.amount),
    };

    const { data } = await updateCampaign(payload);
    if (data) {
      handleCloseModal();
      window.location.reload();
    }
  };

  const resetForm = () =>
    setForm({
      type: "percentage",
      amount: "",
      start_Date: "",
      end_date: "",
      products: [],
    });

  const handleCloseModal = () => {
    resetForm();
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleCloseModal} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Kampanya Düzenle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {isSuccess && <Alert variant="success">Kampanya güncellendi</Alert>}
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

            {/* Selected product pills */}
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

            {/* Product selector */}
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
            Güncelle
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditCampaignModal;
