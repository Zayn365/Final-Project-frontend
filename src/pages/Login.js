import React, { useState, useContext } from "react";
import { Button, Col, Container, Form, Row, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useLoginMutation } from "../services/appApi";
import { ContextValue } from "../Context";
import logo from "../assets/images/logo.png"; // Replace with actual path

function Login() {
  const x = useContext(ContextValue);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isError, isLoading, error }] = useLoginMutation();

  function handleLogin(e) {
    e.preventDefault();
    login({ email, password });
  }

  return (
    <Container fluid className="p-0">
      <Row className="min-vh-100">
        {/* Left Side: Form */}
        <Col
          md={6}
          className="d-flex align-items-center justify-content-center bg-white"
        >
          <Form
            style={{ width: "80%", maxWidth: "400px" }}
            onSubmit={handleLogin}
          >
            <h2 className="mb-4 text-center">Hesabınıza Giriş Yapın</h2>
            {isError && <Alert variant="danger">{error.data}</Alert>}

            <Form.Group className="mb-3 text-start">
              <Form.Label>E-posta Adresi</Form.Label>
              <Form.Control
                type="email"
                placeholder="E-posta girin"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3 text-start">
              <Form.Label>Şifre</Form.Label>
              <Form.Control
                type="password"
                placeholder="Şifre girin"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <div className="d-grid mb-3">
              <Button type="submit" disabled={isLoading}>
                Giriş Yap
              </Button>
            </div>

            <p className="text-center">
              Hesabınız yok mu? <Link to="/signup">Kayıt Olun</Link>
            </p>
          </Form>
        </Col>

        {/* Right Side: Logo with Blue Background */}
        <Col
          md={5}
          className="d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "#00214d" }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ maxWidth: "60%", height: "auto" }}
          />
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
