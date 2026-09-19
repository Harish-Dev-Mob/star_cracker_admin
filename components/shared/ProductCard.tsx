"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge, getStockVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart, type CartProduct } from "@/hooks/useCart";
import { toast } from "@/components/ui/Toast";
import { useTranslation } from "@/store/useI18n";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discountPrice?: number | null;
    images: string; // JSON string
    stock: number;
    isCombo?: boolean;
    isFeatured?: boolean;
    category?: { name: string };
  };
  className?: string;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(n);
}

function getDiscount(original: number, discounted: number) {
  return Math.round(((original - discounted) / original) * 100);
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const items = useCart((s) => s.items);
  const { t } = useTranslation();
  
  const parsedImages: string[] = (() => {
    try {
      return JSON.parse(product.images);
    } catch {
      return ["/images/products/placeholder.jpg"];
    }
  })();
  const mainImage = parsedImages[0] ?? "/images/products/placeholder.jpg";
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const outOfStock = product.stock === 0;

  const cartItem = items.find((i) => i.product.id === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    const cartProd: CartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discountPrice,
      images: parsedImages,
      stock: product.stock,
    };
    addItem(cartProd);
    toast.success("Added to cart", product.name);
  };

  const handleUpdateQty = (e: React.MouseEvent, newQty: number) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, newQty);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative flex flex-col rounded-3xl overflow-hidden",
        "bg-white dark:bg-gray-900 border-2 border-transparent hover:border-orange-100 dark:hover:border-orange-900/50",
        "shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(220,38,38,0.12)] dark:hover:shadow-[0_20px_40px_rgba(220,38,38,0.2)]",
        "transition-all duration-500 transform hover:-translate-y-2",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800">
        {/* Dark overlay on hover for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
        
        <Image
          src={mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/products/placeholder.jpg";
          }}
        />
        
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {hasDiscount && (
            <Badge variant="discount" className="shadow-lg backdrop-blur-md bg-red-600/90 text-yellow-300 border-none font-black tracking-wider uppercase text-[10px]">
              {getDiscount(product.price, product.discountPrice!)}% OFF
            </Badge>
          )}
          {product.isCombo && <Badge variant="combo" className="shadow-lg font-bold">Combo</Badge>}
          {product.isFeatured && <Badge variant="featured" className="shadow-lg font-bold">⭐ Popular</Badge>}
        </div>
        
        <div className="absolute top-3 right-3 z-20">
          <Badge variant={getStockVariant(product.stock)} className="shadow-lg font-bold">
            {outOfStock ? t.product.outOfStock : product.stock <= 10 ? `Only ${product.stock} left` : "In Stock"}
          </Badge>
        </div>
        
        {/* Quick Add Button (Visible on Hover) */}
        <div className="absolute bottom-4 left-0 right-0 px-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20 hidden md:block">
          {quantityInCart > 0 ? (
            <div className="flex items-center justify-between bg-white text-gray-900 shadow-xl rounded-xl h-11 px-2 border border-orange-100" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 border-none shadow-sm"
                onClick={(e) => handleUpdateQty(e, quantityInCart - 1)}
              >
                -
              </Button>
              <span className="font-bold w-8 text-center text-lg">{quantityInCart}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 border-none shadow-sm"
                onClick={(e) => handleUpdateQty(e, quantityInCart + 1)}
                disabled={quantityInCart >= product.stock}
              >
                +
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={outOfStock}
              variant="primary"
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 shadow-xl border-none font-bold rounded-xl h-11"
            >
              {outOfStock ? t.product.outOfStock : t.product.quickAdd}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 bg-white dark:bg-gray-900 relative z-20 border-t border-gray-100 dark:border-gray-800">
        {product.category && (
          <span className="text-[11px] font-bold uppercase tracking-widest text-orange-500 mb-1">
            {product.category.name}
          </span>
        )}
        <h3 className="text-base font-black text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-display tracking-tight mb-3">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 mt-auto">
          {hasDiscount ? (
            <>
              <span className="text-xl font-black text-red-600 drop-shadow-sm">
                {formatPrice(product.discountPrice!)}
              </span>
              <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-xl font-black text-gray-900 dark:text-white drop-shadow-sm">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Mobile Add to Cart (Always visible on mobile) */}
        <div className="mt-4 md:hidden">
          {quantityInCart > 0 ? (
            <div className="flex items-center justify-between bg-orange-50/50 shadow-inner rounded-xl h-11 px-2 border border-orange-200" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg bg-white text-orange-600 shadow-sm hover:bg-orange-100"
                onClick={(e) => handleUpdateQty(e, quantityInCart - 1)}
              >
                -
              </Button>
              <span className="font-black text-lg text-orange-700">{quantityInCart}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg bg-white text-orange-600 shadow-sm hover:bg-orange-100"
                onClick={(e) => handleUpdateQty(e, quantityInCart + 1)}
                disabled={quantityInCart >= product.stock}
              >
                +
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={outOfStock}
              variant={outOfStock ? "ghost" : "primary"}
              className="w-full rounded-xl font-bold h-11 shadow-md bg-gradient-to-r from-red-600 to-orange-500 border-none text-white"
            >
              {outOfStock ? t.product.outOfStock : t.product.addToCart}
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}
