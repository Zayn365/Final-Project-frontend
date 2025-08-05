import React, { useEffect, useState } from "react";
import axios from "../axios";
import { Form, Table, Spinner } from "react-bootstrap";

function AdminReportPage() {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [schoolOptions, setSchoolOptions] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/report/orders");
      const data = res.data || [];

      const schools = [...new Set(data.map((r) => r.school))];
      setSchoolOptions(schools);
      setReportData(data);
      setFilteredData(data);
    } catch (err) {
      console.error("Error loading report:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  useEffect(() => {
    let filtered = [...reportData];

    if (selectedSchool !== "all") {
      filtered = filtered.filter((r) => r.school === selectedSchool);
    }

    if (selectedStatus === "ordered") {
      filtered = filtered.filter((r) => r.total > 0);
    } else if (selectedStatus === "not_ordered") {
      filtered = filtered.filter((r) => r.total === 0);
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [selectedSchool, selectedStatus, reportData]);

  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / perPage);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Sipariş Raporları</h2>

      <Form.Group className="mb-3 d-flex gap-3 flex-wrap">
        <Form.Select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          style={{ minWidth: 200 }}
        >
          <option value="all">Tüm Okullar</option>
          {schoolOptions.map((school, idx) => (
            <option key={idx} value={school}>
              {school}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ minWidth: 200 }}
        >
          <option value="all">Hepsi</option>
          <option value="ordered">Sipariş Veren</option>
          <option value="not_ordered">Sipariş Vermeyen</option>
        </Form.Select>
      </Form.Group>

      <p>
        Toplam <strong>{filteredData.length}</strong> kayıt
      </p>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table bordered striped responsive>
          <thead>
            <tr>
              <th>Öğrenci</th>
              <th>Alınan Ürünler</th>
              <th>Toplam Tutar</th>
              <th>Okul</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-4">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              currentData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.student || "Bilinmiyor"}</td>
                  <td>
                    {row.items?.length > 0
                      ? row.items.map(
                          (item, index) =>
                            `${item.quantity} x ${item.name}${
                              index < row.items.length - 1 ? ", " : ""
                            }`
                        )
                      : "Sipariş Yok"}
                  </td>
                  <td>{(row.total || 0).toLocaleString("tr-TR")} ₺</td>
                  <td>{row.school || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-3">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              className={`btn btn-sm ${
                currentPage === idx + 1 ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminReportPage;
