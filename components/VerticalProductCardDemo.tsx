import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";

import {
  ProductCard,
  ProductCardImage,
  ProductCardBadge,
  ProductCardContent,
  ProductCardCategory,
  ProductCardTitle,
  ProductCardDescription,
  ProductCardRating,
  ProductCardPrice,
  ProductCardPriceAmount,
  ProductCardPriceOriginal,
  ProductCardActions,
} from "@/components/product-card";

export function VerticalProductCardDemo() {
  return (
    <ProductCard
      layout="vertical"
      size="md"
      data-layout="vertical"
      className="group"
    >
      <ProductCardImage>
        <ProductCardBadge>New</ProductCardBadge>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full"
        >
          <Heart className="h-5 w-5" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
        <Image
          src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"
          alt="Product image"
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          priority
        />
      </ProductCardImage>
      <ProductCardContent>
        <ProductCardCategory>Electronics</ProductCardCategory>
        <ProductCardTitle>
          Wireless Noise-Cancelling Headphones
        </ProductCardTitle>
        <ProductCardRating>
          <Star className="h-4 w-4 fill-primary text-primary" />
          <Star className="h-4 w-4 fill-primary text-primary" />
          <Star className="h-4 w-4 fill-primary text-primary" />
          <Star className="h-4 w-4 fill-primary text-primary" />
          <Star className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">(42)</span>
        </ProductCardRating>
        <ProductCardActions>
          <ProductCardPrice>
            <ProductCardPriceAmount>$299.99</ProductCardPriceAmount>
            <ProductCardPriceOriginal>$349.99</ProductCardPriceOriginal>
          </ProductCardPrice>
          <Button size="sm">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to cart
          </Button>
        </ProductCardActions>
      </ProductCardContent>
    </ProductCard>
  );
}
