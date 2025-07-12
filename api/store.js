// api/store.js
const fetch = require("node-fetch");

// 문자열 유사도 비교 함수 (Levenshtein Distance 기반 유사도)
function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / longerLength;
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

module.exports = async (req, res) => {
  const { storeName } = req.query;
  if (!storeName) {
    return res.status(400).json({ error: "storeName is required" });
  }

  try {
    const sheetUrl = "https://opensheet.vercel.app/11nBstYlw_sWr5GStL2FkR-AsX5JjtnhGaDIgUQxjmYI/Sheet1";
    const response = await fetch(sheetUrl);
    const data = await response.json();

    const storeNames = data.map(row => row["매장명"]);

    // 정확 일치 우선
    let match = data.find(
      row => row["매장명"] === storeName || row["전화번호"] === storeName
    );

    // 없으면 유사도 기반 탐색
    if (!match) {
      let bestScore = 0;
      let bestMatch = null;
      for (const row of data) {
        const score = similarity(row["매장명"], storeName);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = row;
        }
      }
      if (bestScore > 0.5) {
        match = bestMatch;
      }
    }

    if (!match) {
      return res.status(404).json({ error: "매장 정보를 찾을 수 없습니다." });
    }

    return res.status(200).json({ result: match });
  } catch (error) {
    return res.status(500).json({ error: "서버 오류: " + error.message });
  }
};
