import React, { useEffect, useState, useMemo } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useUpdateCampaignMutation } from "../services/appApi";
import axios from "../axios";
import debounce from "lodash.debounce";
import Select from "react-select";

function EditCampaignModal({ show, handleClose, campaignId }) {
  const [form, setForm] = useState({
    type: "percentage",
    amount: "",
    start_Date: "",
    end_date: "",
    products: [],
    selectedUsers: [],
  });

  const [students, setStudents] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const products = useSelector((state) => state.products || []);
  const [updateCampaign, { isLoading, isSuccess, isError, error }] =
    useUpdateCampaignMutation();

  useEffect(() => {
    fetch("/students_parents.json")
      .then((res) => res.json())
      .then(setStudents)
      .catch((err) => console.error("Failed to load students JSON", err));
  }, []);

  useEffect(() => {
    if (!campaignId || !show) return;

    axios.get(`/campaigns/single/${campaignId}`).then(({ data }) => {
      setForm({
        type: data.type || "percentage",
        amount: data.amount || "",
        start_Date: data.start_Date,
        end_date: data.end_date,
        products: data.products || [],
        selectedUsers: data.selectedUsers || [],
      });
      setSearchUser("");
    });
  }, [campaignId, show]);

  useEffect(() => {
    if (!searchUser) {
      setFilteredUsers([]);
      return;
    }

    const filtered = students.filter((student) =>
      student.Ogrenci_Adı?.toLowerCase().includes(searchUser.toLowerCase())
    );
    setFilteredUsers(filtered.slice(0, 20));
  }, [searchUser, students]);

  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchUser(value), 300),
    []
  );

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
    }
  };

  const resetForm = () =>
    setForm({
      type: "percentage",
      amount: "",
      start_Date: "",
      end_date: "",
      products: [],
      selectedUsers: [],
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
              isMulti
              isSearchable
              options={[
                ...students
                  .filter(
                    (v, i, self) =>
                      self.findIndex((s) => s.Ogrenci_TC === v.Ogrenci_TC) === i
                  )
                  .map((s) => ({
                    label: `${s.Ogrenci_Adı} (${s.Ogrenci_TC})`,
                    value: s.Ogrenci_TC,
                  })),
              ]}
              value={form.selectedUsers.map((tc) => {
                const student = students.find((s) => s.Ogrenci_TC === tc);
                return student
                  ? {
                      label: `${student.Ogrenci_Adı} (${student.Ogrenci_TC})`,
                      value: student.Ogrenci_TC,
                    }
                  : { label: tc, value: tc };
              })}
              onChange={(selectedOptions) =>
                setForm((prev) => ({
                  ...prev,
                  selectedUsers: selectedOptions.map((opt) => opt.value),
                }))
              }
              placeholder="Kullanıcıları ara ve seç"
            />
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
