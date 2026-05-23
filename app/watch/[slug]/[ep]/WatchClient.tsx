"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VerticalPlayer } from "@/components/VerticalPlayer";
import type { Series } from "@/lib/catalog";

export function WatchClient({
  series,
  initialEpNumber,
}: {
  series: Series;
  initialEpNumber: number;
}) {
  const router = useRouter();
  const [ep, setEp] = useState(initialEpNumber);

  const episode = series.episodes.find((e) => e.number === ep)!;

  function next() {
    if (ep < series.totalEpisodes) {
      const n = ep + 1;
      setEp(n);
      window.history.replaceState(null, "", `/watch/${series.slug}/${n}`);
    }
  }
  function prev() {
    if (ep > 1) {
      const n = ep - 1;
      setEp(n);
      window.history.replaceState(null, "", `/watch/${series.slug}/${n}`);
    }
  }

  return (
    <VerticalPlayer
      series={series}
      episode={episode}
      onNext={next}
      onPrev={prev}
    />
  );
}
