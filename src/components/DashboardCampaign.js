import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Form, Pagination } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  useDeleteCampaignMutation,
  useGetAllCampaignsQuery,
} from "../services/appApi";
import AddCampaignModal from "./NewCampaignModal";
import EditCampaignModal from "./EditCampaignModal";

const UserBadgeList = ({ tcs = [], students = [] }) => {
  const [expanded, setExpanded] = useState(false);
  const maxVisible = 3;

  const visible = expanded ? tcs : tcs.slice(0, maxVisible);

  return (
    <div className="d-flex flex-wrap gap-1">
      {visible.map((tc) => {
        const student = students.find((s) => s.Ogrenci_TC === tc);
        return (
          <span key={tc} className="badge bg-secondary text-light p-1 px-2">
            {student ? `${student.Ad} (${tc})` : tc}
          </span>
        );
      })}
      {tcs.length > maxVisible && (
        <span
          className="badge bg-info text-dark p-1 px-2"
          role="button"
          style={{ cursor: "pointer" }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Daha Az" : "Daha Fazla"}
        </span>
      )}
    </div>
  );
};

function DashboardCampaigns() {
  const dispatch = useDispatch();
  const campaigns = useSelector((state) => state.campaigns || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [campaignsPerPage, setCampaignsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [deleteCampaign, { isLoading }] = useDeleteCampaignMutation();

  const [studentsData, setStudentsData] = useState([]);

  useEffect(() => {
    fetch("/students_parents.json")
      .then((res) => res.json())
      .then((data) => setStudentsData(data))
      .catch((err) => console.error("Failed to load students data", err));
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesType = c.type
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || c.products?.includes(selectedCategory);
      return matchesType && matchesCategory;
    });
  }, [campaigns, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);
  const currentCampaigns = filteredCampaigns.slice(
    (currentPage - 1) * campaignsPerPage,
    currentPage * campaignsPerPage
  );
  console.log("TCL ~ DashboardCampaigns ~ currentCampaigns:", currentCampaigns);

  const uniqueCategories = useMemo(() => {
    return Array.from(
      new Set(
        campaigns
          .flatMap((c) => c.products || [])
          .filter((cat) => typeof cat === "string")
      )
    );
  }, [campaigns]);

  const handleDelete = (id) => {
    if (window.confirm("Silmek istediğinizden emin misiniz?")) {
      deleteCampaign(id);
    }
  };

  const renderPagination = () => (
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
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-4">
        <Form.Control
          type="search"
          placeholder="Tip ile ara..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{ maxWidth: "300px" }}
        />

        <div className="d-flex flex-wrap gap-3 align-items-center">
          <Form.Select
            size="sm"
            value={campaignsPerPage}
            onChange={(e) => {
              setCampaignsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ minWidth: "120px" }}
          >
            {[5, 10, 20].map((num) => (
              <option key={num} value={num}>
                {num} / Sayfa
              </option>
            ))}
          </Form.Select>

          <Form.Select
            size="sm"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            style={{ minWidth: "200px" }}
          >
            <option value="">Tüm Kategoriler</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>

          <div className="text-muted small">
            Toplam <strong>{filteredCampaigns.length}</strong> kampanya
          </div>

          <Button variant="success" onClick={() => setShowAddModal(true)}>
            <i className="fa fa-plus me-1" /> Kampanya Ekle
          </Button>
        </div>
      </div>

      <Table
        striped
        bordered
        hover
        responsive
        className="bg-white rounded shadow-sm"
      >
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Tip</th>
            <th>Miktar</th>
            <th>Başlangıç</th>
            <th>Bitiş</th>
            <th>Kategori</th>
            <th>Gift Items</th>
            <th>Kullanıcılar</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {currentCampaigns.length > 0 ? (
            currentCampaigns.map((c) => (
              <tr key={c._id}>
                <td>{c._id}</td>
                <td>{c.type === "percentage" ? "Yüzde" : "Tutar"}</td>
                <td>{c.amount}</td>
                <td>{c.start_Date}</td>
                <td>{c.end_date}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {(c.products || []).map((cat) => (
                      <span
                        key={cat}
                        className="badge bg-primary text-light p-1 px-2"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  {c?.subItems?.items
                    ? c?.subItems?.items?.map((val) => {
                        return (
                          <span className="badge bg-secondary text-light p-1 px-2">
                            {val.name}
                          </span>
                        );
                      })
                    : "Na"}
                </td>
                <td>
                  <UserBadgeList
                    tcs={c.selectedUsers}
                    students={studentsData}
                  />
                </td>
                <td className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => {
                      setSelectedCampaignId(c._id);
                      setShowEditModal(true);
                    }}
                  >
                    Düzenle
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(c._id)}
                    disabled={isLoading}
                  >
                    Sil
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center text-muted py-3">
                Hiç kampanya bulunamadı.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-end">{renderPagination()}</div>

      <AddCampaignModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
      />
      <EditCampaignModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        campaignId={selectedCampaignId}
      />
    </div>
  );
}

export default DashboardCampaigns;
