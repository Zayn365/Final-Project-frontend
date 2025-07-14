import React, { useState, useMemo } from "react";
import { Table, Button, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useDeleteProductMutation } from "../services/appApi";
import "./DashboardProducts.css";
import AddProductModal from "../components/NewProductModal";
import EditProductModal from "../components/EditProductModal"; // <-- Import here

function DashboardProducts() {
  const products = useSelector((state) => state.products);
  const user = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletProduct, { isLoading }] = useDeleteProductMutation();
  const [showAddModal, setShowAddModal] = useState(false);

  // 🆕 Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  function handleDeleteProduct(id) {
    if (window.confirm("Are you sure?"))
      deletProduct({ product_id: id, user_id: user._id });
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <div>
      {/* Search & Tools */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <Form.Control
          type="search"
          placeholder="İsimle Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <div className="d-flex gap-2 align-items-center">
          <div className="text-muted small">
            {filteredProducts.length} sonuç gösteriliyor
          </div>
          <Button variant="success" onClick={() => setShowAddModal(true)}>
            <i className="fa fa-plus"></i> Ürün Ekle
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
          {filteredProducts.map((data) => (
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
              <td>{data.price}</td>
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
