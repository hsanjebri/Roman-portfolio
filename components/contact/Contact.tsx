import ContactForm from "./ContactForm";
import { SITE } from "@/lib/config";

export default function Contact() {
  return (
    <section id="contact" className="section section--night contact on-dark" data-bg="night" aria-labelledby="contact-title">
      <div className="wrap grid">
        <p className="kicker mono contact__kicker">
          <b>06</b> — Contact
        </p>
        <h2 id="contact-title" className="display contact__line" data-reveal="lines">
          Let&rsquo;s wait for the <em>light</em> together.
        </h2>
        <div className="contact__form">
          <ContactForm />
        </div>
        <dl className="contact__info mono">
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </dd>
          </div>
          <div>
            <dt>Instagram</dt>
            <dd>
              <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
                {SITE.instagram}
              </a>
            </dd>
          </div>
          <div>
            <dt>Based in</dt>
            <dd>{SITE.location} · 57.48° N</dd>
          </div>
          <div>
            <dt>Availability</dt>
            <dd>Commissions from November 2026</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
