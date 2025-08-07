import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useUpdateProductMutation } from "../services/appApi";
import axios from "../axios";
import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

const sizeOptions = [
  "5-6",
  "7-8",
  "9-10",
  "11-12",
  "13-14",
  "15-16",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
];
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
  const [updateProduct, { isError, error, isLoading, isSuccess, reset }] =
    useUpdateProductMutation();
  const products = useSelector((state) => state.products || []);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [sizes, setSizes] = useState([]);
  const [classNo, setClassNo] = useState([]);
  const [images, setImages] = useState([]);
  const [imgToRemove, setImgToRemove] = useState(null);
  const [hasSize, setHasSize] = useState(false);
  const [stock, setStock] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  // const navigation = useNavigate();
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
        setStock(p.stock || 0);
      })
      .catch(console.error);
  }, [productId]);
  useEffect(() => {
    const mapSınıfToCategory = (cls) => {
      const match = cls.match(/\d+/);
      if (!match) return null;

      const num = parseInt(match[0]);

      if (category !== "Eğitim Seti" || category !== "Kırtasiye Seti") {
        if ([1, 2, 3, 4].includes(num)) return "İlkokul Kıyafet";
        if ([5, 6, 7, 8].includes(num)) return "Ortaokul Kıyafet";
        if ([9, 10, 11, 12].includes(num)) return "Lise Kıyafet";
        return null;
      }
    };

    if (classNo.length > 0) {
      const inferred = classNo.map(mapSınıfToCategory).filter(Boolean);
      if (inferred.length > 0) {
        const selectedCategory = inferred[0]; // use first match
        setCategory((prev) => {
          // Only overwrite if category was one of the inferred types or empty
          const kıyafetler = [
            "İlkokul Kıyafet",
            "Ortaokul Kıyafet",
            "Lise Kıyafet",
          ];
          if (!prev || kıyafetler.includes(prev)) {
            return selectedCategory;
          }
          return prev;
        });
      }
    }
  }, [classNo]);

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
        cloudName: "dqwgndidy",
        uploadPreset: "ml_default",
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

  // function resetAndClose() {
  //   setName("");
  //   setDescription("");
  //   setPrice("");
  //   setCategory("");
  //   setSizes([]);
  //   setClassNo([]);
  //   setImages([]);
  //   setImgToRemove(null);
  //   setHasSize(false);
  //   handleClose();
  // }

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
      classNo,
      images,
      hasClass: true,
      hasSize,
      stock: Number(stock), // add this
    };

    updateProduct(payload).then(({ data }) => {
      if (data) {
        handleClose();
        reset();
        // navigation("/admin");
        // window.location.reload();
      }
    });
  }
  useEffect(() => {
    if (isSuccess || isError) {
      const timer = setTimeout(() => {
        reset();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, isError, reset]);
  const categoryTypes = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category)))
        .filter((v) => v && v.trim())
        .sort(),
    [products]
  );
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
            <Form.Label>Stok Adedi</Form.Label>
            <Form.Control
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Kategori</Form.Label>
            <Form.Select
              value={category}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "__other__") {
                  setUseCustomCategory(true);
                  setCategory(category);
                } else {
                  setUseCustomCategory(false);
                  setCategory(value);
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
              <option value="__other__">Diğer (Manuel Kategori)</option>
            </Form.Select>
          </Form.Group>

          <Form.Check
            type="checkbox"
            className="mb-3"
            label="Beden?"
            checked={hasSize}
            onChange={() => setHasSize((prev) => !prev)}
          />

          {hasSize && (
            <Form.Group className="mb-3">
              <Form.Label>Beden</Form.Label>
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

          <Form.Group className="mb-3">
            <Form.Label>Sınıf</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {classOptions.map((cls) => (
                <Form.Check
                  key={cls}
                  inline
                  label={cls}
                  type="checkbox"
                  checked={classNo.includes(cls)}
                  onChange={() => {
                    setClassNo((prev) =>
                      prev.includes(cls)
                        ? prev.filter((c) => c !== cls)
                        : [...prev, cls]
                    );
                  }}
                />
              ))}
            </div>
          </Form.Group>

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
            Ürünü Güncelle
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditProductModal;
