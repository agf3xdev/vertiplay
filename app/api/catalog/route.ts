import { SERIES } from "@/lib/catalog";
export async function GET() {
  return Response.json({ series: SERIES.map(({ episodes, ...rest }) => rest) });
}
