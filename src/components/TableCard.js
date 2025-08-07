import React from "react";

const campaigns = [
  {
    date: "1-31 AĞUSTOS 2025",
    bank: "HALKBANK PARAF",
    link: "https://www.paraf.com.tr/content/parafcard/tr/kampanyalar/egitim-kirtasiye/egitim-sektorunde-arti4-taksit.html",
  },
  {
    date: "1-31 AĞUSTOS 2025",
    bank: "HALKBANK PARAF",
    link: "https://www.paraf.com.tr/content/parafcard/tr/kampanyalar/egitim-kirtasiye/okul-odemelerine-taksit-kampanyasi211.html",
  },
  {
    date: "1-31 AĞUSTOS 2025",
    bank: "AKBANK AXSESS",
    link: "https://www.axess.com.tr/axess/kampanyadetay/8/15242/egitim-sektoru-kapsaminda-okul-odemelerinde-2-8-taksitli-islemlerde--4-taksit",
  },
  {
    date: "1-31 AĞUSTOS 2025",
    bank: "AKBANK AXSESS",
    link: "https://www.axess.com.tr/axess/kampanyadetay/8/21543/akbank-kredi-kartlarinizla-egitim-kurumlarina-ozel-pesin-harcamalariniza-5-taksit-firsati",
  },
  {
    date: "1-31 AĞUSTOS 2025",
    bank: "YAPIKREDİ WORLD",
    link: "https://www.worldcard.com.tr/kampanyalar/secili-okullarda-taksitli-egitim-harcamalariniza-2-taksite-4-3-ve-uzeri-taksitlere-5-ek-taksit-agust",
  },
  {
    date: "1-31 AĞUSTOS 2025",
    bank: "ALBARAKA WORD",
    link: "https://albarakapos.com/kategori/kampanyalar/15",
  },
  {
    date: "1-31 AĞUSTOS 2025",
    bank: "VAKIFBANK",
    link: "https://www.vakifkart.com.tr/kampanyalar/egitim-kurumu-pesin-harcamalariniza-faizsiz-3-taksit-firsati-38680",
  },
  {
    date: "1-31 AĞUSTOS 2025",
    bank: "VAKIFBANK TROY",
    link: "https://www.vakifkart.com.tr/kampanyalar/troy-logolu-kredi-karti-ile-pesin-egitim-harcamalariniza-faizsiz-4-taksit-firsati-38679",
  },
  {
    date: "1-31 ARALIK 2025",
    bank: "BANKKART(ZİRAAT)",
    link: "https://www.bankkart.com.tr/kampanyalar/egitim-kitap-ve-kirtasiye/egitimde-4-taksit-bankkart-prestije-ozel-6-taksit",
  },
  {
    date: "1-31 ARALIK 2025",
    bank: "SAĞLAM KART",
    link: "https://www.kuveytturk.com.tr/kampanyalar/kendim-icin/kart-kampanyalari/egitim-ve-saglik-harcamalarinizda-5-taksit-firsati",
  },
  {
    date: "1-31 AĞUSTOS 2025",
    bank: "Happy Bonus",
    link: "https://www.happycard.com.tr/kampanyalar/Sayfalar/Happy-Bonus-ile-Okul-Odemelerinize-7-Aya-Kadar-Kar-Paysiz-Taksit.aspx",
  },
  {
    date: "1-31 ARALIK 2025",
    bank: "VAKIF KATILIM TROY",
    link: "https://www.vakifkatilim.com.tr/tr/kendim-icin/kampanyalar/detay/troy-kredi-karti-ile-egitimde-vade-farksiz-5-taksit",
  },
  {
    date: "1-31 ARALIK 2025",
    bank: "VAKIF KATILIM",
    link: "https://www.vakifkatilim.com.tr/tr/kendim-icin/kampanyalar/detay/egitim-harcamalariniza-vade-farksiz-5-taksit",
  },
  {
    date: "1-31 ARALIK  2025",
    bank: "EN PARA",
    link: "https://www.enpara.com/kampanyalar/egitim-saglik-harcamalarinizi-ve-vergi-odemelerinizi-faizsiz-sonradan-taksitlendirin",
  },
  {
    date: "1-31 AĞUSTOS 2025",
    bank: "GARANTİ BANKASI TROY",
    link: "https://www.bonus.com.tr/kampanyalar/bonus-troy-egitim-kampanyasi",
  },
  {
    date: "1-31 AĞUSTOS 2025",
    bank: "GARANTİ BANKASI",
    link: "https://www.bonus.com.tr/kampanyalar/garanti-bbva-egitim-kampanya",
  },
];

const tableStyle = {
  borderCollapse: "collapse",
  width: "100%",
};

const thStyle = {
  border: "1px solid black",
  backgroundColor: "#cc0000",
  color: "#fff",
  padding: "8px",
  fontWeight: "bold",
};

const tdStyle = {
  border: "1px solid black",
  padding: "8px",
};

export default function BankCampaigns() {
  return (
    <div style={{ marginTop: "80px" }}>
      {/* <h2>Banka Kampanyaları - AĞUSTOS / ARALIK 2025</h2> */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Kampanya Tarihi</th>
            <th style={thStyle}>Banka Adı</th>
            <th style={thStyle}>Kampanya Linki</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((item, idx) => (
            <tr key={idx}>
              <td style={tdStyle}>{item.date}</td>
              <td style={tdStyle}>{item.bank}</td>
              <td style={tdStyle}>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  Kredi Kartı ve Taksit Avantajları Bilgisi İçin Tıklayınız!
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
