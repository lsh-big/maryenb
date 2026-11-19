import Image from "next/image";

export function ProductArt({ imageUrl, category, code, alt = "", className = "", priority = false, sizes = "(max-width: 560px) 50vw, (max-width: 800px) 46vw, 290px" }) {
  if (imageUrl) {
    return (
      <div
        className={`product-art ${className}`}
        data-code={code}
        aria-label={alt || undefined}
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
        />
        <span className="product-art-caption">{code}</span>
      </div>
    );
  }

  return (
    <div
      className={`product-art product-art-placeholder ${className}`}
      data-code={code}
      aria-hidden="true"
    >
      <div className="art-glow" />
      <div className="art-bottle">
        <span className="art-cap" />
        <span className="art-label">MARYENB</span>
      </div>
      <span className="art-category">{category}</span>
    </div>
  );
}
