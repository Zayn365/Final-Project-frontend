import React, { useState, useMemo } from "react";
import { Table, Button, Form, Pagination } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useDeleteProductMutation } from "../services/appApi";
import "./DashboardProducts.css";
import AddProductModal from "../components/NewProductModal";
import EditProductModal from "../components/EditProductModal";
import { formatWithCommas, unformatNumber } from "../hooks/formatFuctions";

function DashboardProducts() {
  const products = useSelector((state) => state.products);
  const user = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletProduct, { isLoading }] = useDeleteProductMutation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [filteredCategory, setFilterCategory] = useState("");
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const categoryOptions = useMemo(() => {
    const cats = Array.from(
      new Set(
        products
          .map((p) => p.category)
          .filter(Boolean) // drop null/undefined/empty
          .map((c) => c.trim())
      )
    );
    return cats.sort((a, b) => a.localeCompare(b, "tr")); // optional Turkish sort
  }, [products]);
  function handleDeleteProduct(id) {
    if (window.confirm("Are you sure?"))
      deletProduct({ product_id: id, user_id: user._id });
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory = filteredCategory
        ? product.category?.toLowerCase() === filteredCategory.toLowerCase()
        : true;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filteredCategory]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const renderPagination = () => {
    const pages = [];

    for (let page = 1; page <= totalPages; page++) {
      pages.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    return <Pagination>{pages}</Pagination>;
  };

  return (
    <div>
      {/* Search & Tools */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-5">
        <Form.Control
          type="search"
          placeholder="İsimle Ara..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          style={{ maxWidth: "300px" }}
        />
        <div className="d-flex flex-wrap gap-3 align-items-center justify-content-end mb-3">
          <Form.Select
            size="sm"
            value={productsPerPage}
            onChange={(e) => {
              setProductsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ minWidth: "120px" }}
          >
            {[5, 10, 20, 50].map((num) => (
              <option key={num} value={num}>
                {num} / Sayfa
              </option>
            ))}
          </Form.Select>
          <Form.Select
            value={filteredCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">{/* placeholder */}Kategori Seçin</option>
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
          <div className="text-muted small">
            Toplam <strong>{filteredProducts.length}</strong> ürün
          </div>

          <Button variant="success" onClick={() => setShowAddModal(true)}>
            <i className="fa fa-plus me-1"></i> Ürün Ekle
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        striped
        bordered
        hover
        responsive
        className="bg-white rounded shadow-sm"
      >
        <thead className="table-light">
          <tr>
            <th>Görsel</th>
            <th>Ürün No</th>
            <th>İsim</th>
            <th>Kategori</th>
            <th>Fiyat</th>
            <th>Bedenler</th>
            <th>Sınıf</th>
            <th>İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((data) => (
            <tr key={data._id}>
              <td>
                <img
                  src={data.pictures[0]?.url}
                  className="dashboard-product-preview"
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "contain",
                  }}
                  alt="preview"
                />
              </td>
              <td>{data._id}</td>
              <td>{data.name}</td>
              <td>{data.category}</td>
              <td>{formatWithCommas(unformatNumber(String(data.price)))}</td>
              <td>{(data.sizes || ["N/A"]).join(", ")}</td>
              <td>{(data.class || data.classNo || ["N/A"]).join(", ")}</td>
              <td className="d-flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleDeleteProduct(data._id)}
                  disabled={isLoading}
                >
                  Sil
                </Button>
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => {
                    setSelectedProductId(data._id);
                    setShowEditModal(true);
                  }}
                >
                  Düzenle
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex justify-content-end">{renderPagination()}</div>

      {/* Add Modal */}
      <AddProductModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
      />

      {/* Edit Modal */}
      <EditProductModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        productId={selectedProductId}
      />
    </div>
  );
}

export default DashboardProducts;
