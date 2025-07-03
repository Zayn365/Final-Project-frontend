import React from "react";
import "./BrandGrid.css";

const BrandGrid = () => {
  return (
    <div className="brand-section-wrapper py-5">
      <div className="container">
        <h3 className="text-center fw-bold mb-4">Our Trusted Partners</h3>
        <div className="row text-center g-4">
          {[
            "https://api.platform-production.ensun.io/file/external-company-logo/661fa4d293be8d0513109abc",
            "https://api.platform-production.ensun.io/file/external-company-logo/64a46e7f136d53c6f86782b0",
            "https://api.platform-production.ensun.io/file/external-company-logo/661fb3cf0b5d3ad68d81e91b",
            "https://api.platform-production.ensun.io/file/external-company-logo/6620d2e01be244c13bb1fd02",
            "https://api.platform-production.ensun.io/file/external-company-logo/6620d09ad401010e3374f7c4",
            "https://api.platform-production.ensun.io/file/external-company-logo/6621583b99dad4fc0e878914",
            "https://api.platform-production.ensun.io/file/external-company-logo/64a49590a172859092b6a5bf",
            "https://api.platform-production.ensun.io/file/external-company-logo/6620133d5804792fe227d39f",
            "https://api.platform-production.ensun.io/file/external-company-logo/6620d14b4bb2f0b422fe5126",
            "https://birikimokullari.com/logokurs.svg",
            "https://birikimokullari.com/logobiricik.svg",
          ].map((src, index) => (
            <div className="col-6 col-sm-4 col-md-3 col-lg-2" key={index}>
              <div className="brand-logo-wrapper">
                <img src={src} alt={`Brand ${index}`} className="img-fluid" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandGrid;
