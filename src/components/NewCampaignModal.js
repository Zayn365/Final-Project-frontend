import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useCreateCampaignMutation } from "../services/appApi";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";

const today = new Date().toISOString().split("T")[0];

function NewCampaignModal({ show, handleClose }) {
  const [form, setForm] = useState({
    products: [],
    type: "percentage",
    amount: "",
    start_Date: today,
    end_date: today,
  });

  const [students, setStudents] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");

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

  const uniqueStudents = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      if (!map.has(s.Ogrenci_TC)) {
        map.set(s.Ogrenci_TC, s);
      }
    });
    return Array.from(map.values());
  }, [students]);

  const campusOptions = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.Okul)));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return uniqueStudents.filter((s) => {
      const matchesSearch =
        s.Ogrenci_Adı?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.Ogrenci_TC?.toString().includes(searchTerm);
      const matchesCampus = selectedCampus ? s.Okul === selectedCampus : true;
      return matchesSearch && matchesCampus;
    });
  }, [uniqueStudents, searchTerm, selectedCampus]);
  const resetForm = () => {
    setForm({
      products: [],
      type: "percentage",
      amount: "",
      start_Date: today,
      end_date: today,
    });
    setSelectedUsers([]);
    setSearchTerm("");
    setSelectedCampus("");
  };

  const toggleUser = (tc) => {
    setSelectedUsers((prev) =>
      prev.includes(tc) ? prev.filter((id) => id !== tc) : [...prev, tc]
    );
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const binaryStr = evt.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const tcList = jsonData.map((row) => row["Ogrenci_TC"]).filter(Boolean);
      setSelectedUsers((prev) => Array.from(new Set([...prev, ...tcList])));
    };

    reader.readAsBinaryString(file);
  };
  const onClose = () => {
    resetForm();
    handleClose();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      amount: Number(form.amount),
      selectedUsers,
    };

    if (
      !payload.type ||
      isNaN(payload.amount) ||
      payload.products.length === 0 ||
      selectedUsers.length === 0
    ) {
      return alert("Lütfen tüm alanları doldurunuz ve kullanıcı seçiniz.");
    }

    const { data } = await createCampaign(payload);
    if (data) {
      handleClose();
    }
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        handleClose();
        onClose();
      }}
      size="lg"
      centered
    >
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
                      setForm((prev) => ({ ...prev, products: [] }))
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

          <hr />
          <h5>
            Kullanıcı Seç{" "}
            <label style={{ cursor: "pointer", marginLeft: 10 }}>
              📥
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                hidden
              />
            </label>
          </h5>

          <Form.Group className="mb-2">
            <Form.Control
              type="text"
              placeholder="İsim veya TC numarasıyla ara"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>

          <Form.Select
            className="mb-2"
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
          >
            <option value="">Tüm Kampüsler</option>
            {campusOptions.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </Form.Select>

          <div style={{ maxHeight: 250, overflowY: "auto" }}>
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Seç</th>
                  <th>Ad</th>
                  <th>TC</th>
                  <th>Kampüs</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.Ogrenci_TC}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedUsers.includes(s.Ogrenci_TC)}
                        onChange={() => toggleUser(s.Ogrenci_TC)}
                      />
                    </td>
                    <td>{s.Ogrenci_Adı}</td>
                    <td>{s.Ogrenci_TC}</td>
                    <td>{s.Okul}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUsers.length > 0 && (
            <div className="mt-2">
              <Form.Label>Seçilen Kullanıcılar:</Form.Label>
              <ul>
                {uniqueStudents
                  .filter((s) => selectedUsers.includes(s.Ogrenci_TC))
                  .map((s) => (
                    <li key={s.Ogrenci_TC}>
                      {s.Ogrenci_Adı} ({s.Ogrenci_TC})
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <Button type="submit" className="mt-3" disabled={isLoading}>
            Kaydet
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default NewCampaignModal;
