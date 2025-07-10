import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "../axios";
import { useCreateProductMutation } from "../services/appApi";

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];
const ageOptions = ["11", "11-12", "11-14", "15"];
const categoryTypes = [
  "clothing",
  "books",
  "technology",
  "phones",
  "laptops",
  "tablets",
];

function AddProductModal({ show, handleClose }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sizes: [],
    age: [],
    images: [],
  });
  const [imgToRemove, setImgToRemove] = useState(null);
  const [createProduct, { isLoading, isSuccess, isError, error }] =
    useCreateProductMutation();

  const handleInput = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field) => (e) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setForm((prev) => ({ ...prev, [field]: selected }));
  };

  const handleUpload = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dqwgndidy",
        uploadPreset: "ml_default",
      },
      (error, result) => {
        if (!error && result.event === "success") {
          setForm((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              { url: result.info.url, public_id: result.info.public_id },
            ],
          }));
        }
      }
    );
    widget.open();
  };

  const handleRemoveImg = (img) => {
    setImgToRemove(img.public_id);
    axios
      .delete(`/images/${img.public_id}/`)
      .then(() => {
        setImgToRemove(null);
        setForm((prev) => ({
          ...prev,
          images: prev.images.filter((i) => i.public_id !== img.public_id),
        }));
      })
      .catch(console.error);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, description, price, category, images } = form;
    if (!name || !description || !price || !category || !images.length) {
      alert("Please fill all required fields");
      return;
    }

    createProduct(form).then(({ data }) => {
      if (data.length > 0) {
        handleClose();
      }
    });
  };

  const isClothing = form.category === "clothing";

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {isSuccess && <Alert variant="success">Product created!</Alert>}
          {isError && <Alert variant="danger">{error.data}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              value={form.name}
              onChange={handleInput("name")}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.description}
              onChange={handleInput("description")}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control
              type="number"
              value={form.price}
              onChange={handleInput("price")}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Product Type</Form.Label>
            <Form.Select
              value={form.category}
              onChange={handleInput("category")}
              required
            >
              <option value="">-- Select Type --</option>
              {categoryTypes.map((type) => (
                <option value={type} key={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {isClothing && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Sizes (multiple)</Form.Label>
                <Form.Select multiple onChange={handleMultiSelect("sizes")}>
                  {sizeOptions.map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ages (multiple)</Form.Label>
                <Form.Select multiple onChange={handleMultiSelect("age")}>
                  {ageOptions.map((age) => (
                    <option key={age}>{age}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3">
            <Button type="button" onClick={handleUpload}>
              Upload Images
            </Button>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {form.images.map((img) => (
                <div key={img.public_id} className="position-relative">
                  <img
                    src={img.url}
                    alt=""
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                  {imgToRemove !== img.public_id && (
                    <i
                      className="fa fa-times-circle text-danger position-absolute top-0 end-0"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRemoveImg(img)}
                    ></i>
                  )}
                </div>
              ))}
            </div>
          </Form.Group>

          <Button type="submit" disabled={isLoading}>
            Create Product
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddProductModal;
