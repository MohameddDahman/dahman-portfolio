import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell flex min-h-[72svh] flex-col justify-center pt-[20vh]">
      <span className="t-label">Error 404</span>
      <h1 className="t-display mt-6 max-w-[12ch] text-[clamp(2rem,4.8vw,3.4rem)] text-white">
        No world at this address
      </h1>
      <p className="t-body mt-6 max-w-[44ch] text-[15px]">
        The page you asked for isn&apos;t here. It may have moved, or the link
        may have been mistyped.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-8">
        <Link href="/" data-cursor="Home" className="btn">
          <span className="fill" />
          <span className="lbl t-label text-white">Back to the start</span>
          <span className="lbl">→</span>
        </Link>
        <Link
          href="/lab"
          data-cursor="Lab"
          className="t-label transition-colors duration-400 hover:text-white"
        >
          Or wander the lab →
        </Link>
      </div>
    </main>
  );
}
