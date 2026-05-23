import { SERIES, GENRES } from "@/lib/catalog";
import { BrowseClient } from "./BrowseClient";

export default function BrowsePage() {
  return <BrowseClient series={SERIES} genres={GENRES} />;
}
