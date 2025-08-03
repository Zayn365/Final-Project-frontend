import React, { useEffect, useState } from "react";

function Ziraat3DSecureResult() {
  const [responseData, setResponseData] = useState({});

  useEffect(() => {
    // Get data from query params (GET)
    const urlParams = new URLSearchParams(window.location.search);
    const queryData = {};
    window.opener?.postMessage({ type: "3DS_DONE", success: true }, "*");
    window.close();
    urlParams.forEach((value, key) => {
      queryData[key] = value;
    });

    // Get POST data from redirected form if ZiraatPay sends it (may not work without server middleware)
    if (window.history.state?.postData) {
      setResponseData(window.history.state.postData);
    } else {
      setResponseData(queryData);
    }
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Ödeme Sonucu</h2>
      {Object.keys(responseData).length === 0 ? (
        <p>Veri bulunamadı.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Parametre
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Değer
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(responseData).map(([key, value]) => (
              <tr key={key}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {key}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Ziraat3DSecureResult;
