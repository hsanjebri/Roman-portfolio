import type { Metadata } from "next";
import Footer from "@/components/footer/Footer";
import Nav from "@/components/nav/Nav";
import { SITE } from "@/lib/config";
import { withUtm } from "@/lib/image";
import { getFilms } from "@/lib/pexels";
import { allPhotos, getLibrary } from "@/lib/unsplash";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Credits — Rowan Hawthorne",
  description: "Photographers and videographers whose work appears on this concept site.",
};

export default async function Credits() {
  const [library, films] = await Promise.all([getLibrary(), getFilms()]);
  const photos = allPhotos(library);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      <Nav />
      <main id="main" className="page-plain" data-bg="bone">
        <div className="wrap">
          <div className="grid section-head">
            <p className="kicker mono">Colophon</p>
            <h1 className="display" data-reveal="lines">
              Image &amp; film <em>credits</em>
            </h1>
            <p className="section-head__aside measure">
              {SITE.name} is a fictional photographer; this is a concept project. The photographs are by the Unsplash
              photographers below and the films by Pexels videographers — thank you to each of them. Titles, places and
              dates on the plates are part of the fiction; camera data is the photographers&rsquo; own EXIF.
            </p>
          </div>

          <section className="credits__section grid" aria-labelledby="c-photos">
            <h2 id="c-photos" className="credits__group mono">
              Photographs · {pad(photos.length)}
            </h2>
            <ol className="credits__list">
              {photos.map((p, i) => (
                <li key={p.id}>
                  <span className="mono">{pad(i + 1)}</span>
                  <em>{p.title}</em>
                  <span className="mono">
                    <a href={withUtm(p.credit.url, SITE.utm)} target="_blank" rel="noopener noreferrer">
                      {p.credit.name}
                    </a>{" "}
                    on{" "}
                    <a href={withUtm(p.sourceUrl, SITE.utm)} target="_blank" rel="noopener noreferrer">
                      Unsplash
                    </a>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="credits__section grid" aria-labelledby="c-films">
            <h2 id="c-films" className="credits__group mono">
              Films · {pad(films.length)}
            </h2>
            <ol className="credits__list">
              {films.map((f, i) => (
                <li key={f.id}>
                  <span className="mono">{pad(i + 1)}</span>
                  <em>{f.title}</em>
                  <span className="mono">
                    <a href={f.credit.url} target="_blank" rel="noopener noreferrer">
                      {f.credit.name}
                    </a>
                    {f.credit.platform === "Pexels" && (
                      <>
                        {" "}
                        on{" "}
                        <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer">
                          Pexels
                        </a>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="credits__section grid" aria-labelledby="c-hero">
            <h2 id="c-hero" className="credits__group mono">
              Hero film
            </h2>
            <p className="credits__note">
              Hero landing clip (Alcedo atthis) from the thinkingods.com hero demo. Type set in Bodoni Moda, Hanken Grotesk and IBM
              Plex Mono. Design &amp; development by{" "}
              <a href={SITE.author.url} target="_blank" rel="noopener noreferrer">
                {SITE.author.name}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
