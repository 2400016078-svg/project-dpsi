import * as XLSX from "xlsx";
import JSZip from "jszip";

// Shared by every admin bulk-import page (Data Master NISN, Kelola Soal, Kelola Jurusan)
// so .xlsx/.csv parsing and template generation behave identically everywhere.
export function readSpreadsheetFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    if (file.name.endsWith(".csv")) reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  });
}

// First numFmtId not reserved for a built-in format, per the OOXML convention every
// spreadsheet app follows for custom number formats.
const TEXT_NUMFMT_ID = 164;

function triggerBrowserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Builds an .xlsx template with a bold header row, sensible column widths, and
// (optionally) a "Text" number format on chosen columns so values like NISN keep their
// leading zeros — both in the example rows and in whatever the admin types below them.
//
// The `xlsx` package version used everywhere else in this app (SheetJS Community
// Edition) silently drops cell styling when *writing* .xlsx — verified empirically by
// writing a styled cell and inspecting the output, which contained only the default
// font with no style applied. So the workbook is built with SheetJS as usual, then the
// generated zip is patched in place with JSZip: a bold font + cellXf is added for the
// header row, and (if requested) an "@" text numFmt + cellXf is added and applied to
// both the target column's data cells and its column-wide default style.
//
// textColumnIndexes: 0-based column indexes (matching `headers`' order) that must be
// forced to Text format.
export async function downloadTemplate(filename, headers, exampleRows, colWidths, textColumnIndexes = []) {
  const ws = XLSX.utils.json_to_sheet(exampleRows, { header: headers });
  if (colWidths) ws["!cols"] = colWidths.map((wch) => ({ wch }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const zip = await JSZip.loadAsync(buf);

  let stylesXml = await zip.file("xl/styles.xml").async("string");

  const fontCount = parseInt(stylesXml.match(/<fonts count="(\d+)">/)[1]);
  const boldFontId = fontCount;
  stylesXml = stylesXml.replace(
    /<fonts count="\d+">([\s\S]*?)<\/fonts>/,
    (_, body) =>
      `<fonts count="${fontCount + 1}">${body}<font><b/><sz val="12"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts>`,
  );

  let xfCount = parseInt(stylesXml.match(/<cellXfs count="(\d+)">/)[1]);
  const boldXfId = xfCount++;
  let newXfs = `<xf numFmtId="0" fontId="${boldFontId}" fillId="0" borderId="0" xfId="0" applyFont="1"/>`;

  let textXfId = null;
  if (textColumnIndexes.length > 0) {
    if (/<numFmts count="\d+">/.test(stylesXml)) {
      stylesXml = stylesXml.replace(
        /<numFmts count="(\d+)">([\s\S]*?)<\/numFmts>/,
        (_, cnt, body) =>
          `<numFmts count="${parseInt(cnt) + 1}">${body}<numFmt numFmtId="${TEXT_NUMFMT_ID}" formatCode="@"/></numFmts>`,
      );
    } else {
      stylesXml = stylesXml.replace(
        /(<styleSheet[^>]*>)/,
        `$1<numFmts count="1"><numFmt numFmtId="${TEXT_NUMFMT_ID}" formatCode="@"/></numFmts>`,
      );
    }
    textXfId = xfCount++;
    newXfs += `<xf numFmtId="${TEXT_NUMFMT_ID}" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>`;
  }

  stylesXml = stylesXml.replace(
    /<cellXfs count="\d+">([\s\S]*?)<\/cellXfs>/,
    (_, body) => `<cellXfs count="${xfCount}">${body}${newXfs}</cellXfs>`,
  );
  zip.file("xl/styles.xml", stylesXml);

  let sheetXml = await zip.file("xl/worksheets/sheet1.xml").async("string");

  // Bold every header cell (row 1).
  sheetXml = sheetXml.replace(/<row r="1"([^>]*)>([\s\S]*?)<\/row>/, (_m, rowAttrs, rowContent) => {
    const patched = rowContent.replace(
      /<c r="([A-Z]+)1"([^>]*)>/g,
      (_cm, col, attrs) => `<c r="${col}1" s="${boldXfId}"${attrs.replace(/\s*s="\d+"/, "")}>`,
    );
    return `<row r="1"${rowAttrs}>${patched}</row>`;
  });

  // Force Text format on the requested columns: the column's own default style (so
  // anything the admin types below the examples stays Text too) plus every existing
  // example-row cell already written in that column.
  for (const colIdx of textColumnIndexes) {
    const colLetter = XLSX.utils.encode_col(colIdx);
    sheetXml = sheetXml.replace(
      new RegExp(`<col min="${colIdx + 1}" max="${colIdx + 1}"([^/]*)/>`),
      (_m, rest) => `<col min="${colIdx + 1}" max="${colIdx + 1}"${rest} style="${textXfId}"/>`,
    );
    sheetXml = sheetXml.replace(
      new RegExp(`<c r="${colLetter}(\\d+)"([^>]*)>`, "g"),
      (m, rowNum, attrs) =>
        rowNum === "1" ? m : `<c r="${colLetter}${rowNum}" s="${textXfId}"${attrs.replace(/\s*s="\d+"/, "")}>`,
    );
  }

  zip.file("xl/worksheets/sheet1.xml", sheetXml);

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  triggerBrowserDownload(blob, filename);
}
