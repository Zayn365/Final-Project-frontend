import React, { useState, useContext } from "react";
import { Button, Col, Container, Form, Row, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useLoginWithK12Mutation } from "../services/appApi";
import { ContextValue } from "../Context";
import logo from "../assets/images/logo.png"; // Replace with actual path
import { useDispatch } from "react-redux";
import { addPass } from "../features/personalSlice";
function K12Login() {
  const x = useContext(ContextValue);
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginWithK12, { isError, isLoading, error }] =
    useLoginWithK12Mutation();

  function handleLogin(e) {
    e.preventDefault();
    loginWithK12({ username, password });
    dispatch(addPass(password));
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
            <h2 className="mb-4 text-center">Veli Girişi</h2>
            {isError && <Alert variant="danger">{error.data}</Alert>}

            <Form.Group className="mb-3 text-start">
              <Form.Label>Kullanıcı Adı</Form.Label>
              <Form.Control
                type="text"
                placeholder="Kullanıcı Adı"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
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

            <p className="text-center text-muted">
              Lütfen giriş yapmak için K12NET kullanıcı bilgilerinizi kullanın.
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

export default K12Login;
