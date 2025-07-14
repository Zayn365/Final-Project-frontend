import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Signup.css";
import { useSignupMutation } from "../services/appApi";
import logo from "../assets/images/logo.png"; // Replace with actual path

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signup, { error, isLoading, isError }] = useSignupMutation();

  function handleSignup(e) {
    e.preventDefault();
    signup({ name, email, password });
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={6} className="signup__form--container">
          <Form style={{ width: "100%" }} onSubmit={handleSignup}>
            <h2 className="mb-4">Hesap Oluştur</h2>
            {isError && <Alert variant="danger">{error.data}</Alert>}

            <Form.Group className="mb-3 text-start">
              <Form.Label>İsim</Form.Label>
              <Form.Control
                type="text"
                placeholder="Adınızı girin"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

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

            <Button type="submit" disabled={isLoading}>
              Kayıt Ol
            </Button>

            <p className="pt-3 text-center">
              Zaten bir hesabınız var mı? <Link to="/login">Giriş Yapın</Link>
            </p>
          </Form>
        </Col>
        <Col
          md={6}
          className="d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "#00214d" }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ maxWidth: "60%", height: "auto" }}
          />
        </Col>{" "}
      </Row>
    </Container>
  );
}

export default Signup;
