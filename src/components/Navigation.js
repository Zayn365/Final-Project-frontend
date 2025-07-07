import React, { useRef, useState } from "react";
import axios from "../axios";
import { Navbar, Nav, Container, Form, FormControl } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { logout, resetNotifications } from "../features/userSlice";
import Logo from "../assets/images/logo.png";
import "./Navigation.css";

function Navigation() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const bellRef = useRef(null);
  const notificationRef = useRef(null);
  const [bellPos, setBellPos] = useState({});

  const handleLogout = () => dispatch(logout());

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
        <Form className="d-flex" style={{ maxWidth: 300 }}>
          <FormControl
            type="search"
            placeholder="I'm looking for..."
            className="me-1"
            style={{ height: "30px", fontSize: "0.85rem" }}
          />
          <button className="btn search-btn py-0 px-2" type="submit">
            Search
          </button>
        </Form>
        <div className="ms-3 d-flex align-items-center">
          {!user && (
            <>
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
                <Nav.Link>
                  <i className="far fa-shopping-bag nav-icon"></i>
                  {user?.cart?.count > 0 && (
                    <span className="badge badge-warning" id="cartcount">
                      {user.cart.count}
                    </span>
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
            <Nav.Link className="text-white" onClick={handleLogout}>
              Logout
            </Nav.Link>
          )}
        </div>
      </div>

      {/* Spacer to avoid content hiding under marquee */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1020,
          backgroundColor: "#fff",
        }}
      >
        {/* Main Navbar */}
        <Navbar style={{ backgroundColor: "#3b3f46" }} expand="lg">
          <Container>
            <LinkContainer to="/">
              <img src={Logo} alt="logo" width={180} />
            </LinkContainer>
          </Container>
        </Navbar>

        {/* Navigation Links */}
        <Navbar bg="light" variant="light">
          <Container>
            <Nav className="mx-auto">
              <LinkContainer to="/">
                <Nav.Link>Home</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/category/all">
                <Nav.Link>Products</Nav.Link>
              </LinkContainer>
            </Nav>
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
