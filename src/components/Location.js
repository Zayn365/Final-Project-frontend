import React from "react";
import { Container, Ratio } from "react-bootstrap";
import "./Location.css";

const Location = () => {
  return (
    <div className="location-section-wrapper py-5 text-center">
      <Container>
        <h3 className="text-center fw-bold mb-4">Location</h3>
        <div className="d-flex justify-content-center">
          <div style={{ width: "100%", maxWidth: "80vw" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3441.3026709775263!2d-87.7789593!3d30.3991534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x889a16b47e522a71%3A0xd49e37cf6bbb8570!2sMay%20James%20W!5e0!3m2!1sen!2s!4v1686145952015!5m2!1sen!2s"
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Map"
            ></iframe>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Location;
