import React from "react";
import "./Testimonials.css";

const Testimonials = () => {
  return (
    <div className="testimonial-section-wrapper py-5 bg-light">
      <div className="container">
        {/* Brand Title */}
        <h1
          className="text-center fw-bold mb-2"
          style={{
            fontFamily: "'Times New Roman', serif",
            letterSpacing: "2px",
          }}
        >
          BİRİKİM OKULLARI
        </h1>

        {/* Headline & Intro */}
        <h2 className="fw-bold text-center mt-4">
          Premium Quality Stationery Items Online In Turkey
        </h2>
        <p className="mt-3 text-center">
          <span style={{ color: "red", fontWeight: "bold" }}>
            BİRİKİM OKULLARI
          </span>{" "}
          is the leading online stationery items store in Turkey. Get the finest
          shopping experience for stationery customers! Our dedication to
          excellence enters every aspect of our online store...
        </p>

        {/* Subheading */}
        <h4 className="mt-5 fw-semibold text-center">
          Top Collections Of Arts, Office & School Supplies Online
        </h4>
        <p className="mt-3 text-center">
          We are proud to have an excellent quality of art, office & school
          supplies and gift collection that can leave a lasting impression...
        </p>

        {/* Icons Row */}
        <h5 className="mt-5 mb-4 text-center fw-bold">Why Shop With Us?</h5>
        <div className="row g-4 text-start">
          {[
            {
              icon: "https://cdn-icons-png.flaticon.com/512/1049/1049332.png",
              title: "Free shipping",
              desc: "Shop for Rs 4000 and get Free Shipping",
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/1786/1786873.png",
              title: "Satisfied or refunded",
              desc: "Get a discount when you subscribe to our newsletter",
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/1828/1828864.png",
              title: "Top-notch support",
              desc: "Our support is available 24/7",
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/2910/2910791.png",
              title: "Secure payments",
              desc: "Your payment information is processed securely",
            },
          ].map((item, i) => (
            <div className="col-sm-6 col-md-3" key={i}>
              <div className="d-flex align-items-start gap-3">
                <img src={item.icon} width="40" alt={item.title} />
                <div>
                  <p className="fw-bold mb-1">{item.title}</p>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
