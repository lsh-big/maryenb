export const reviewableOrder = {
  status: { in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] },
  paymentIssue: null,
};

export const validReviewId = (id) => typeof id === "string" && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(id);

export function reviewPurchaseFilter(productId, ownerId) {
  return { ...reviewableOrder, ownerId, items: { some: { productId } } };
}

export const reviewSelection = {
  id: true, rating: true, body: true, createdAt: true,
  photo: { select: { width: true, height: true } },
};
