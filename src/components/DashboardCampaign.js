import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Form, Pagination } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  useDeleteCampaignMutation,
  useGetAllCampaignsQuery,
} from "../services/appApi";
import AddCampaignModal from "./NewCampaignModal";
import EditCampaignModal from "./EditCampaignModal";

function DashboardCampaigns() {
  const campaigns = useSelector((state) => state.campaigns || []);
  // const products = useSelector((state) => state.products || []);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteCampaign, { isLoading }] = useDeleteCampaignMutation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [campaignsPerPage, setCampaignsPerPage] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredCampaigns = useMemo(() => {
    return (
      campaigns.length > 0 &&
      campaigns.filter((c) => {
        const matchesType = c.type
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesCategory =
          !selectedCategory || c.products?.includes(selectedCategory);
        return matchesType && matchesCategory;
      })
    );
  }, [campaigns, searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);
  const currentCampaigns =
    filteredCampaigns.length > 0 &&
    filteredCampaigns.slice(
      (currentPage - 1) * campaignsPerPage,
      currentPage * campaignsPerPage
    );

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

  const handleDelete = (id) => {
    if (window.confirm("Silmek istediğinizden emin misiniz?")) {
      deleteCampaign(id);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-5">
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
        <div className="d-flex flex-wrap gap-3 align-items-center justify-content-end mb-3">
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
            {(campaigns || [])
              .flatMap((c) => c.products || [])
              .filter((val, index, self) => val && self.indexOf(val) === index)
              .map((category) => (
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
            <th>Kampanya</th>
            <th>Kullanıcı</th> {/* ← Başlık Türkçe olarak "Kullanıcı" */}
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {currentCampaigns.length > 0 &&
            currentCampaigns.map((c) => (
              <tr key={c._id}>
                <td>{c._id}</td>
                <td>{c.type === "percentage" ? "Yüzde" : "Tutar"}</td>
                <td>{c.amount}</td>
                <td>{c.start_Date}</td>
                <td>{c.end_date}</td>
                <td>
                  <div className="d-flex flex-wrap gap-2">
                    {(c.products || []).map((category) => (
                      <span
                        key={category}
                        className="badge bg-primary text-light p-2"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{c.selectedUser || "-"}</td>
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
            ))}
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
