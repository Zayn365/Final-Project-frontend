import React, { useState } from "react";
import { Modal, Button, Carousel } from "react-bootstrap";
import firstImage from "../assets/popupslides/1.jpeg";
import secondImage from "../assets/popupslides/2.jpeg";
import thirdImage from "../assets/popupslides/3.jpeg";
import forthImage from "../assets/popupslides/4.jpeg";
import "./popSlide.css";
// Images array
const images = [
  { src: firstImage, altText: "Beden Ölçüsü 1" },
  { src: secondImage, altText: "Beden Ölçüsü 2" },
  { src: thirdImage, altText: "Beden Ölçüsü 3" },
  { src: forthImage, altText: "Beden Ölçüsü 4" },
];

function SizeChartPopup() {
  const [show, setShow] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleShow = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setActiveIndex(0);
  };

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  return (
    <div className="d-flex justify-content-start mt-4">
      <Button
        variant="danger"
        onClick={handleShow}
        className="fw-bold px-4 py-2"
        style={{ marginLeft: "10px" }}
      >
        Beden ölçüleri için tıklayınız
      </Button>

      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Beden Ölçüleri</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <Carousel fade className="hero-carousel">
            {images.map((item, idx) => (
              <Carousel.Item key={idx}>
                <img
                  className="d-block w-100"
                  src={item.src}
                  alt={item.altText}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default SizeChartPopup;
