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
      {/* Marquee Strip */}
      <div
        className="py-1 px-3 text-white"
        style={{ backgroundColor: "#cc182c", fontSize: "0.9rem" }}
      >
        <marquee behavior="scroll" direction="left">
          "Education is the passport to the future" | "Study hard, dream big" |
          "Stationery is the first step to creativity" | "Books and pens pave
          the path to success" | "Where school life begins, stationery matters!"
        </marquee>
      </div>

      {/* Main Navbar */}
      <Navbar style={{ backgroundColor: "#00214d" }} expand="lg">
        <Container>
          <LinkContainer to="/">
            <img src={Logo} alt="logo" width={150} />
          </LinkContainer>

          <Form className="d-flex mx-3" style={{ flexGrow: 1 }}>
            <FormControl
              type="search"
              placeholder="Search..."
              className="me-2"
              aria-label="Search"
            />
          </Form>

          <Nav className="align-items-center">
            {!user && (
              <>
                <Nav.Link onClick={handleToggleNotifications}>
                  <i
                    className="fas fa-bell text-white "
                    ref={bellRef}
                    data-count={unreadNotifications || null}
                  ></i>
                </Nav.Link>
                <LinkContainer to="/login">
                  <Nav.Link>
                    <i className="fas fa-user fa-lg text-white"></i>
                  </Nav.Link>
                </LinkContainer>
              </>
            )}
            {user && user.isAdmin && (
              <LinkContainer to="/admin">
                <Nav.Link>Admin</Nav.Link>
              </LinkContainer>
            )}
            {user && !user.isAdmin && (
              <LinkContainer to="/cart">
                <Nav.Link>
                  <i className="fas fa-shopping-cart"></i>
                  {user?.cart?.count > 0 && (
                    <span className="badge badge-warning" id="cartcount">
                      {user.cart.count}
                    </span>
                  )}
                </Nav.Link>
              </LinkContainer>
            )}
            {user && (
              <>
                <Nav.Link className="text-white" onClick={handleLogout}>
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
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
          top: bellPos.top + 30,
          left: bellPos.left,
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
    </>
  );
}

export default Navigation;
