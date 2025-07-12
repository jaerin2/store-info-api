const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const { storeName } = req.query;

  if (!storeName) {
    return res.status(400).json({ error: "storeName is required" });
  }

  try {
    // ✅ opensheet 주소 수정
    const sheetUrl = "https://opensheet.elk.sh/11nBstYlw_sWr5GStL2FkR-AsX5JjtnhGaDIgUQxjmYI/Sheet1";
    const response = await fetch(sheetUrl);
    const rawText = await response.text();

    // ✅ 줄 단위로 자르고 각각 JSON 파싱
    const lines = rawText.trim().split("\n");
    const data = lines.map(line => JSON.parse(line));

    console.log("불러온 데이터:", data);

    // ✅ 매장명 또는 전화번호 일치하는 항목 찾기
    const match = data.find(
      row => row["매장명"] === storeName || row["전화번호"] === storeName
    );

    if (!match) {
      return res.status(404).json({ error: "매장 정보를 찾을 수 없습니다." });
    }

    return res.status(200).json({ result: match });

  } catch (error) {
    console.error("서버 오류:", error);
    return res.status(500).json({ error: "서버 오류: " + error.message });
  }
};
