/**
 * 問卷版本資料集中管理
 * 你可以在這裡持續新增版本，例如 v3、v4...
 */
const QUESTIONNAIRE_VERSIONS = {
  v1: {
    id: "v1",
    title: "工作現況盤點問卷 v1",
    description: "請依照目前真實狀況填答。",
    questions: [
      {
        id: "q1",
        type: "single",
        title: "你目前最想優先改善哪一件事？",
        required: true,
        options: ["時間管理", "團隊溝通", "銷售成長", "個人學習"],
      },
      {
        id: "q2",
        type: "text",
        title: "請簡單描述你目前遇到的最大卡點",
        required: true,
        placeholder: "例如：跨部門合作效率不佳，專案進度常延誤。",
      },
    ],
  },
  v2: {
    id: "v2",
    title: "工作現況盤點問卷 v2",
    description: "本版本聚焦在目標設定與執行。",
    questions: [
      {
        id: "q1",
        type: "single",
        title: "你的季度目標清晰度如何？",
        required: true,
        options: ["非常清楚", "大致清楚", "不太清楚", "完全不清楚"],
      },
      {
        id: "q2",
        type: "single",
        title: "你平均每週檢視目標進度幾次？",
        required: true,
        options: ["3 次以上", "1-2 次", "幾乎沒有"],
      },
      {
        id: "q3",
        type: "text",
        title: "如果只能先解一個問題，你會先解什麼？",
        required: false,
        placeholder: "可自由填寫",
      },
    ],
  },
};

/**
 * 取得全部版本清單（可供後台或前端顯示）
 */
function getQuestionnaireVersions() {
  return Object.keys(QUESTIONNAIRE_VERSIONS).map((id) => {
    const version = QUESTIONNAIRE_VERSIONS[id];
    return {
      id: version.id,
      title: version.title,
      description: version.description,
      questionCount: version.questions.length,
    };
  });
}

/**
 * 依版本 ID 取得問卷，找不到時回退到 v1
 */
function getQuestionnaireById(versionId) {
  return (
    QUESTIONNAIRE_VERSIONS[versionId] ||
    QUESTIONNAIRE_VERSIONS.v1 || {
      id: "fallback",
      title: "預設問卷",
      description: "",
      questions: [],
    }
  );
}
