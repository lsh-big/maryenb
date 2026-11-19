import { isVirtualDatabase } from "../../../../../lib/database-mode";
import { prisma } from "../../../../../lib/prisma";
import { reviewableOrder, validReviewId } from "../../../../../lib/reviews";

export async function GET(_request, { params }) {
  const { id } = await params;
  if (isVirtualDatabase() || !process.env.DATABASE_URL || !validReviewId(id)) return new Response(null, { status: 404 });
  try {
    const photo = await prisma.reviewPhoto.findUnique({
      where: { reviewId: id, review: { order: reviewableOrder, product: { isActive: true } } },
      select: { image: true },
    });
    if (!photo) return new Response(null, { status: 404 });
    return new Response(photo.image, { headers: {
      "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store",
    } });
  } catch {
    return new Response(null, { status: 503 });
  }
}
