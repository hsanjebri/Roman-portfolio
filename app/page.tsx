import About from "@/components/about/About";
import Contact from "@/components/contact/Contact";
import FeaturedSeries from "@/components/featured/FeaturedSeries";
import Films from "@/components/films/Films";
import Footer from "@/components/footer/Footer";
import RingGallery from "@/components/gallery/RingGallery";
import Hero from "@/components/hero/Hero";
import Nav from "@/components/nav/Nav";
import Preloader from "@/components/preloader/Preloader";
import Prints from "@/components/prints/Prints";
import { getFilms } from "@/lib/pexels";
import { getLibrary } from "@/lib/unsplash";

export const revalidate = 86400;

export default async function Home() {
  const [library, films] = await Promise.all([getLibrary(), getFilms()]);

  return (
    <>
      <Preloader />
      <Nav waitForHero />
      <main id="main">
        <Hero />

        <section id="work" className="section section--night on-dark" data-bg="night" aria-labelledby="work-title">
          <div className="wrap">
            <div className="grid section-head">
              <p className="kicker mono">
                <b>01</b> — Selected work
              </p>
              <h2 id="work-title" className="display" data-reveal="lines">
                Every image is a moment that <em>almost</em> didn&rsquo;t happen.
              </h2>
            </div>
            <RingGallery series={library.series} />
          </div>
        </section>

        {library.featured.length > 0 && <FeaturedSeries photos={library.featured} />}

        {films.length > 0 && (
          <section id="films" className="section section--night on-dark" data-bg="night" aria-labelledby="films-title">
            <div className="wrap">
              <div className="grid section-head">
                <p className="kicker mono">
                  <b>03</b> — Films
                </p>
                <h2 id="films-title" className="display" data-reveal="lines">
                  What a still frame <em>leaves out</em>.
                </h2>
                <p className="section-head__aside measure" data-reveal="fade">
                  Short field studies shot between photographs — wind in the reeds, water sliding over the salt flats at
                  first light. Previews play silently as you pass; open one to hear the place.
                </p>
              </div>
              <Films films={films} />
            </div>
          </section>
        )}

        <About portrait={library.portrait} />
        <Prints prints={library.prints} workshops={library.workshops} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
