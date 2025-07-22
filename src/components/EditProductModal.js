import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useUpdateProductMutation } from "../services/appApi";
import axios from "../axios";

const sizeOptions = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const classOptions = [
  "3 YAŞ",
  "4 YAŞ",
  "5 YAŞ",
  "1.Sınıf",
  "2.SINIF",
  "3 .Sınıf",
  "4 .Sınıf",
  "5.Sınıf",
  "6.Sınıf",
  "7.Sınıf",
  "8.SINIF",
  "ANADOLU 9.SINIF",
  "ANADOLU 10.SINIF",
  "ANADOLU 11.SINIF EA",
  "ANADOLU 11.SINIF SAY.",
  "ANADOLU 12. SINIF SAY.",
  "ANADOLU 12.SINIF EA",
  "FEN 9.SINIF",
  "FEN 10.SINIF",
  "FEN 11.SINIF SAY.",
  "FEN 12. SINIF SAY.",
];
function EditProductModal({ show, handleClose, productId }) {
  const [updateProduct, { isError, error, isLoading, isSuccess }] =
    useUpdateProductMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState([]);
  const [classNo, setClassNo] = useState([]);
  const [images, setImages] = useState([]);
  const [imgToRemove, setImgToRemove] = useState(null);
  const [hasSize, setHasSize] = useState(false);
  const [hasClass, setHasClass] = useState(false);

  useEffect(() => {
    if (!productId) return;
    axios
      .get("/products/" + productId)
      .then(({ data }) => {
        const p = data.product;
        setName(p.name || "");
        setDescription(p.description || "");
        setPrice(p.price || "");
        setCategory(p.category || "");
        setSizes(p.sizes || []);
        setClassNo(p.class || p.classNo || []);
        setImages(p.pictures || []);
        setHasSize((p.sizes || []).length > 0);
        setHasClass((p.class || p.classNo || []).length > 0);
      })
      .catch(console.error);
  }, [productId]);

  const isBook = category.toLowerCase() === "books";
  const isClothing = category.toLowerCase().includes("t-shirt");

  const showSizes = isClothing || hasSize;
  const showClasses = isBook || hasClass;

  function handleRemoveImg(imgObj) {
    setImgToRemove(imgObj.public_id);
    axios
      .delete(`/images/${imgObj.public_id}/`)
      .then(() => {
        setImgToRemove(null);
        setImages((prev) =>
          prev.filter((img) => img.public_id !== imgObj.public_id)
        );
      })
      .catch(console.error);
  }

  function showWidget() {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "your-cloudname",
        uploadPreset: "your-preset",
      },
      (error, result) => {
        if (!error && result.event === "success") {
          setImages((prev) => [
            ...prev,
            {
              url: result.info.url,
              public_id: result.info.public_id,
            },
          ]);
        }
      }
    );
    widget.open();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !description || !price || !category || !images.length) {
      return alert("Please fill out all the fields");
    }

    const payload = {
      id: productId,
      name,
      description,
      price,
      category,
      sizes: hasSize ? sizes : [],
      classNo: hasClass ? classNo : [],
      pictures: images,
    };

    updateProduct(payload).then(({ data }) => {
      if (data) {
        handleClose();
        window.location.reload();
      }
    });
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Ürün Düzenle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {isSuccess && <Alert variant="success">Product updated</Alert>}
          {isError && <Alert variant="danger">{error.data}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Ürün Adı</Form.Label>
            <Form.Control
              type="text"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Açıklama</Form.Label>
            <Form.Control
              as="textarea"
              style={{ height: "100px" }}
              value={description}
              required
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fiyat</Form.Label>
            <Form.Control
              type="number"
              value={price}
              required
              onChange={(e) => setPrice(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Kategori</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter or edit category"
              value={category}
              required
              onChange={(e) => setCategory(e.target.value)}
            />
          </Form.Group>

          {!isBook && !isClothing && (
            <div className="d-flex gap-4 mb-3">
              <Form.Check
                type="checkbox"
                label="Beden?"
                checked={hasSize}
                onChange={() => setHasSize((prev) => !prev)}
              />
              <Form.Check
                type="checkbox"
                label="Sinif?"
                checked={hasClass}
                onChange={() => setHasClass((prev) => !prev)}
              />
            </div>
          )}

          {showSizes && (
            <Form.Group className="mb-3">
              <Form.Label>Sizes</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {sizeOptions.map((s) => (
                  <Form.Check
                    key={s}
                    inline
                    label={s}
                    type="checkbox"
                    checked={sizes.includes(s)}
                    onChange={() =>
                      setSizes((prev) =>
                        prev.includes(s)
                          ? prev.filter((x) => x !== s)
                          : [...prev, s]
                      )
                    }
                  />
                ))}
              </div>
            </Form.Group>
          )}
          {showClasses && (
            <Form.Group className="mb-3">
              <Form.Label>Class No</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {classOptions.map((cls) => (
                  <Form.Check
                    key={cls}
                    inline
                    label={cls}
                    type="checkbox"
                    id={`class-${cls}`}
                    checked={classNo[0] === cls}
                    onChange={() =>
                      setClassNo(
                        (prev) => (prev[0] === cls ? [] : [cls]) // deselect if clicked again
                      )
                    }
                  />
                ))}
              </div>
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Button type="button" onClick={showWidget}>
              Resim Yükle
            </Button>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {images.map((img) => (
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

          <Button type="submit" disabled={isLoading || isSuccess}>
            Update Product
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditProductModal;
