import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useCreateCampaignMutation } from "../services/appApi";
import { useSelector } from "react-redux";
import Select from "react-select";

const today = new Date().toISOString().split("T")[0];

function NewCampaignModal({ show, handleClose }) {
  const [form, setForm] = useState({
    products: [],
    type: "percentage",
    amount: "",
    start_Date: today,
    end_date: today,
    selectedUser: "",
  });

  const [students, setStudents] = useState([]);
  const [createCampaign, { isLoading, isSuccess, isError, error }] =
    useCreateCampaignMutation();
  const products = useSelector((state) => state.products || []);

  useEffect(() => {
    fetch("/students_parents.json")
      .then((res) => res.json())
      .then(setStudents)
      .catch((err) => {
        console.error("Failed to load students JSON:", err);
        setStudents([]);
      });
  }, []);

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
              <option value="percentage">Yüzde</option>
              <option value="fixed">Tutar</option>
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
            <Form.Label>Kategoriler</Form.Label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {form.products[0] && (
                <div className="d-flex align-items-center border rounded p-1 pe-2">
                  <span className="me-2">{form.products[0]}</span>
                  <i
                    className="fa fa-times text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        products: [],
                      }))
                    }
                  />
                </div>
              )}
            </div>
            <Form.Select
              onChange={(e) => {
                const selectedCategory = e.target.value;
                if (selectedCategory) {
                  setForm((prev) => ({
                    ...prev,
                    products: [selectedCategory],
                  }));
                }
              }}
            >
              <option value="">Kategori Seçiniz</option>
              {[...new Set(products.map((p) => p.category))].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Kullanıcı Seç</Form.Label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              isSearchable
              options={students.map((s) => ({
                label: `${s.Ogrenci_Adı} (${s.Veli_Adı || "Veli Bilinmiyor"})`,
                value: s.Ogrenci_TC,
              }))}
              value={
                students.find((s) => s.Ogrenci_TC === form.selectedUser)
                  ? {
                      label: students.find(
                        (s) => s.Ogrenci_TC === form.selectedUser
                      )?.Ogrenci_Adı,
                      value: form.selectedUser,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                setForm((prev) => ({
                  ...prev,
                  selectedUser: selectedOption?.value || "",
                }))
              }
              placeholder="Kullanıcı ara ve seç"
              noOptionsMessage={() => "Sonuç bulunamadı"}
            />
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
