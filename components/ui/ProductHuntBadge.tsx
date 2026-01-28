"use client";

import React from "react";

interface ProductHuntBadgeProps {
  className?: string;
  /** Defaults to the provided embed URL for Invoicr */
  href?: string;
  /** Defaults to the provided image URL for Invoicr */
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}

const ProductHuntBadge: React.FC<ProductHuntBadgeProps> = ({
  className = "",
  href = "https://www.producthunt.com/products/invoicr-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-invoicr-2",
  src = "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1069094&theme=light&t=1769589289707",
  alt = "Invoicr - Better invoices faster than ever | Product Hunt",
  width = 180,
  height = 24,
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label="View on Product Hunt"
    >
      <img alt={alt} width={width} height={height} src={src} />
    </a>
  );
};

export default ProductHuntBadge;


