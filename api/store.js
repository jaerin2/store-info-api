const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const { storeName } = req.query;

  if (!storeName) {
    return res.status(400).json({ error: "storeName is required" });
  }

  try {
    const sheetUrl =
      "https://opensheet.vercel.app/11nBstYlw_sWr5GStL2FkR-AsX5JjtnhGaDIgUQxjmYI/Sheet1";

    const response = await fetch(sheetUrl);
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("시트 데이터 형식이 잘못되었습니다.");
    }

    // 정확히 일치하는 매장 먼저 찾기
    let match = data.find(
      (row) => row["매장명"] === storeName || row["전화번호"] === storeName
    );

    // 못 찾았을 경우: 유사 매장명 추정
    if (!match) {
      const lowerName = storeName.toLowerCase();
      match = data.find((row) =>
        row["매장명"]?.toLowerCase().includes(lowerName)
      );
    }

    if (!match) {
      return res.status(404).json({ error: "해당 매장을 찾을 수 없습니다." });
    }

    return res.status(200).json({ result: match });
  } catch (error) {
    console.error("🔥 서버 오류:", error.message);
    return res.status(500).json({ error: "서버 오류: " + error.message });
  }
};
