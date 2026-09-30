import Media from "@/components/ui/Media";
import type { Photo } from "@/lib/types";

export default function Prints({ prints, workshops }: { prints: Photo | null; workshops: Photo | null }) {
  return (
    <section id="prints" className="section section--bone" data-bg="bone" aria-labelledby="prints-title">
      <div className="wrap">
        <div className="grid section-head">
          <p className="kicker mono">
            <b>05</b> — Prints &amp; workshops
          </p>
          <h2 id="prints-title" className="display" data-reveal="lines">
            Take the <em>quiet</em> home, or come and find it.
          </h2>
        </div>

        <div className="grid offer-grid">
          <article className="offer">
            {prints && <Media photo={prints} className="offer__media" sizes="(min-width: 768px) 46vw, 100vw" />}
            <p className="cap__no mono">Edition I</p>
            <h3>
              Fine art <em>prints</em>
            </h3>
            <p>
              Selected plates printed by hand on archival cotton paper, signed and numbered. Each image is released once,
              in a single edition of twenty-five — when it sells out, it is gone.
            </p>
            <dl className="mono">
              <dt>Edition</dt>
              <dd>Limited to 25</dd>
              <dt>Paper</dt>
              <dd>Hahnemühle Photo Rag 308 gsm</dd>
              <dt>Sizes</dt>
              <dd>30 × 40 · 50 × 70 · 70 × 100 cm</dd>
              <dt>From</dt>
              <dd>£280</dd>
            </dl>
            <a href="#contact" className="link-arrow" data-subject="prints">
              Enquire <span aria-hidden="true">→</span>
            </a>
          </article>

          <article className="offer">
            {workshops && <Media photo={workshops} className="offer__media" sizes="(min-width: 768px) 46vw, 100vw" />}
            <p className="cap__no mono">Season 2026</p>
            <h3>
              Field <em>workshops</em>
            </h3>
            <p>
              Small groups of four, in the field before sunrise. We work from hides in the Cairngorms and on the Isle of
              Mull, on fieldcraft first — reading light, wind and behaviour — and camera settings second.
            </p>
            <dl className="mono">
              <dt>Group</dt>
              <dd>Four people maximum</dd>
              <dt>Places</dt>
              <dd>Cairngorms · Isle of Mull</dd>
              <dt>Sessions</dt>
              <dd>Sunrise, two days</dd>
              <dt>Season</dt>
              <dd>October — March</dd>
            </dl>
            <a href="#contact" className="link-arrow" data-subject="workshop">
              Enquire <span aria-hidden="true">→</span>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
