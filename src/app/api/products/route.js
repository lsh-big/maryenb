import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { serializeProduct } from "../../../lib/products";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "24", 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 24;

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        ...(featured === "true" ? { isFeatured: true } : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json(products.map(serializeProduct));
  } catch (error) {
    console.error("제품 목록 조회에 실패했습니다.", error);
    return NextResponse.json(
      { error: "제품 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
