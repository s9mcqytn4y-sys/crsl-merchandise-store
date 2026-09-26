import React from "react";
import ProductCard, { ProductData } from "../Common/ProductCard";

interface CardProductPreOrderProps {
    produk: ProductData;
}

export default function CardProductPreOrder({ produk }: CardProductPreOrderProps) {
    return (
        <div className="w-full max-w-[280px] sm:max-w-[300px]">
            <ProductCard produk={produk} />
        </div>
    );
}
