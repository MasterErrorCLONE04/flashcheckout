import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const productCardVariants = cva(
  "relative overflow-hidden rounded-lg border transition-all hover:shadow-md",
  {
    variants: {
      layout: {
        vertical: "flex flex-col",
        horizontal: "grid grid-cols-1 md:grid-cols-3",
      },
      size: {
        sm: "max-w-xs",
        md: "max-w-sm",
        lg: "max-w-3xl",
      },
      emphasis: {
        default: "bg-background",
        featured: "bg-background ring-2 ring-primary/10",
      },
    },
    defaultVariants: {
      layout: "vertical",
      size: "md",
      emphasis: "default",
    },
  }
);

export interface ProductCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof productCardVariants> {}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ className, layout, size, emphasis, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(productCardVariants({ layout, size, emphasis }), className)}
      {...props}
    />
  )
);
ProductCard.displayName = "ProductCard";

const ProductCardImage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-hidden",
      "group-[[data-layout=vertical]]:aspect-square",
      "group-[[data-layout=horizontal]]:h-full group-[[data-layout=horizontal]]:min-h-[200px]",
      className
    )}
    {...props}
  />
));
ProductCardImage.displayName = "ProductCardImage";

const ProductCardBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground",
      className
    )}
    {...props}
  />
));
ProductCardBadge.displayName = "ProductCardBadge";

const ProductCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col p-4", className)} {...props} />
));
ProductCardContent.displayName = "ProductCardContent";

const ProductCardCategory = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-medium text-primary", className)}
    {...props}
  />
));
ProductCardCategory.displayName = "ProductCardCategory";

const ProductCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("line-clamp-1 text-xl font-semibold", className)}
    {...props}
  />
));
ProductCardTitle.displayName = "ProductCardTitle";

const ProductCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("mt-2 text-sm text-muted-foreground", className)}
    {...props}
  />
));
ProductCardDescription.displayName = "ProductCardDescription";

const ProductCardRating = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-1 flex items-center gap-1", className)}
    {...props}
  />
));
ProductCardRating.displayName = "ProductCardRating";

const ProductCardPrice = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-2", className)} {...props} />
));
ProductCardPrice.displayName = "ProductCardPrice";

const ProductCardPriceAmount = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-2xl font-bold", className)} {...props} />
));
ProductCardPriceAmount.displayName = "ProductCardPriceAmount";

const ProductCardPriceOriginal = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground line-through", className)}
    {...props}
  />
));
ProductCardPriceOriginal.displayName = "ProductCardPriceOriginal";

const ProductCardActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-4 flex items-center justify-between gap-2", className)}
    {...props}
  />
));
ProductCardActions.displayName = "ProductCardActions";

export {
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
};
