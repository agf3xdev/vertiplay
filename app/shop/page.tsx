import { BRANDS, PRODUCTS, PRODUCT_CATEGORIES } from "@/lib/shop";
import { SERIES } from "@/lib/catalog";
import { ShopHubClient } from "./ShopHubClient";

export default function ShopHubPage() {
  return (
    <ShopHubClient
      brands={BRANDS}
      products={PRODUCTS}
      categories={PRODUCT_CATEGORIES}
      series={SERIES}
    />
  );
}
