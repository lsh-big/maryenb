import { promisify } from "node:util";
import { crc32, deflateRaw } from "node:zlib";
import { orderStatusLabel } from "./order-status.js";

const compress = promisify(deflateRaw);
const sheetNamespace = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const officeRelationships = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const packageRelationships = "http://schemas.openxmlformats.org/package/2006/relationships";
const dateTime = new Intl.DateTimeFormat("sv-SE", {
  dateStyle: "short", timeStyle: "short", timeZone: "Asia/Seoul",
});
const columns = [
  ["주문번호", 44, (order) => order.orderNumber],
  ["주문일시 (한국 시간)", 24, (order) => dateTime.format(order.createdAt)],
  ["주문 상태", 19, orderStatusLabel],
  ["상품 및 수량", 64, (order) => order.items.map(({ productName, quantity }) => `${productName} × ${quantity}`).join(" / ")],
  ["총 수량", 11, (order) => order.items.reduce((sum, item) => sum + item.quantity, 0)],
  ["상품 금액 (원)", 17, (order) => Number(order.subtotal)],
  ["배송비 (원)", 15, (order) => Number(order.shippingFee)],
  ["주문 합계 (원)", 17, (order) => Number(order.total)],
  ["택배사", 18, (order) => order.carrier],
  ["송장번호", 24, (order) => order.trackingNumber],
  ["발송일시 (한국 시간)", 24, (order) => order.shippedAt && dateTime.format(order.shippedAt)],
];

function escapeXml(value) {
  return String(value ?? "").slice(0, 32767).toWellFormed()
    // XML 1.0 excludes most control characters and the two noncharacters in the BMP.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function worksheetRow(values, number) {
  const cells = values.map((value, column) => {
    const reference = String.fromCharCode(65 + column) + number;
    return typeof value === "number"
      ? `<c r="${reference}"><v>${value}</v></c>`
      : `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
  });
  return `<row r="${number}">${cells.join("")}</row>`;
}

// XLSX is a ZIP archive containing the workbook, worksheets, and their relationship metadata.
async function zip(entries) {
  const contents = [];
  const directory = [];
  let offset = 0;
  for (const [filename, xml] of entries) {
    const name = Buffer.from(filename);
    const data = Buffer.from(xml);
    const compressed = await compress(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(0x21, 12);
    local.writeUInt32LE(crc32(data), 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    contents.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    local.copy(central, 6, 4, 30);
    central.writeUInt32LE(offset, 42);
    directory.push(central, name);
    offset += local.length + name.length + compressed.length;
  }
  const centralDirectory = Buffer.concat(directory);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...contents, centralDirectory, end]);
}

export async function createOrderWorkbook(orders) {
  if (orders.length >= 1_048_576) throw new RangeError("Excel worksheet row limit exceeded");
  const rows = [worksheetRow(columns.map(([label]) => label), 1)];
  for (const order of orders) rows.push(worksheetRow(columns.map(([, , value]) => value(order)), rows.length + 1));
  const widths = columns.map(([, width], i) => `<col min="${i + 1}" max="${i + 1}" width="${width}" customWidth="1"/>`);
  const range = `A1:K${rows.length}`;
  return zip([
    ["[Content_Types].xml", `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
      <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
    </Types>`],
    ["_rels/.rels", `<Relationships xmlns="${packageRelationships}">
      <Relationship Id="rId1" Type="${officeRelationships}/officeDocument" Target="xl/workbook.xml"/>
    </Relationships>`],
    ["xl/workbook.xml", `<workbook xmlns="${sheetNamespace}" xmlns:r="${officeRelationships}">
      <bookViews><workbookView/></bookViews>
      <sheets><sheet name="주문 내역" sheetId="1" r:id="rId1"/></sheets>
    </workbook>`],
    ["xl/_rels/workbook.xml.rels", `<Relationships xmlns="${packageRelationships}">
      <Relationship Id="rId1" Type="${officeRelationships}/worksheet" Target="worksheets/sheet1.xml"/>
    </Relationships>`],
    ["xl/worksheets/sheet1.xml", `<worksheet xmlns="${sheetNamespace}">
      <dimension ref="${range}"/>
      <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
      <cols>${widths.join("")}</cols>
      <sheetData>${rows.join("")}</sheetData>
      <autoFilter ref="${range}"/>
    </worksheet>`],
  ]);
}
