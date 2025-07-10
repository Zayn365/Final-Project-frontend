// pages/SubCategoryPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../axios";
import { Container, Row, Col } from "react-bootstrap";

export default function SubCategoryPage() {
  const { mainCategory } = useParams();
  const [grouped, setGrouped] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/products?mainCategory=${mainCategory}`).then(({ data }) => {
      const group = {};
      data.products.forEach((p) => {
        if (!group[p.category]) group[p.category] = [];
        group[p.category].push(p);
      });
      setGrouped(group);
    });
  }, [mainCategory]);

  return (
    <Container>
      <h2 className="my-4 text-capitalize">{mainCategory}</h2>
      {Object.entries(grouped).map(([subCat, products]) => (
        <div key={subCat}>
          <h4 className="text-danger mt-4">{subCat}</h4>
          <Row>
            {products.map((product) => (
              <Col md={3} className="mb-4" key={product._id}>
                <div
                  className="border p-3 text-center"
                  onClick={() => navigate(`/product/${product._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={product.pictures[0].url}
                    className="img-fluid mb-2"
                  />
                  <div>{product.name}</div>
                  <strong>{product.price} TL</strong>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </Container>
  );
}
