"use client";
import Contact from "@/components/web/Contact";
import Expertise from "@/components/web/Expertise";
import Identity from "@/components/web/Identity";
import Navbar from "@/components/web/Navbar";
import Services from "@/components/web/Services";
import { useScroll, useTransform, motion } from "motion/react";

export default function Home() {
  const { scrollY } = useScroll();
  const x = useTransform(scrollY, [0, 2000], [0, -200]);
  const xP = useTransform(scrollY, [0, 2000], [0, 200]);
  const color = useTransform(scrollY, [0, 300], ["#777777", "#ffffff"]);

  return (
    <main className="overflow-x-hidden">
      <section className=" mx-auto px-6 md:px-20 flex min-h-[85vh] items-center overflow-hidden">
        <div>
          <motion.h1 style={{ x }} className="text-6xl md:text-9xl font-heading">
            DAHMAN
          </motion.h1>
          <motion.p style={{ x: xP, color }} className="text-[#777777] mt-10">
            I build things for the web
          </motion.p>
        </div>
      </section>
      <Identity />
      <Expertise />
      <Services />
      <Contact />
    </main>
  );
}