import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAddToCartMutation } from "../services/appApi";
import ToastMessage from "./ToastMessage";
import { useSelector } from "react-redux";

function ProductPreview({ _id, category, name, pictures, price }) {
  const navigate = useNavigate();
  const [addToCart, { isSuccess }] = useAddToCartMutation();
  const user = useSelector((state) => state.user);
  const [showLoginToast, setShowLoginToast] = useState(false);

  const handleAddToCart = () => {
    if (!user) {
      setShowLoginToast(true);
      setTimeout(() => setShowLoginToast(false), 3000); // hide after 3s
      return;
    } else {
      addToCart({
        userId: user._id,
        productId: _id,
        price: price,
        image: pictures[0].url,
      });
    }
  };

  return (
    <div>
      {isSuccess && (
        <ToastMessage
          bg="success"
          title="Sepete Eklendi"
          body={`${name} sepetinize eklendi`}
        />
      )}

      {showLoginToast && (
        <ToastMessage
          bg="danger"
          title="Giriş Gerekli"
          body="Ürün eklemek için giriş yapmalısınız"
        />
      )}

      <Card
        className="rounded p-3 d-flex flex-column justify-content-between"
        style={{
          width: "16rem",
          margin: "10px",
          textAlign: "center",
          minHeight: "420px",
        }}
      >
        <Card.Img
          variant="top"
          src={pictures[0].url}
          style={{ height: "220px", objectFit: "contain" }}
        />

        <Card.Body className="d-flex flex-column justify-content-between p-2">
          <div>
            <Card.Text className="h6 text-danger mb-1">Rs.{price}</Card.Text>

            <Card.Title
              className="fw-bold"
              style={{
                fontSize: "15px",
                minHeight: "40px",
                maxHeight: "40px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
              title={name}
            >
              {name}
            </Card.Title>

            <Card.Text className="text-uppercase text-muted small mb-3">
              {category.slice(0, 20)}
            </Card.Text>
          </div>

          <div>
            <Button
              variant="danger"
              className="w-100 mb-2"
              onClick={() => navigate(`/category/all`)}
            >
              Show More{" "}
            </Button>
            <Button
              variant="light"
              className="w-100 border"
              onClick={() => navigate(`/product/${_id}`)}
            >
              Quick view
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ProductPreview;
