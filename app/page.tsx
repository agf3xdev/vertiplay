import { HomeClient } from "./HomeClient";
import { SERIES, trending, exclusives } from "@/lib/catalog";

export default function HomePage() {
  return (
    <HomeClient
      all={SERIES}
      trending={trending(8)}
      exclusives={exclusives(8)}
    />
  );
}
