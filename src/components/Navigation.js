import React, { useRef, useState } from "react";
import axios from "../axios";
import {
  Navbar,
  Nav,
  Container,
  Form,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { logout, resetNotifications } from "../features/userSlice";
import Logo from "../assets/images/logo.png";
import "./Navigation.css";
import { useNavigate } from "react-router-dom";
import { removePass } from "../features/personalSlice";

function Navigation() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const bellRef = useRef(null);
  const notificationRef = useRef(null);
  const [bellPos, setBellPos] = useState({});
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/category/${encodeURIComponent(search.trim().toLowerCase())}`);
    }
  };
  const handleLogout = () => {
    dispatch(removePass());
    dispatch(logout());
  };

  const unreadNotifications = user?.notifications?.filter(
    (n) => n.status === "unread"
  ).length;

  const handleToggleNotifications = () => {
    const position = bellRef.current.getBoundingClientRect();
    setBellPos(position);
    notificationRef.current.style.display =
      notificationRef.current.style.display === "block" ? "none" : "block";
    dispatch(resetNotifications());
    if (unreadNotifications > 0)
      axios.post(`/users/${user._id}/updateNotifications`);
  };

  return (
    <>
      {/* Top Red Bar with Search */}
      <div
        className="d-flex justify-content-end align-items-center px-3"
        style={{
          backgroundColor: "#cc182c",
          height: "40px",
        }}
      >
        {/* <Form
          className="d-flex"
          onSubmit={handleSubmit}
          style={{ maxWidth: 300 }}
        >
          <FormControl
            type="search"
            placeholder="Aradığım ürün..."
            className="me-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ height: "30px", fontSize: "0.85rem" }}
          />
          <button className="btn search-btn py-0 px-2" type="submit">
            Ara
          </button>
        </Form> */}

        <div className="ms-3 d-flex align-items-center">
          {!user && (
            <>
              {/* <LinkContainer style={{ marginRight: "12px" }} to="/admin-login">
                <Nav.Link className="position-relative p-0 text-white">
                  Admin
                </Nav.Link>
              </LinkContainer> */}
              <Nav.Link className="p-0" onClick={handleToggleNotifications}>
                <i
                  className="far fa-bell nav-icon"
                  ref={bellRef}
                  data-count={unreadNotifications || null}
                ></i>
              </Nav.Link>
              <LinkContainer to="/login">
                <Nav.Link className="p-0">
                  <i className="far fa-user nav-icon"></i>
                </Nav.Link>
              </LinkContainer>
            </>
          )}

          {user && !user.isAdmin && (
            <>
              <LinkContainer to="/cart">
                <Nav.Link className="position-relative p-0">
                  <i
                    className="fas fa-shopping-cart nav-icon"
                    style={{ fontSize: "1.2rem" }}
                  ></i>
                  {user?.cart?.count > 0 && (
                    <span id="cartcount">{user.cart.count}</span>
                  )}
                </Nav.Link>
              </LinkContainer>
              <Nav.Link onClick={handleToggleNotifications}>
                <i
                  className="far fa-bell nav-icon"
                  ref={bellRef}
                  data-count={unreadNotifications || null}
                ></i>
              </Nav.Link>
            </>
          )}

          {user && (
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="text-white nav-link p-0"
                style={{ textDecoration: "none" }}
              >
                {user.name}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ zIndex: 9999 }}>
                {!user.isAdmin && (
                  <LinkContainer to="/orders">
                    <Dropdown.Item>Siparişler</Dropdown.Item>
                  </LinkContainer>
                )}
                {user.isAdmin && (
                  <LinkContainer to="/admin">
                    <Dropdown.Item>Yönetim Paneli</Dropdown.Item>
                  </LinkContainer>
                )}
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Çıkış</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>

      {/* Sticky Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1020,
          backgroundColor: "#fff",
        }}
      >
        {/* Main Navbar */}
        <Navbar
          style={{
            backgroundColor: "#3b3f46",
            marginBottom: "12px",
            boxShadow: "0 18px 22px rgba(0, 0, 0, 0.21)",
          }}
          expand="lg"
        >
          <Container>
            <LinkContainer to="/">
              <img src={Logo} alt="logo" width={180} />
            </LinkContainer>
          </Container>
        </Navbar>

        {/* Notification Dropdown */}
        <div
          className="notifications-container"
          ref={notificationRef}
          style={{
            position: "absolute",
            top: bellPos.top + 10,
            left: bellPos.left - 180,
            display: "none",
          }}
        >
          {user?.notifications.length > 0 ? (
            user.notifications.map((notification, idx) => (
              <p key={idx} className={`notification-${notification.status}`}>
                {notification.message}
                <br />
                <span>
                  {notification.time.split("T")[0] +
                    " " +
                    notification.time.split("T")[1]}
                </span>
              </p>
            ))
          ) : (
            <p>No notifications yet</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Navigation;
