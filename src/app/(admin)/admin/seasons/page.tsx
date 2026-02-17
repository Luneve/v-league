import { listSeasons } from "@/lib/actions";
import { mapSeason } from "@/lib/mappers";
import { SeasonsClient } from "./client";

export default async function SeasonsPage() {
  const { data } = await listSeasons();
  const seasons = data ? data.map(mapSeason) : [];

  return <SeasonsClient initialSeasons={seasons} />;
}
