import React, { useEffect, useState, useMemo } from "react";
import { Table, Form, Pagination, Spinner } from "react-bootstrap";
import axios from "./../axios";

function AdminReportPage() {
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all"); // all | have | no
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Fetch report data from backend
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/report/orders");
        setReportData(res.data || []);
      } catch (err) {
        console.error("Rapor verisi alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Unique school list
  const uniqueSchools = useMemo(() => {
    const schools = reportData.map((r) => r.school || "Bilinmiyor");
    return Array.from(new Set(schools));
  }, [reportData]);

  // Filter logic
  useEffect(() => {
    let data = [...reportData];

    if (selectedSchool !== "all") {
      data = data.filter((r) => r.school === selectedSchool);
    }

    if (selectedStatus === "have") {
      data = data.filter((r) => r.items && r.items.length > 0);
    } else if (selectedStatus === "no") {
      data = data.filter((r) => !r.items || r.items.length === 0);
    }

    setFilteredData(data);
    setCurrentPage(1); // Reset to first page on filter
  }, [selectedSchool, selectedStatus, reportData]);

  const totalPages = Math.ceil(filteredData.length / perPage);
  const paginated = filteredData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div>
      <h4 className="fw-bold mb-3">Sipariş Raporları</h4>

      <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
        <Form.Select
          size="sm"
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          style={{ minWidth: "200px" }}
        >
          <option value="all">Tüm Okullar</option>
          {uniqueSchools.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          size="sm"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ minWidth: "200px" }}
        >
          <option value="all">Hepsi</option>
          <option value="have">Sipariş Var</option>
          <option value="no">Sipariş Yok</option>
        </Form.Select>

        <Form.Select
          size="sm"
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          style={{ minWidth: "120px" }}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / Sayfa
            </option>
          ))}
        </Form.Select>

        <div className="text-muted small">
          Toplam <strong>{filteredData.length}</strong> kayıt
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>Öğrenci</th>
                <th>Alınan Ürünler</th>
                <th>Toplam Tutar</th>
                <th>Okul</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((r) => (
                  <tr key={r.id}>
                    <td>{r.student}</td>
                    <td>
                      {r.items?.length > 0 ? (
                        r.items.map((item, idx) => (
                          <div key={idx}>
                            {item.name} x {item.quantity}
                          </div>
                        ))
                      ) : (
                        <span className="text-muted">Sipariş Yok</span>
                      )}
                    </td>
                    <td>{r.total.toLocaleString()} ₺</td>
                    <td>{r.school}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-end">
              <Pagination>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminReportPage;
