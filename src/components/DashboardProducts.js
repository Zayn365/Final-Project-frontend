import React, { useState, useMemo } from "react";
import { Table, Button, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useDeleteProductMutation } from "../services/appApi";
import "./DashboardProducts.css";
import AddProductModal from "../components/NewProductModal";

function DashboardProducts() {
  const products = useSelector((state) => state.products);
  const user = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletProduct, { isLoading }] = useDeleteProductMutation();
  const [showAddModal, setShowAddModal] = useState(false);

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
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <div className="d-flex gap-2 align-items-center">
          <div className="text-muted small">
            Showing {filteredProducts.length} result(s)
          </div>
          <Button variant="success" onClick={() => setShowAddModal(true)}>
            <i className="fa fa-plus"></i> Add Product
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
            <th>Image</th>
            <th>Product ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Sizes</th>
            <th>Age</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(
            ({ pictures, _id, name, price, sizes, age, category }) => (
              <tr key={_id}>
                <td>
                  <img
                    src={pictures[0]?.url}
                    className="dashboard-product-preview"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "contain",
                    }}
                    alt="preview"
                  />
                </td>
                <td>{_id}</td>
                <td>{name}</td>
                <td>{category}</td>
                <td>{price}</td>
                <td>{(sizes || []).join(", ")}</td>
                <td>{(age || []).join(", ")}</td>
                <td className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleDeleteProduct(_id)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                  <Link
                    to={`/product/${_id}/edit`}
                    className="btn btn-warning btn-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            )
          )}
        </tbody>
      </Table>

      <AddProductModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
      />
    </div>
  );
}

export default DashboardProducts;
