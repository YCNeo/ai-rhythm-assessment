/**
 * 處理 Web App GET 請求
 * 透過 ?v=versionId 決定要載入的問卷版本
 */
function doGet(e) {
  const requestedVersionId = (e && e.parameter && e.parameter.v) || "v1";
  const questionnaire = getQuestionnaireById(requestedVersionId);

  const template = HtmlService.createTemplateFromFile("index");
  template.appDataJson = JSON.stringify({
    requestedVersionId: requestedVersionId,
    activeVersionId: questionnaire.id,
    questionnaire: questionnaire,
  });

  return template
    .evaluate()
    .setTitle(questionnaire.title || "問卷")
    .addMetaTag(
      "viewport",
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    )
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 用於在 HTML 樣板中包含其他檔案內容
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 取得根資料夾「節奏工作法公開課」
 */
function getRootFolder() {
  const folders = DriveApp.getFoldersByName("節奏工作法公開課");
  if (folders.hasNext()) {
    return folders.next();
  }
  // 如果找不到，則在根目錄建立一個（方便測試）
  return DriveApp.createFolder("節奏工作法公開課");
}

/**
 * 從 Fixed_sources 資料夾取得固定資料
 */
function getFixedSources() {
  try {
    const root = getRootFolder();
    const subFolders = root.getFoldersByName("Fixed_sources");
    let sourceFolder;

    if (subFolders.hasNext()) {
      sourceFolder = subFolders.next();
    } else {
      // 如果不存在則建立並回傳空陣列
      root.createFolder("Fixed_sources");
      return [];
    }

    const files = sourceFolder.getFiles();
    const sources = [];
    while (files.hasNext()) {
      const file = files.next();
      // 僅讀取文字類檔案
      if (
        file.getMimeType() === MimeType.PLAIN_TEXT ||
        file.getMimeType() === MimeType.GOOGLE_DOCS
      ) {
        sources.push({
          title: file.getName(),
          content:
            file.getMimeType() === MimeType.GOOGLE_DOCS
              ? DocumentApp.openById(file.getId()).getBody().getText()
              : file.getBlob().getDataAsString(),
        });
      }
    }
    return sources;
  } catch (e) {
    console.error("取得固定資料失敗: " + e.toString());
    return [];
  }
}

/**
 * 處理紀錄存檔，存入「課程紀錄」試算表，並按日期分頁
 */
function saveData(payload) {
  try {
    const root = getRootFolder();
    const files = root.getFilesByName("課程紀錄");
    let ss;

    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      // 建立新的試算表
      ss = SpreadsheetApp.create("課程紀錄");
      const ssFile = DriveApp.getFileById(ss.getId());
      root.addFile(ssFile);
      DriveApp.getRootFolder().removeFile(ssFile); // 從根目錄移除，僅保留在目標資料夾
    }

    // 取得今天的日期作為工作表名稱 (格式: YYYY-MM-DD)
    const today = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd",
    );
    let sheet = ss.getSheetByName(today);

    if (!sheet) {
      sheet = ss.insertSheet(today);
      sheet.appendRow([
        "時間",
        "電子郵件",
        "行業",
        "職業",
        "分析摘要",
        "JSON詳細數據",
      ]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      payload.email || "N/A",
      payload.industry || "N/A",
      payload.occupation || "N/A",
      payload.summary || "",
      JSON.stringify(payload),
    ]);

    return "OK";
  } catch (e) {
    console.error("存檔失敗: " + e.toString());
    return "Error: " + e.toString();
  }
}

/**
 * 儲存問卷作答結果
 */
function saveQuestionnaireResponse(payload) {
  try {
    const ss = getOrCreateNamedSpreadsheet_(
      "問卷作答紀錄",
      "QUESTIONNAIRE_RECORD_SHEET_ID",
    );

    const today = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd",
    );
    let sheet = ss.getSheetByName(today);

    if (!sheet) {
      sheet = ss.insertSheet(today);
      sheet.appendRow([
        "時間",
        "版本編號",
        "版本標題",
        "作答者姓名",
        "作答者電子郵件",
        "答案(JSON)",
      ]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      payload.versionId || "unknown",
      payload.versionTitle || "",
      payload.name || "",
      payload.email || "",
      JSON.stringify(payload.answers || []),
    ]);

    return "OK";
  } catch (e) {
    console.error("問卷存檔失敗: " + e.toString());
    return "Error: " + e.toString();
  }
}

/**
 * 產生 AI 解析報告（不包含姓名與 email）
 */
function generateAiReport(payload) {
  try {
    const safePayload = {
      versionId: payload && payload.versionId ? payload.versionId : "v1",
      versionTitle: payload && payload.versionTitle ? payload.versionTitle : "",
      answers: (payload && payload.answers) || [],
    };

    const prompt = buildGeminiPromptFromAnswers_(safePayload);
    const reportText = callGeminiText_(prompt);

    return {
      reportText: reportText,
      versionId: safePayload.versionId,
      versionTitle: safePayload.versionTitle,
      createdAt: new Date().toISOString(),
    };
  } catch (e) {
    throw new Error("AI 生成失敗: " + e.toString());
  }
}

/**
 * 將 AI 報告轉 PDF 並寄送給使用者，並寫入試算表紀錄
 */
function sendReportPdf(payload) {
  try {
    const name = payload && payload.name ? payload.name : "";
    const email = payload && payload.email ? payload.email : "";
    const versionId = payload && payload.versionId ? payload.versionId : "v1";
    const versionTitle =
      payload && payload.versionTitle ? payload.versionTitle : "";
    const answers = (payload && payload.answers) || [];
    const reportText = payload && payload.reportText ? payload.reportText : "";

    if (!email) {
      return { status: "ERROR", message: "缺少 email，無法寄送 PDF。" };
    }
    if (!reportText) {
      return { status: "ERROR", message: "缺少 AI 報告內容，無法產生 PDF。" };
    }

    const remainingQuota = MailApp.getRemainingDailyQuota();
    if (remainingQuota <= 0) {
      return { status: "ERROR", message: "今日寄信額度已用盡，請明天再試。" };
    }

    const pdfBlob = buildReportPdfBlob_({
      name: name,
      versionId: versionId,
      versionTitle: versionTitle,
      reportText: reportText,
    });

    const ownerEmail = "";
    const mailOptions = {
      to: email,
      subject: "你的節奏工作法個人化解析報告",
      body: "您好，附件為本次問卷的 AI 個人化解析報告（PDF）。",
      htmlBody:
        "<p>您好，附件為本次問卷的 <b>AI 個人化解析報告</b>（PDF）。</p>" +
        "<p>若未看到附件，請先檢查垃圾郵件匣。</p>",
      attachments: [pdfBlob],
    };
    MailApp.sendEmail(mailOptions);
    const quotaAfter = MailApp.getRemainingDailyQuota();

    saveReportRecord_({
      name: name,
      email: email,
      versionId: versionId,
      versionTitle: versionTitle,
      answers: answers,
      reportText: reportText,
      pdfFileId: "",
      pdfFileUrl: "",
      emailSentTo: email,
      emailBcc: ownerEmail || "",
      mailQuotaBefore: remainingQuota,
      mailQuotaAfter: quotaAfter,
    });

    return {
      status: "OK",
      message: "PDF 已寄送，若未收到請檢查垃圾郵件匣。",
      pdfFileId: "",
      pdfFileUrl: "",
      sentTo: email,
      bcc: "",
      mailQuotaBefore: remainingQuota,
      mailQuotaAfter: quotaAfter,
      deployerEmail: "",
    };
  } catch (e) {
    return { status: "ERROR", message: e.toString() };
  }
}

function buildGeminiPromptFromAnswers_(payload) {
  const versionLabel = payload.versionTitle || payload.versionId || "v1";
  const mergedDocText = replaceSecondPartInDocxText_(
    DOCX_RAW_TEXT,
    versionLabel,
    payload.versionId,
    payload.answers || [],
  );

  return `
你是一位節奏工作法顧問，請根據以下文字內容生成個人化解析報告。

【原始文件內容（全文）】
${mergedDocText}

請用繁體中文輸出完整、可執行的個人化解析報告。
`;
}

function buildVersionSecondPartWithAnswers_(versionLabel, versionId, answers) {
  const questionnaire = getQuestionnaireById(versionId || "v1");
  const answerMap = {};
  (answers || []).forEach((item) => {
    const key = item && item.questionId ? String(item.questionId) : "";
    if (!key) return;
    answerMap[key] =
      item && item.answer !== undefined && item.answer !== null
        ? String(item.answer)
        : "";
  });

  const secondPartQuestions = (questionnaire.questions || []).filter((q) => {
    return q && q.section && q.section.indexOf("維度") === 0;
  });

  if (!secondPartQuestions.length) {
    return "（此版本沒有第二部分題目）";
  }

  let currentSection = "";
  const lines = [
    "### 第二部分：個人化節奏診斷問卷內容",
    "",
    "版本：" + versionLabel,
    "本問卷分為五個維度，學員需根據過去一週的實際狀況進行評分（1-5分）或選項勾選。",
  ];
  secondPartQuestions.forEach((q, index) => {
    if (q.section !== currentSection) {
      currentSection = q.section;
      lines.push("");
      lines.push("#### " + currentSection);
    }
    const answer = answerMap[String(q.id)] || "（未作答）";
    lines.push(`- ${q.title}`);
    lines.push(`  - 學員回答：${answer}`);
  });

  return lines.join("\n").trim();
}

function replaceSecondPartInDocxText_(
  docText,
  versionLabel,
  versionId,
  answers,
) {
  const secondPartBlock = buildVersionSecondPartWithAnswers_(
    versionLabel,
    versionId,
    answers,
  );

  const startMarker = "### 第二部分：個人化節奏診斷問卷內容";
  const endMarker = "### 第三部分：給您的產出建議邏輯";
  const startIndex = docText.indexOf(startMarker);
  const endIndex = docText.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return `${docText}\n\n${secondPartBlock}`;
  }

  const before = docText.substring(0, startIndex).trimEnd();
  const after = docText.substring(endIndex).trimStart();
  return `${before}\n\n${secondPartBlock}\n\n${after}`;
}

function callGeminiText_(promptText) {
  const API_KEY = "YOUR_API_KEY";
  if (!API_KEY || API_KEY === "YOUR_API_KEY") {
    throw new Error("請先在 code.gs 內填入 Gemini API Key。");
  }

  const modelCandidates = getPreferredModelCandidates_(API_KEY);
  let lastErrorMessage = "";

  const retryableStatuses = { 429: true, 500: true, 502: true, 503: true };
  const maxAttemptsPerModel = 3;
  const backoffMs = [3000, 8000, 15000];

  for (let i = 0; i < modelCandidates.length; i++) {
    const model = modelCandidates[i];
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      model +
      ":generateContent?key=" +
      encodeURIComponent(API_KEY);
    const reqBody = {
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
      },
    };

    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt++) {
      const response = UrlFetchApp.fetch(endpoint, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(reqBody),
        muteHttpExceptions: true,
      });
      const status = response.getResponseCode();
      const rawText = response.getContentText();

      if (status >= 200 && status < 300) {
        const data = JSON.parse(rawText);
        const candidate =
          data &&
          data.candidates &&
          data.candidates.length > 0 &&
          data.candidates[0];
        const parts =
          candidate &&
          candidate.content &&
          candidate.content.parts &&
          candidate.content.parts.length > 0
            ? candidate.content.parts
            : [];
        const text = parts
          .map((p) => (p && p.text ? p.text : ""))
          .join("\n")
          .trim();

        if (text) {
          return text;
        }
        lastErrorMessage = "模型 " + model + " 未回傳有效文字。";
        break;
      }

      lastErrorMessage = "模型 " + model + " 回應 HTTP " + status + "。";

      if (status === 404) {
        // 模型不存在，直接換下一個模型
        break;
      }

      if (retryableStatuses[status] && attempt < maxAttemptsPerModel) {
        Utilities.sleep(backoffMs[attempt - 1] || 15000);
        continue;
      }

      if (retryableStatuses[status]) {
        // 此模型重試後仍失敗，換下一個模型
        break;
      }

      throw new Error("Gemini API 錯誤: HTTP " + status + " - " + rawText);
    }
  }

  throw new Error("目前可嘗試的模型皆不可用。最後錯誤：" + lastErrorMessage);
}

function getPreferredModelCandidates_(apiKey) {
  const preferredOrder = ["gemini-3-flash", "gemini-2.5-flash"];

  try {
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models?key=" +
      encodeURIComponent(apiKey);
    const response = UrlFetchApp.fetch(endpoint, {
      method: "get",
      muteHttpExceptions: true,
    });
    const status = response.getResponseCode();
    if (status < 200 || status >= 300) {
      return preferredOrder;
    }

    const data = JSON.parse(response.getContentText() || "{}");
    const models = data.models || [];
    const available = {};

    models.forEach((m) => {
      const name = (m && m.name ? String(m.name) : "").replace("models/", "");
      const methods =
        m && m.supportedGenerationMethods ? m.supportedGenerationMethods : [];
      if (name && methods.indexOf("generateContent") !== -1) {
        available[name] = true;
      }
    });

    // 只允許你指定的兩類：Gemini 3 Flash、Gemini 2.5 Flash
    const availableNames = Object.keys(available);
    const gemini3Flash = availableNames.filter(
      (n) => /^gemini-3(\.|-).*flash/.test(n) || n === "gemini-3-flash",
    );
    const gemini25Flash = availableNames.filter(
      (n) => /^gemini-2\.5.*flash/.test(n) || n === "gemini-2.5-flash",
    );

    const ordered = []
      .concat(gemini3Flash.sort())
      .concat(gemini25Flash.sort())
      .filter((v, i, arr) => arr.indexOf(v) === i);

    return ordered.length ? ordered : preferredOrder;
  } catch (e) {
    return preferredOrder;
  }
}

function buildReportPdfBlob_(payload) {
  const nowText = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss",
  );
  const safeName = payload.name || "學員";
  const safeVersion = payload.versionTitle || payload.versionId || "v1";
  const reportTextEscaped = escapeHtml_(payload.reportText || "");

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body { font-family: Arial, "Microsoft JhengHei", sans-serif; padding: 24px; color: #1f2937; line-height: 1.8; }
      h1 { font-size: 20px; margin: 0 0 12px 0; }
      .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
      .content { white-space: pre-wrap; font-size: 13px; }
    </style>
  </head>
  <body>
    <h1>節奏工作法個人化解析報告</h1>
    <div class="meta">學員：${escapeHtml_(safeName)} ｜ 版本：${escapeHtml_(safeVersion)} ｜ 產生時間：${escapeHtml_(nowText)}</div>
    <div class="content">${reportTextEscaped}</div>
  </body>
</html>
`;

  const pdfBlob = HtmlService.createHtmlOutput(html)
    .getBlob()
    .getAs(MimeType.PDF)
    .setName(
      "節奏工作法報告_" +
        Utilities.formatDate(
          new Date(),
          Session.getScriptTimeZone(),
          "yyyyMMdd_HHmmss",
        ) +
        ".pdf",
    );
  return pdfBlob;
}

function getOrCreateSubFolder_(parentFolder, name) {
  const iter = parentFolder.getFoldersByName(name);
  if (iter.hasNext()) return iter.next();
  return parentFolder.createFolder(name);
}

function saveReportRecord_(payload) {
  const ss = getOrCreateNamedSpreadsheet_(
    "問卷報告紀錄",
    "REPORT_RECORD_SHEET_ID",
  );

  const today = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd",
  );
  let sheet = ss.getSheetByName(today);
  if (!sheet) {
    sheet = ss.insertSheet(today);
    sheet.appendRow([
      "時間",
      "作答者姓名",
      "作答者電子郵件",
      "版本編號",
      "版本標題",
      "PDF檔案ID",
      "PDF檔案網址",
      "寄送收件者",
      "寄送副本(BCC)",
      "寄送前剩餘配額",
      "寄送後剩餘配額",
      "答案(JSON)",
      "AI回傳文字",
    ]);
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    payload.name || "",
    payload.email || "",
    payload.versionId || "",
    payload.versionTitle || "",
    payload.pdfFileId || "",
    payload.pdfFileUrl || "",
    payload.emailSentTo || "",
    payload.emailBcc || "",
    payload.mailQuotaBefore || "",
    payload.mailQuotaAfter || "",
    JSON.stringify(payload.answers || []),
    payload.reportText || "",
  ]);
}

/**
 * 檢查寄信授權與配額（手動執行或前端調用）
 */
function checkMailCapability() {
  try {
    const quota = MailApp.getRemainingDailyQuota();
    return {
      status: "OK",
      quota: quota,
      deployerEmail: "",
      message: "寄信權限可用",
    };
  } catch (e) {
    return {
      status: "ERROR",
      quota: -1,
      deployerEmail: "",
      message: e.toString(),
    };
  }
}

function escapeHtml_(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getOrCreateNamedSpreadsheet_(title, propertyKey) {
  const props = PropertiesService.getScriptProperties();
  const existingId = props.getProperty(propertyKey);
  if (existingId) {
    try {
      return SpreadsheetApp.openById(existingId);
    } catch (e) {
      // fallback to recreate below
    }
  }

  const ss = SpreadsheetApp.create(title);
  props.setProperty(propertyKey, ss.getId());
  return ss;
}

/**
 * 手動觸發授權用：請在 GAS 編輯器直接執行一次
 */
function authorizeRequiredScopes() {
  UrlFetchApp.fetch("https://www.googleapis.com/discovery/v1/apis", {
    method: "get",
    muteHttpExceptions: true,
  });
  MailApp.getRemainingDailyQuota();
  SpreadsheetApp.getActive();
  return "OK";
}
