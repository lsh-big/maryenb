"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { reviewPhotoLimit, reviewPhotoTypes, reviewTextLimit } from "../lib/review-settings";
import { useAuth } from "./auth-provider";

const ratings = [1, 2, 3, 4, 5];
const dateFormat = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" });

async function fetchReviews(url, options) {
  const response = await fetch(url, { cache: "no-store", ...options });
  if (response.status === 204) return null;
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

export function ProductReviews({ slug, enabled }) {
  return <section id="reviews" className="detail-chapter product-reviews" tabIndex={-1} aria-labelledby="reviews-title">
    <h2 id="reviews-title">구매 후기</h2>
    {enabled ? <ReviewPanel slug={slug} /> : <p>결제가 확인된 회원은 상품에 별점과 사진 후기를 남길 수 있습니다.</p>}
  </section>;
}

function ReviewPanel({ slug }) {
  const { user, loading } = useAuth();
  const userId = user?.id;
  const endpoint = `/api/reviews/${encodeURIComponent(slug)}`;
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    const controller = new AbortController();
    fetchReviews(endpoint, { signal: controller.signal })
      .then(setData)
      .catch(() => {
        if (!controller.signal.aborted) setError("구매 후기를 불러오지 못했습니다.");
      });
    return () => controller.abort();
  }, [endpoint, loading, userId]);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    if (form.get("photo")?.size > reviewPhotoLimit) {
      setError("사진은 5MB까지 첨부할 수 있습니다.");
      return;
    }
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const { review } = await fetchReviews(endpoint, { method: "POST", body: form });
      setData((current) => ({ ...current, permission: "written", reviews: [review, ...current.reviews] }));
      setRating(0);
      setFeedback("후기가 등록되었습니다.");
    } catch (failure) {
      setError(failure.message || "후기 등록을 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteReview() {
    if (busy || !window.confirm("후기와 첨부 사진을 삭제할까요?")) return;
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await fetchReviews(endpoint, { method: "DELETE" });
      setData(await fetchReviews(endpoint));
      setFeedback("후기가 삭제되었습니다.");
    } catch (failure) {
      setError(failure.message || "후기 삭제를 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function loadMore() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await fetchReviews(`${endpoint}?cursor=${encodeURIComponent(data.nextCursor)}`);
      setData((current) => ({ ...result, reviews: [...current.reviews, ...result.reviews] }));
    } catch (failure) {
      setError(failure.message || "후기 목록을 다시 불러와 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    {error && <p role="alert">{error}</p>}
    {feedback && <p role="status">{feedback}</p>}
    {!data && !error && <p role="status">구매 후기를 불러오는 중입니다.</p>}
    {data?.permission === "login" && <Link className="text-link" href={`/login?next=${encodeURIComponent(`/products/${slug}#reviews`)}`}>로그인하고 후기 쓰기</Link>}
    {data?.permission === "purchase" && <p>이 상품의 결제가 확인되면 후기를 쓸 수 있습니다.</p>}
    {data?.permission === "written" && <div className="review-written">
      <p>이 상품에 남긴 후기가 있습니다.</p>
      <button className="button" type="button" disabled={busy} onClick={deleteReview}>내 후기 삭제</button>
    </div>}
    {data?.permission === "write" && <form className="review-form" onSubmit={submit}>
      <fieldset className="review-rating">
        <legend>별점</legend>
        <div>
          {ratings.map((value) => <label key={value} className={value <= rating ? "review-star-selected" : undefined}>
            <input className="sr-only" type="radio" name="rating" value={value} aria-label={`${value}점`}
              checked={value === rating} required onChange={() => setRating(value)} />
            <Star aria-hidden="true" size={22} fill="currentColor" />
          </label>)}
        </div>
      </fieldset>
      <label>후기<textarea name="body" required maxLength={reviewTextLimit} rows={4} placeholder="제품을 사용한 경험을 적어 주세요." /></label>
      <label>사진 첨부 (선택)
        <input type="file" name="photo" accept={reviewPhotoTypes.join(",")} aria-describedby="review-photo-help" />
      </label>
      <small id="review-photo-help">JPG·PNG·WebP 1장, 최대 5MB. 후기와 사진은 상품 페이지에 공개됩니다.</small>
      <button className="button button-dark" disabled={busy}>{busy ? "등록 중…" : "후기 등록"}</button>
    </form>}
    {data?.reviews.length === 0 && <p>아직 등록된 구매 후기가 없습니다.</p>}
    {data?.reviews.map((review) => <article className="review-entry" key={review.id}>
      <div className="review-entry-meta">
        <span className="review-entry-stars" role="img" aria-label={`별점 5점 중 ${review.rating}점`}>
          {ratings.map((value) => <Star key={value} aria-hidden="true" size={15} fill={value <= review.rating ? "currentColor" : "none"} />)}
        </span>
        <span>구매 회원</span>
        <time dateTime={review.createdAt}>{dateFormat.format(new Date(review.createdAt))}</time>
      </div>
      <p>{review.body}</p>
      {review.photo && <Image src={`/api/reviews/photo/${review.id}`} alt="구매 회원이 첨부한 후기 사진"
        width={review.photo.width} height={review.photo.height} unoptimized className="review-photo" />}
    </article>)}
    {data?.nextCursor && <button className="button review-more" type="button" disabled={busy} onClick={loadMore}>후기 더 보기</button>}
  </>;
}
