const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const { storeName } = req.query;

  if (!storeName) {
    return res.status(400).json({ error: "storeName is required" });
  }

  try {
    // ✅ 여기에 본인 시트 ID로 수정
    const sheetUrl = "https://opensheet.vercel.app/1YourSheetID1234567890abcdef/Sheet1";

    const response = await fetch(sheetUrl);
    const data = await response.json();

    // ✅ 디버깅용 출력 (Vercel Logs에서 확인 가능)
    console.log("불러온 데이터:", data);

    const match = data.find(
      (row) => row["매장명"] === storeName || row["전화번호"] === storeName
    );

    if (!match) {
      return res.status(404).json({ error: "매장 정보를 찾을 수 없습니다." });
    }

    return res.status(200).json({ result: match });
  } catch (error) {
    return res.status(500).json({ error: "서버 오류: " + error.message });
  }
};
