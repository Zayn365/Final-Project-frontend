import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useUpdateCampaignMutation } from "../services/appApi";
import * as XLSX from "xlsx";
import axios from "../axios";

function EditCampaignModal({ show, handleClose, campaignId }) {
  const [form, setForm] = useState({
    products: [],
    type: "percentage",
    amount: "",
    start_Date: "",
    end_date: "",
    subItemsPrice: "",
    subItemsItems: [],
  });

  const [students, setStudents] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const [updateCampaign, { isLoading, isSuccess, isError, error }] =
    useUpdateCampaignMutation();
  const products = useSelector((state) => state.products || []);

  // Load student JSON
  useEffect(() => {
    fetch("/students_parents.json")
      .then((res) => res.json())
      .then(setStudents)
      .catch((err) => {
        console.error("Failed to load students JSON:", err);
        setStudents([]);
      });
  }, []);

  // Load existing campaign data
  useEffect(() => {
    if (!campaignId || !show) return;
    axios.get(`/campaigns/single/${campaignId}`).then(({ data }) => {
      setForm({
        type: data.type || "percentage",
        amount: data.amount || "",
        start_Date: data.start_Date,
        end_date: data.end_date,
        products: data.products || [],
        subItemsPrice: data.subItems?.price || "",
        subItemsItems: data.subItems?.items || [],
      });
      setSelectedUsers(data.selectedUsers || []);
    });
  }, [campaignId, show]);

  const uniqueStudents = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      if (!map.has(s.Ogrenci_TC)) map.set(s.Ogrenci_TC, s);
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

  useEffect(() => {
    if (selectAll) {
      const allTCs = filteredStudents.map((s) => s.Ogrenci_TC);
      setSelectedUsers((prev) => Array.from(new Set([...prev, ...allTCs])));
    } else {
      const remaining = selectedUsers.filter(
        (tc) => !filteredStudents.some((s) => s.Ogrenci_TC === tc)
      );
      setSelectedUsers(remaining);
    }
  }, [selectAll, filteredStudents]);

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
      const newStudents = jsonData.filter((row) => row["Ogrenci_TC"]);
      const tcList = newStudents.map((s) => s["Ogrenci_TC"]);

      setStudents((prev) => {
        const existingTCs = new Set(prev.map((s) => s.Ogrenci_TC));
        const merged = [...prev];
        newStudents.forEach((s) => {
          if (!existingTCs.has(s.Ogrenci_TC)) merged.push(s);
        });
        return merged;
      });

      setSelectedUsers((prev) => Array.from(new Set([...prev, ...tcList])));
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: campaignId,
      ...form,
      amount: Number(form.amount),
      selectedUsers,
      subItems: {
        price: Number(form.subItemsPrice),
        items: form.subItemsItems,
      },
    };

    if (
      !payload.type ||
      isNaN(payload.amount) ||
      payload.products.length === 0 ||
      selectedUsers.length === 0
    ) {
      return alert("Lütfen tüm alanları doldurunuz ve kullanıcı seçiniz.");
    }

    const { data } = await updateCampaign(payload);
    if (data) handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
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
            <Form.Select value={form.type} onChange={handleChange("type")}>
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
                      setForm((prev) => ({ ...prev, products: [] }))
                    }
                  />
                </div>
              )}
            </div>
            <Form.Select
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  products: [e.target.value],
                }))
              }
            >
              <option value="">Kategori Seçiniz</option>
              {[...new Set(products.map((p) => p.category))].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Hediye Ürün Fiyatı</Form.Label>
            <Form.Control
              type="number"
              value={form.subItemsPrice}
              onChange={handleChange("subItemsPrice")}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Hediye Ürünler</Form.Label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {form.subItemsItems.map((prod) => (
                <div
                  key={prod._id}
                  className="d-flex align-items-center border rounded p-1 pe-2"
                >
                  <span className="me-2">{prod.name}</span>
                  <i
                    className="fa fa-times text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        subItemsItems: prev.subItemsItems.filter(
                          (p) => p._id !== prod._id
                        ),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            <Form.Select
              onChange={(e) => {
                const selected = e.target.value;
                const product = products.find((p) => p._id === selected);
                if (
                  product &&
                  !form.subItemsItems.some((item) => item._id === product._id)
                ) {
                  setForm((prev) => ({
                    ...prev,
                    subItemsItems: [...prev.subItemsItems, product],
                  }));
                }
              }}
            >
              <option value="">Hediye ürün seçiniz</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
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

          <Form.Control
            className="mb-2"
            type="text"
            placeholder="İsim veya TC numarasıyla ara"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

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
                  <th>
                    <Form.Check
                      type="checkbox"
                      label="Hepsini Seç"
                      checked={
                        filteredStudents.every((s) =>
                          selectedUsers.includes(s.Ogrenci_TC)
                        ) && filteredStudents.length > 0
                      }
                      onChange={(e) => setSelectAll(e.target.checked)}
                    />
                  </th>
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

          <Button type="submit" className="mt-3" disabled={isLoading}>
            Güncelle
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditCampaignModal;
