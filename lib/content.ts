import type { SeriesKey } from "./types";

export const SERIES: ReadonlyArray<{ key: SeriesKey; label: string }> = [
  { key: "birds", label: "Birds" },
  { key: "landscapes", label: "Landscapes" },
  { key: "wildlife", label: "Wildlife" },
  { key: "macro", label: "Macro" },
];

export const FILM_QUERIES: ReadonlyArray<{ query: string; title: string; place: string }> = [
  { query: "flamingos flying", title: "Rose over the salt pan", place: "Walvis Bay, Namibia" },
  { query: "river water flowing forest", title: "Water, still moving", place: "Olympic Peninsula, Washington" },
  { query: "forest fog", title: "The quiet between trees", place: "Białowieża Forest, Poland" },
  { query: "desert sand dunes wind", title: "The wind's handwriting", place: "Erg Chebbi, Morocco" },
  { query: "arctic snow landscape", title: "White hours", place: "Svalbard, Norway" },
  { query: "eagle flying", title: "Thermals", place: "Drakensberg, Lesotho" },
];

export const PUBLICATIONS = [
  "BBC Wildlife",
  "National Geographic",
  "Audubon",
  "GEO",
  "Outdoor Photography",
  "Wildlife Photographer of the Year — Portfolio",
] as const;
