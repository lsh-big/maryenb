import sharp from "sharp";
import { reviewPhotoLimit, reviewTextLimit } from "./review-settings";

export class ReviewInputError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const multipartLimit = reviewPhotoLimit + 64 * 1024;

async function readForm(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data;") || !request.body) {
    throw new ReviewInputError("후기 입력 형식을 확인해 주세요.");
  }
  if (Number(request.headers.get("content-length")) > multipartLimit) {
    throw new ReviewInputError("사진은 5MB까지 첨부할 수 있습니다.", 413);
  }
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > multipartLimit) {
        void reader.cancel().catch(() => {});
        throw new ReviewInputError("사진은 5MB까지 첨부할 수 있습니다.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    return await new Response(Buffer.concat(chunks, size), { headers: { "Content-Type": contentType } }).formData();
  } catch {
    throw new ReviewInputError("후기 입력 형식을 확인해 주세요.");
  }
}

async function readPhoto(file) {
  if (file === null || (file instanceof File && !file.name && !file.size)) return undefined;
  if (!(file instanceof File) || !file.size) throw new ReviewInputError("사진 파일을 확인해 주세요.");
  if (file.size > reviewPhotoLimit) throw new ReviewInputError("사진은 5MB까지 첨부할 수 있습니다.", 413);
  try {
    const input = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 50_000_000 });
    const { format, pages } = await input.metadata();
    if (!["jpeg", "png", "webp"].includes(format) || (pages ?? 1) > 1) throw new Error("Unsupported photo");
    // Sharp strips metadata by default. Apply the original orientation before encoding.
    const { data, info } = await input.rotate().resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    return { image: data, width: info.width, height: info.height };
  } catch {
    throw new ReviewInputError("열 수 있는 JPG, PNG 또는 WebP 사진을 첨부해 주세요.");
  }
}

export async function readReview(request) {
  const form = await readForm(request);
  const rating = form.get("rating");
  const body = form.get("body");
  if (typeof rating !== "string" || !/^[1-5]$/.test(rating)) throw new ReviewInputError("별점 1점부터 5점까지 선택해 주세요.");
  if (typeof body !== "string" || !body.trim() || body.trim().length > reviewTextLimit || body.includes("\0")) {
    throw new ReviewInputError(`후기는 1자 이상 ${reviewTextLimit}자 이내로 입력해 주세요.`);
  }
  if (form.getAll("photo").length > 1) throw new ReviewInputError("사진은 한 장까지 첨부할 수 있습니다.");
  return { rating: Number(rating), body: body.trim(), photo: await readPhoto(form.get("photo")) };
}
