const fetch = require("node-fetch");
const levenshtein = require("fast-levenshtein");

module.exports = async (req, res) => {
  const { storeName } = req.query;

  if (!storeName) {
    return res.status(400).json({ error: "storeName is required" });
  }

  try {
    const sheetUrl = "https://opensheet.elk.sh/11nBstYlw_sWr5GStL2FkR-AsX5JjtnhGaDIgUQxjmYI/Sheet1";
    const response = await fetch(sheetUrl);
    const text = await response.text();

    // JSON이 아니라 JS 객체형 string으로 감싸져있을 때 처리
    const jsonLike = text.trim().replace(/^.*?\(/, '').replace(/\);?$/, '');
    const data = JSON.parse(jsonLike);

    const match = data.find(
      (row) => row["매장명"] === storeName || row["전화번호"] === storeName
    );

    if (match) {
      return res.status(200).json({ result: match });
    }

    // 유사 매장명 자동 추정
    const similar = data.map(row => ({
      name: row["매장명"],
      score: levenshtein.get(row["매장명"], storeName),
      row
    })).sort((a, b) => a.score - b.score);

    if (similar.length > 0 && similar[0].score <= 3) {
      return res.status(200).json({
        result: similar[0].row,
        similarMatch: true,
        message: `정확한 일치 항목은 없지만 '${similar[0].name}'(이)가 가장 유사합니다.`
      });
    }

    return res.status(404).json({ error: "매장 정보를 찾을 수 없습니다." });
  } catch (error) {
    return res.status(500).json({ error: "서버 오류: " + error.message });
  }
};
