import Link from "next/link";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[60svh] flex-col justify-center py-24">
      <p className="t-label">Error 404</p>
      <h1 className="t-hero measure-wide mt-5">Nothing at this address</h1>
      <p className="t-lead measure mt-6">
        The page you asked for isn&rsquo;t here. It may have moved, or the link
        may have been mistyped.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/" className="btn">
          Back to the start
        </Link>
        <Link href="/work" className="btn btn-quiet">
          See the work
        </Link>
      </div>
    </section>
  );
}
