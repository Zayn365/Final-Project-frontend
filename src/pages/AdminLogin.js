import React, { useState } from "react";
import { Button, Col, Container, Form, Row, Alert } from "react-bootstrap";
import { useLoginMutation } from "../services/appApi";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isError, isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();
  function goBack() {
    navigate("/admin");
  }
  function handleLogin(e) {
    e.preventDefault();
    const details = login({ email, password });
    console.log(details.isAdmin);
    if(details.isAdmin === true) {
        return details;
    }
    else {
        alert("Username or Password Incorrect!")
    }
    goBack();
  }
  return (
    <div>
      <Container className="mt-5 mb-5 border w-50 ">
        {isError && <Alert variant="danger">{error.data}</Alert>}
        <h2 className="text-center">Admin User Login</h2>
        <Row className="m-0 p-4 d-flex justify-content-center">
          <Col md={6}>
            <Form onSubmit={handleLogin}>
              <Form.Group>
                <Form.Label>Admin Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Admin Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="danger"
                  size="sm"
                  className="mt-4"
                >
                  Login
                </Button>
              </Form.Group>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;
