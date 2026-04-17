import Link from "next/link";
import { Button } from "../ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-10 py-4">
      <Link href="/"><h1 className="font-body text-white text-2xl">MD</h1></Link>
      <Link href="/contact">
        <Button className="rounded-none bg-white py-1 px-4 cursor-pointer">
          <span className="text-black text-sm">Get In Touch</span>
        </Button>
      </Link>
    </nav>
  );
}