/**
 * 處理 Web App GET 請求
 */
function doGet() {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .setTitle("AI 分析與行動建議")
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
