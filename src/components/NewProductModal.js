// same imports...
import React, { useState, useMemo, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "../axios";
import { useSelector } from "react-redux";
import { useCreateProductMutation } from "../services/appApi";

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
function AddProductModal({ show, handleClose }) {
  const products = useSelector((state) => state.products || []);
  const categoryTypes = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category)))
        .filter((v) => v && v.trim())
        .sort(),
    [products]
  );

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    sizes: [],
    class: [],
    images: [],
  });
  const [customCategory, setCustomCategory] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [hasSize, setHasSize] = useState(false);
  const [hasClass, setHasClass] = useState(false);
  const [imgToRemove, setImgToRemove] = useState(null);
  const [createProduct, { isLoading, isSuccess, isError, error }] =
    useCreateProductMutation();

  const handleClosing = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      sizes: [],
      class: [],
      images: [],
    });
    setUseCustomCategory(false);
    setCustomCategory("");
    setHasClass(false);
    setHasSize(false);
    handleClose();
  };

  const handleInput = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
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
    const {
      name,
      description,
      price,
      category,
      images,
      sizes,
      class: selectedClasses,
    } = form;

    const finalCategory = useCustomCategory ? customCategory : category;

    if (!name || !description || !price || !finalCategory || !images.length) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      name,
      description,
      price,
      category: finalCategory,
      sizes: hasSize ? sizes : [],
      classNo: hasClass ? selectedClasses : [],
      images,
      hasClass,
      hasSize,
    };

    createProduct(payload).then(({ data }) => {
      if (data.length > 0) {
        handleClosing();
      }
    });
  };

  const isClothing = form.category.toLowerCase().includes("t-shirt");
  const isBook = form.category.toLowerCase() === "books";
  const showSizeInput = isClothing || hasSize;
  const showClassInput = isBook || hasClass;
  useEffect(() => {
    const finalCategory = useCustomCategory ? customCategory : form.category;

    if (!finalCategory) return;

    const matchedProduct = products.find(
      (p) => p.category?.toLowerCase() === finalCategory.toLowerCase()
    );

    if (matchedProduct) {
      if (
        (matchedProduct.class && matchedProduct.class.length > 0) ||
        matchedProduct.hasClass
      ) {
        setHasClass(true);
        setForm((prev) => ({
          ...prev,
          class: matchedProduct.classNo || [],
        }));
      }

      if (
        (matchedProduct.sizes && matchedProduct.sizes.length > 0) ||
        matchedProduct.hasSize
      ) {
        setHasSize(true);
        setForm((prev) => ({
          ...prev,
          sizes: matchedProduct.sizes || [],
        }));
      }
    }
  }, [form.category, customCategory, useCustomCategory, products]);

  return (
    <Modal show={show} onHide={handleClosing} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Ürün Ekle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {isSuccess && <Alert variant="success">Ürün oluşturuldu!</Alert>}
          {isError && <Alert variant="danger">{error.data}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Ürün Adı</Form.Label>
            <Form.Control
              value={form.name}
              onChange={handleInput("name")}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Açıklama</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.description}
              onChange={handleInput("description")}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fiyat</Form.Label>
            <Form.Control
              type="number"
              value={form.price}
              onChange={handleInput("price")}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Kategori</Form.Label>
            <Form.Select
              value={form.category}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "__other__") {
                  setUseCustomCategory(true);
                  setForm((prev) => ({ ...prev, category: "" }));
                } else {
                  setUseCustomCategory(false);
                  setForm((prev) => ({ ...prev, category: value }));
                  setHasClass(false);
                  setHasSize(false);
                }
              }}
              required={!useCustomCategory}
            >
              <option value="">-- Seçiniz --</option>
              {categoryTypes.map((type) => (
                <option value={type} key={type}>
                  {type}
                </option>
              ))}
              <option value="__other__">Diğer (Specify Manually)</option>
            </Form.Select>

            {useCustomCategory && (
              <>
                <Form.Control
                  className="mt-2"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
                <Form.Check
                  type="checkbox"
                  label="Beden?"
                  className="mt-2"
                  checked={hasSize}
                  onChange={() => {
                    setHasSize((prev) => !prev);
                    if (!hasSize) {
                      setHasClass(false);
                      setForm((prev) => ({ ...prev, class: [] }));
                    }
                  }}
                />
                <Form.Check
                  type="checkbox"
                  label="Sınıf?"
                  checked={hasClass}
                  onChange={() => {
                    setHasClass((prev) => !prev);
                    if (!hasClass) {
                      setHasSize(false);
                      setForm((prev) => ({ ...prev, sizes: [] }));
                    }
                  }}
                />
              </>
            )}
          </Form.Group>

          {showSizeInput && (
            <Form.Group className="mb-3">
              <Form.Label>Beden</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <Form.Check
                    key={size}
                    inline
                    label={size}
                    type="checkbox"
                    id={`size-${size}`}
                    checked={form.sizes.includes(size)}
                    onChange={() => {
                      setForm((prev) => {
                        const already = prev.sizes.includes(size);
                        return {
                          ...prev,
                          sizes: already
                            ? prev.sizes.filter((s) => s !== size)
                            : [...prev.sizes, size],
                        };
                      });
                    }}
                  />
                ))}
              </div>
            </Form.Group>
          )}
          {/* {showClassInput && (
            <Form.Group className="mb-3">
              <Form.Label>Sınıf</Form.Label>
              <Form.Select
                value={form.class || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    class: e.target.value,
                  }))
                }
              >
                <option value="">Sınıf Seçiniz</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )} */}
          {showClassInput && (
            <Form.Group className="mb-3">
              <Form.Label>Sınıf</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {classOptions.map((cls) => (
                  <Form.Check
                    key={cls}
                    inline
                    label={cls}
                    type="checkbox"
                    id={`class-${cls}`}
                    checked={form.class.includes(cls)}
                    onChange={() => {
                      setForm((prev) => {
                        const already = prev.class.includes(cls);
                        return {
                          ...prev,
                          class: already
                            ? prev.class.filter((c) => c !== cls)
                            : [...prev.class, cls],
                        };
                      });
                    }}
                  />
                ))}
              </div>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Button type="button" onClick={handleUpload}>
              Resim Yükle
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
            Ürün Ekle
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddProductModal;
