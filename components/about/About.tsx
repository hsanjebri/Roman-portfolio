import Media from "@/components/ui/Media";
import CountUp from "./CountUp";
import { PUBLICATIONS } from "@/lib/content";
import type { Photo } from "@/lib/types";

const NUMBERS = [
  { to: 12, suffix: "", label: "Years in the field" },
  { to: 180, suffix: "+", label: "Species photographed" },
  { to: 9, suffix: "", label: "Countries" },
  { to: 40, suffix: "+", label: "Publications" },
] as const;

export default function About({ portrait }: { portrait: Photo | null }) {
  return (
    <section id="about" className="section section--bone" data-bg="bone" aria-labelledby="about-title">
      <div className="wrap grid about__grid">
        <figure className="about__portrait">
          {portrait ? (
            <Media photo={portrait} sizes="(min-width: 768px) 40vw, 84vw" />
          ) : (
            <div className="media media--empty" aria-hidden="true" />
          )}
          <figcaption className="cap">
            <span className="cap__no mono">PL. 00</span>
            <span className="cap__meta mono">In the hide · Cairngorms · before sunrise</span>
          </figcaption>
        </figure>

        <div className="about__body">
          <p className="kicker mono">
            <b>04</b> — About
          </p>
          <h2 id="about-title" className="sr-only">
            About Rowan Hawthorne
          </h2>
          <blockquote className="about__quote" data-reveal="lines">
            “The rare bird is rarely the hard part. The hard part is being there, quiet, on the morning it decides to
            show <em>itself</em>.”
          </blockquote>
          <div className="about__text" data-reveal="fade">
            <p>
              Rowan Hawthorne has spent twelve years in hides across Africa, the Arctic and the Americas — from the
              papyrus swamps where the shoebill hunts to the tundra edge where snowy owls winter. The work is known for
              rare birds, photographed patiently and almost always at first or last light.
            </p>
            <p>
              The method doesn&rsquo;t change: natural light only, no bait, no call playback, no flash, and a distance
              the animal chooses. If a bird changes what it is doing because of the camera, the picture isn&rsquo;t
              worth taking. Prints, commissions and field workshops follow the same rule.
            </p>
          </div>
          <p className="about__sign mono">Rowan Hawthorne — Inverness, 2026</p>
        </div>

        <dl className="numbers">
          {NUMBERS.map((n) => (
            <div key={n.label} className="number">
              <dt className="number__label mono">{n.label}</dt>
              <dd className="number__value">
                <CountUp to={n.to} suffix={n.suffix} />
              </dd>
            </div>
          ))}
        </dl>

        <div className="press">
          <p className="kicker mono">As seen in</p>
          <ul>
            {PUBLICATIONS.map((p) => (
              <li key={p} className="mono">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
