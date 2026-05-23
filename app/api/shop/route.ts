import { BRANDS, PRODUCTS } from "@/lib/shop";
export async function GET() {
  return Response.json({ brands: BRANDS, products: PRODUCTS });
}
