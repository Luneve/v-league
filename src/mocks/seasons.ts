import type { Season, MiniGroup } from "@/types";

export const mockCurrentSeason: Season = {
  id: "season-1",
  startDate: "2026-01-01",
  endDate: "2026-03-31",
  durationDays: 90,
  active: true,
};

export const mockSeasons: Season[] = [
  mockCurrentSeason,
  {
    id: "season-0",
    startDate: "2025-10-01",
    endDate: "2025-12-31",
    durationDays: 90,
    active: false,
  },
];

export const mockMiniGroup: MiniGroup = {
  id: "group-1",
  league: "silver",
  seasonId: "season-1",
  members: [
    { volunteerId: "vol-10", name: "Azamat S.", points: 320, rank: 1 },
    { volunteerId: "vol-11", name: "Nurlan K.", points: 290, rank: 2 },
    { volunteerId: "vol-1", name: "Alex N.", points: 245, rank: 3 },
    { volunteerId: "vol-12", name: "Daniyar M.", points: 230, rank: 4 },
    { volunteerId: "vol-13", name: "Kamila T.", points: 210, rank: 5 },
    { volunteerId: "vol-14", name: "Ruslan O.", points: 195, rank: 6 },
    { volunteerId: "vol-15", name: "Ainur B.", points: 180, rank: 7 },
    { volunteerId: "vol-16", name: "Sanzhar E.", points: 165, rank: 8 },
    { volunteerId: "vol-17", name: "Zarina I.", points: 150, rank: 9 },
    { volunteerId: "vol-18", name: "Aibek R.", points: 140, rank: 10 },
    { volunteerId: "vol-19", name: "Gulnaz Y.", points: 130, rank: 11 },
    { volunteerId: "vol-20", name: "Baurzhan P.", points: 120, rank: 12 },
    { volunteerId: "vol-21", name: "Saltanat H.", points: 110, rank: 13 },
    { volunteerId: "vol-22", name: "Erbol G.", points: 95, rank: 14 },
    { volunteerId: "vol-23", name: "Aizhan D.", points: 80, rank: 15 },
    { volunteerId: "vol-24", name: "Kanat W.", points: 70, rank: 16 },
    { volunteerId: "vol-25", name: "Dinara F.", points: 55, rank: 17 },
    { volunteerId: "vol-26", name: "Medet V.", points: 40, rank: 18 },
    { volunteerId: "vol-27", name: "Symbat L.", points: 25, rank: 19 },
    { volunteerId: "vol-28", name: "Adil Z.", points: 10, rank: 20 },
  ],
};
