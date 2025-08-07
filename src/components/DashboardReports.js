import React, { useEffect, useState } from "react";
import axios from "../axios";
import { Form, Table, Spinner } from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

  const exportToExcel = () => {
    // Prepare a simplified data array
    const dataToExport = filteredData.map((row) => ({
      Öğrenci: row.student || "Bilinmiyor",
      "Alınan Ürünler": row.items?.length
        ? row.items.map((item) => `${item.quantity} x ${item.name}`).join(", ")
        : "Sipariş Yok",
      "Toplam Tutar": (row.total || 0).toLocaleString("tr-TR") + " ₺",
      Okul: row.school || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapor");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "Siparis_Raporu.xlsx");
  };
  const fetchData = async () => {
    try {
      setLoading(true);

      const [ordersRes, studentsRes] = await Promise.all([
        axios.get("/report/orders"),
        fetch("/students_parents.json").then((r) => r.json()),
      ]);

      const orders = ordersRes.data || [];
      const students = studentsRes || [];

      const orderMap = {};
      for (const order of orders) {
        orderMap[order.tc_id] = order;
      }

      const mergedData = students.map((student) => {
        const order = orderMap[student.Ogrenci_TC];
        return {
          student: student["Öğrenci_Adı"] || "Bilinmiyor",
          school: student.Okul || "-",
          items: order?.items || [],
          total: order?.total || 0,
          studentPersonalID: student.Ogrenci_TC,
        };
      });

      // 🔽 Show ordered students first
      mergedData.sort((a, b) => (b.total || 0) - (a.total || 0));

      const schools = [
        ...new Set(mergedData.map((s) => s.school).filter(Boolean)),
      ];
      setSchoolOptions(schools);
      setReportData(mergedData);
      setFilteredData(mergedData);
    } catch (err) {
      console.error("Error loading report:", err);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="mb-3 d-flex justify-content-end">
        <button className="btn btn-success" onClick={exportToExcel}>
          Excel Olarak İndir
        </button>
      </div>
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
                      ? row.items
                          .map(
                            (item, index) =>
                              `${item.quantity} x ${item.name}${
                                index < row.items.length - 1 ? ", " : ""
                              }`
                          )
                          .join("")
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
        <div
          className="d-flex gap-2 mt-3 px-2"
          style={{
            overflowX: "auto",
            whiteSpace: "nowrap",
            scrollbarWidth: "thin",
          }}
        >
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              className={`btn btn-sm me-2 ${
                currentPage === idx + 1 ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setCurrentPage(idx + 1)}
              style={{ minWidth: "40px" }}
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
