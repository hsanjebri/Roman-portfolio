import Link from "next/link";
import { SITE } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="footer on-dark">
      <div className="wrap">
        <p className="footer__mark" aria-hidden="true">
          Rowan Haw<em>thorne</em>
        </p>
        <div className="grid footer__grid mono">
          <p>© 2026 {SITE.name}</p>
          <nav aria-label="Footer">
            <a href="/#work">Work</a>
            <a href="/#films">Films</a>
            <a href="/#about">About</a>
            <a href="/#prints">Prints</a>
            <a href="/#contact">Contact</a>
            <Link href="/credits">Image &amp; film credits</Link>
          </nav>
          <p className="footer__concept">
            Concept project — design &amp; development by{" "}
            <a href={SITE.author.url} target="_blank" rel="noopener noreferrer">
              {SITE.author.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
