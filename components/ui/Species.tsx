import type { Photo } from "@/lib/types";

/** "Shoebill, Balaeniceps rex" — the binomial kept in italic, never uppercased. */
export default function Species({ photo }: { photo: Pick<Photo, "common" | "latin"> }) {
  return (
    <>
      {photo.common}
      {photo.latin && (
        <>
          , <i className="latin">{photo.latin}</i>
        </>
      )}
    </>
  );
}
