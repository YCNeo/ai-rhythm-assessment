/**
 * 問卷版本資料集中管理
 * 第一部分（背景資訊）為所有版本共用
 * 第二部分（節奏診斷）可依版本替換
 */
const COMMON_BACKGROUND_QUESTIONS = [
  {
    id: "bg_industry",
    section: "第一部分：學員背景資訊",
    type: "single",
    title: "所屬產業",
    required: true,
    options: [
      "科技研發",
      "金融保險",
      "傳產製造",
      "專業服務（廣告/律師/顧問）",
      "零售服務",
      "其他",
    ],
  },
  {
    id: "bg_role_type",
    section: "第一部分：學員背景資訊",
    type: "single",
    title: "工作崗位性質",
    required: true,
    options: [
      "高反應型（客服/業務/行政）",
      "高專注型（工程師/企劃/設計/分析師）",
      "管理協調型（主管/專案經理）",
      "其他",
    ],
  },
  {
    id: "bg_level",
    section: "第一部分：學員背景資訊",
    type: "single",
    title: "職級層次",
    required: true,
    options: ["一般職員", "基層主管", "中高層決策者", "其他"],
  },
  {
    id: "bg_collab_mode",
    section: "第一部分：學員背景資訊",
    type: "single",
    title: "團隊協作模式",
    required: true,
    options: ["獨立作業為主", "緊密團隊協作", "跨部門協作為主", "其他"],
  },
];

const VERSION_QUESTIONNAIRES = {
  v1: {
    id: "v1",
    title: "節奏工作法節奏診斷問卷",
    description: "請依過去一週實際狀況填答。",
    versionQuestions: [
      {
        id: "q1",
        section: "維度一：生理與能量節奏",
        type: "single",
        title: "Q1：您在什麼時段感覺腦袋最清醒、處理複雜邏輯最有效率？",
        required: true,
        options: [
          "06:00-10:00（起跑者）",
          "10:00-16:00（穩定者）",
          "16:00 以後（錨點者）",
        ],
      },
      {
        id: "q2",
        section: "維度一：生理與能量節奏",
        type: "scale",
        title: "Q2：您是否常在下午 14:00-16:00 感到極度疲勞或專注力渙散？",
        required: true,
        min: 1,
        max: 5,
        minLabel: "完全不會",
        maxLabel: "非常常發生",
      },
      {
        id: "q3",
        section: "維度一：生理與能量節奏",
        type: "single",
        title: "Q3：您通常如何處理低能量時段（疲累時）的工作？",
        required: true,
        options: ["硬撐繼續做大事", "滑手機休息", "處理例行雜事（報支/回信）"],
      },
      {
        id: "q4",
        section: "維度二：任務邊界與拍點設計",
        type: "scale",
        title:
          "Q4：接到新任務時，您是否能清楚定義「做到什麼程度算完成（證據）」？",
        required: true,
        min: 1,
        max: 5,
        minLabel: "完全不能",
        maxLabel: "非常清楚",
      },
      {
        id: "q5",
        section: "維度二：任務邊界與拍點設計",
        type: "scale",
        title: "Q5：您是否會在行事曆上預留「深度工作拍（深度專注區塊）」？",
        required: true,
        min: 1,
        max: 5,
        minLabel: "幾乎不會",
        maxLabel: "幾乎每天",
      },
      {
        id: "q6",
        section: "維度二：任務邊界與拍點設計",
        type: "single",
        title: "Q6：一天中有多少比例時間在處理他人的突發需求（插單）？",
        required: true,
        options: ["20% 以下", "20%-50%", "50% 以上"],
      },
      {
        id: "q7",
        section: "維度三：決策與插單處理",
        type: "single",
        title:
          "Q7：面對臨時插入的瑣碎任務（如一封不急的郵件），您最常採取的行動是？",
        required: true,
        options: ["馬上處理（Do）", "先記下稍後處理（Defer）", "無視它"],
      },
      {
        id: "q8",
        section: "維度三：決策與插單處理",
        type: "scale",
        title: "Q8：您是否常覺得全天都在處理零碎任務，導致大專案沒有進展？",
        required: true,
        min: 1,
        max: 5,
        minLabel: "完全沒有",
        maxLabel: "非常嚴重",
      },
      {
        id: "q9",
        section: "維度四：溝通與同步效率",
        type: "scale",
        title: "Q9：當您請求他人幫忙時，是否常發生「成果與您的預期不符」？",
        required: true,
        min: 1,
        max: 5,
        minLabel: "幾乎不會",
        maxLabel: "非常常發生",
      },
      {
        id: "q10",
        section: "維度四：溝通與同步效率",
        type: "scale",
        title:
          "Q10：與主管或團隊對齊進度、爭取資源時，您能控制在 90 秒內講完重點嗎？",
        required: true,
        min: 1,
        max: 5,
        minLabel: "幾乎不能",
        maxLabel: "幾乎都可以",
      },
      {
        id: "q11",
        section: "維度四：溝通與同步效率",
        type: "scale",
        title:
          "Q11：您是否會主動公告自己的「對外回應拍點」（例如固定回覆時段）？",
        required: true,
        min: 1,
        max: 5,
        minLabel: "完全沒有",
        maxLabel: "非常固定",
      },
      {
        id: "q12",
        section: "維度五：底層信念與自我校準",
        type: "scale",
        title: "Q12：下班前，您是否會有意識地回看今天的「節奏證據」？",
        required: true,
        min: 1,
        max: 5,
        minLabel: "完全不會",
        maxLabel: "每天都會",
      },
      {
        id: "q13",
        section: "維度五：底層信念與自我校準",
        type: "scale",
        title: "Q13：目前工作量是否讓您感到「越努力越疲憊、缺乏成就感」？",
        required: true,
        min: 1,
        max: 5,
        minLabel: "完全不會",
        maxLabel: "非常明顯",
      },
    ],
  },
};

function buildQuestionnaire(version) {
  const versionQuestions =
    version && version.versionQuestions ? version.versionQuestions : [];
  return {
    id: version.id,
    title: version.title,
    description: version.description,
    questions: COMMON_BACKGROUND_QUESTIONS.concat(versionQuestions),
  };
}

/**
 * 取得全部版本清單（可供後台或前端顯示）
 */
function getQuestionnaireVersions() {
  return Object.keys(VERSION_QUESTIONNAIRES).map((id) => {
    const v = VERSION_QUESTIONNAIRES[id];
    return {
      id: v.id,
      title: v.title,
      description: v.description,
      questionCount:
        COMMON_BACKGROUND_QUESTIONS.length + (v.versionQuestions || []).length,
    };
  });
}

/**
 * 依版本 ID 取得問卷，找不到時回退到 v1
 */
function getQuestionnaireById(versionId) {
  const version =
    VERSION_QUESTIONNAIRES[versionId] || VERSION_QUESTIONNAIRES.v1;
  if (!version) {
    return {
      id: "fallback",
      title: "預設問卷",
      description: "",
      questions: COMMON_BACKGROUND_QUESTIONS.slice(),
    };
  }
  return buildQuestionnaire(version);
}
