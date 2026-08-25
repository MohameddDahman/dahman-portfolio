import Link from "next/link";

const EMAIL = "medodahman454@gmail.com";

/** Closing plate. Contact first, because that is what a footer is for. */
export default function Footer() {
  return (
    <footer className="rule-t mt-24 bg-wash">
      <div className="shell py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <h2 className="t-h3">Available for frontend work</h2>
            <p className="measure mt-3 text-[1rem] leading-relaxed text-ink-2">
              Freelance or full-time. Send a sentence about what you&rsquo;re
              building and I&rsquo;ll reply within a working day.
            </p>
            <a href={"mailto:" + EMAIL} className="link mt-5 inline-block text-[1rem]">
              {EMAIL}
            </a>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3">
            <h3 className="t-label mb-1">Pages</h3>
            {[
              ["Home", "/"],
              ["Work", "/work"],
              ["About", "/about"],
              ["Contact", "/contact"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="link w-fit text-[0.95rem]">
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3">
            <h3 className="t-label mb-1">Elsewhere</h3>
            {[
              ["GitHub", "https://github.com"],
              ["LinkedIn", "https://linkedin.com"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="link w-fit text-[0.95rem]"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="rule-t mt-14 pt-6">
          <p className="t-label">
            Mohamed Dahman — {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
