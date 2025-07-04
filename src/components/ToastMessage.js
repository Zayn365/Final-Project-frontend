import React, { useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import "./ToastMessage.css";

function ToastMessage({ bg = "success", title, body }) {
  return (
    <ToastContainer className="p-3" style={{ zIndex: 9999 }}>
      <Toast bg={bg} delay={3000} autohide>
        <Toast.Header>
          <strong className="me-auto">{title}</strong>
        </Toast.Header>
        <Toast.Body className="text-white">{body}</Toast.Body>{" "}
      </Toast>
    </ToastContainer>
  );
}

export default ToastMessage;
