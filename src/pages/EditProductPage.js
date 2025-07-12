import React, { useEffect, useState } from "react";
import { Alert, Col, Container, Form, Row, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useUpdateProductMutation } from "../services/appApi";
import axios from "../axios";
import "./NewProduct.css";

const sizeOptions = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const classOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const categoryTypes = ["Bisiklet Yaka Kısakol T-Shirt", "Books"];

function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    axios
      .get("/products/" + id)
      .then(({ data }) => {
        const p = data.product;
        setName(p.name || "");
        setDescription(p.description || "");
        setPrice(p.price || "");
        setCategory(p.category || "");
        setSizes(p.sizes || []);
        setClassNo(p.class || p.classNo || []);
        setImages(p.pictures || []);
      })
      .catch((e) => console.log(e));
  }, [id]);

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
      .catch((e) => console.log(e));
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
      id,
      name,
      description,
      price,
      category,
      sizes,
      classNo,
      pictures: images,
    };

    updateProduct(payload).then(({ data }) => {
      if (data) {
        setTimeout(() => navigate("/"), 1000);
      }
    });
  }

  return (
    <Container>
      <Row>
        <Col md={6} className="new-product__form--container">
          <Form onSubmit={handleSubmit}>
            <h1 className="mt-4">Edit product</h1>
            {isSuccess && <Alert variant="success">Product updated</Alert>}
            {isError && <Alert variant="danger">{error.data}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>Product name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                style={{ height: "100px" }}
                value={description}
                required
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={price}
                required
                onChange={(e) => setPrice(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">-- Select One --</option>
                {categoryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {category === "Bisiklet Yaka Kısakol T-Shirt" && (
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

            {category === "Books" && (
              <Form.Group className="mb-3">
                <Form.Label>Class No</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {classOptions.map((c) => (
                    <Form.Check
                      key={c}
                      inline
                      label={c}
                      type="checkbox"
                      checked={classNo.includes(String(c))}
                      onChange={() =>
                        setClassNo((prev) => {
                          const val = String(c);
                          return prev.includes(val)
                            ? prev.filter((x) => x !== val)
                            : [...prev, val];
                        })
                      }
                    />
                  ))}
                </div>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Button type="button" onClick={showWidget}>
                Upload Images
              </Button>
              <div className="images-preview-container mt-2">
                {images.map((img) => (
                  <div key={img.public_id} className="image-preview">
                    <img src={img.url} alt="" />
                    {imgToRemove !== img.public_id && (
                      <i
                        className="fa fa-times-circle"
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
        </Col>
        {/* <Col md={6} className="new-product__image--container" /> */}
      </Row>
    </Container>
  );
}

export default EditProductPage;
