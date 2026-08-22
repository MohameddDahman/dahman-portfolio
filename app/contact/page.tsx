"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";

import { api } from "@/convex/_generated/api";
import PageHead from "@/components/ui/PageHead";
import Panel from "@/components/ui/Panel";
import Magnetic from "@/components/motion/Magnetic";

const EMAIL = "medodahman454@gmail.com";

/**
 * Validation messages are instructions, not complaints — each one says
 * what to do rather than what went wrong.
 */
const schema = z.object({
  name: z.string().trim().min(1, "Add your name"),
  email: z.email("Use an address you can be reached at"),
  messageContent: z
    .string()
    .trim()
    .min(12, "A sentence or two — what are you building?"),
});

type Values = z.infer<typeof schema>;

const FIELDS = [
  { name: "name", label: "Name", placeholder: "Who is writing", type: "text", n: "01" },
  { name: "email", label: "Email", placeholder: "Where to reply", type: "email", n: "02" },
] as const;

const FAQ = [
  {
    q: "What does a project usually cost?",
    a: "It depends on scope, and I would rather scope it properly than quote a range that turns out to be wrong. Send a sentence about what you need and I will come back with a real number.",
  },
  {
    q: "Can you work with our designer?",
    a: "Yes, and it usually goes better. I am happy working from a Figma file, and equally happy filling the gaps a Figma file always leaves.",
  },
  {
    q: "Do you take on rescues?",
    a: "Often. A slow page or a build nobody wants to touch is a well-defined problem, and those are satisfying to fix.",
  },
  {
    q: "What if it is outside what you do?",
    a: "I will say so. That is faster for both of us than finding out three weeks in.",
  },
];

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const sendMessage = useMutation(api.messages.sendMessage);

  const form = useForm<Values>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: "", email: "", messageContent: "" },
  });

  function onSubmit(values: Values) {
    setFailed(false);
    startTransition(async () => {
      try {
        await sendMessage(values);
        form.reset();
        setSent(true);
      } catch {
        // Never swallow this. A form that silently drops a message is
        // worse than one that refuses to send.
        setFailed(true);
      }
    });
  }

  const errors = form.formState.errors;
  const status = sent ? "Delivered" : isPending ? "Sending" : "Ready";

  return (
    <main>
      <PageHead
        index="04"
        eyebrow="Bloom · The swarm follows you"
        title="Send a message"
        lede="Tell me what you're building and roughly when you need it. If it's outside what I do, I'll say so and point you somewhere better."
        meta={[
          ["Direct", EMAIL],
          ["Reply within", "One working day"],
          ["Working", "Remote, flexible hours"],
        ]}
      />

      <section className="shell grid gap-10 py-[4vh] lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <a
            href={"mailto:" + EMAIL}
            data-cursor="Email"
            className="group inline-flex items-center gap-2"
          >
            <span className="t-mono text-[12px] text-white">{EMAIL}</span>
            <span
              className="block h-px w-0 transition-all duration-500 group-hover:w-6"
              style={{ background: "var(--accent)" }}
            />
          </a>

          <p className="t-body mt-8 max-w-[38ch] text-[14.5px]">
            Prefer to skip the form? The address above goes to the same inbox
            and I read everything.
          </p>

          <Link
            href="/work"
            data-cursor="Work"
            className="t-label group mt-10 inline-flex items-center gap-2 transition-colors duration-400 hover:text-white"
          >
            <span className="transition-transform duration-400 group-hover:-translate-x-1">←</span>
            See the work first
          </Link>
        </div>

        <Panel className="p-7 md:p-10">
          <div className="relative mb-8 flex items-center justify-between border-b border-w08 pb-4">
            <span className="t-label">Message</span>
            <span className="t-label" style={{ color: sent ? "var(--accent)" : undefined }}>
              {status}
            </span>
          </div>

          {sent ? (
            <div className="relative py-10">
              <h2 className="t-display text-[clamp(1.4rem,2.6vw,2rem)] text-white">
                Message received
              </h2>
              <p className="t-body mt-4 max-w-sm text-[14.5px]">
                It&apos;s in the inbox. Expect a reply within a working day.
              </p>
              <button
                onClick={() => setSent(false)}
                data-cursor="Again"
                className="t-label group mt-8 inline-flex items-center gap-2 transition-colors duration-400 hover:text-white"
              >
                Write another
                <span className="transition-transform duration-400 group-hover:translate-x-1">→</span>
              </button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="relative space-y-8">
              {FIELDS.map((f) => (
                <div key={f.name}>
                  <div className="mb-2.5 flex items-baseline justify-between gap-4">
                    <label htmlFor={f.name} className="t-label flex items-baseline gap-2">
                      <span className="text-w30">{f.n}</span>
                      {f.label}
                    </label>
                    {errors[f.name] && (
                      <span className="t-mono text-[10px]" style={{ color: "var(--accent)" }}>
                        {errors[f.name]?.message}
                      </span>
                    )}
                  </div>
                  <input
                    id={f.name}
                    type={f.type}
                    autoComplete={f.name === "email" ? "email" : "name"}
                    aria-invalid={!!errors[f.name]}
                    placeholder={f.placeholder}
                    {...form.register(f.name)}
                    className="w-full border-b border-w08 bg-transparent pb-3 font-mono text-[13px] text-white outline-none transition-colors duration-300 placeholder:text-w30 focus:border-[var(--accent)] aria-[invalid=true]:border-[var(--accent)]"
                  />
                </div>
              ))}

              <div>
                <div className="mb-2.5 flex items-baseline justify-between gap-4">
                  <label htmlFor="messageContent" className="t-label flex items-baseline gap-2">
                    <span className="text-w30">03</span>
                    Message
                  </label>
                  {errors.messageContent && (
                    <span className="t-mono text-[10px]" style={{ color: "var(--accent)" }}>
                      {errors.messageContent.message}
                    </span>
                  )}
                </div>
                <textarea
                  id="messageContent"
                  rows={6}
                  aria-invalid={!!errors.messageContent}
                  placeholder="What you're building, and what you need from me"
                  {...form.register("messageContent")}
                  className="w-full resize-none border-b border-w08 bg-transparent pb-3 font-mono text-[13px] leading-relaxed text-white outline-none transition-colors duration-300 placeholder:text-w30 focus:border-[var(--accent)] aria-[invalid=true]:border-[var(--accent)]"
                />
              </div>

              {failed && (
                <p className="t-mono border border-w20 px-4 py-3 text-[11px] text-white">
                  The message didn&apos;t send. Check your connection and try
                  again, or email {EMAIL} directly.
                </p>
              )}

              <div className="flex justify-end pt-2">
                <Magnetic strength={0.18}>
                  <button
                    type="submit"
                    disabled={isPending}
                    data-cursor="Send"
                    className="btn disabled:cursor-wait disabled:opacity-55"
                  >
                    <span className="fill" />
                    <span className="lbl t-label text-white">
                      {isPending ? "Sending" : "Send message"}
                    </span>
                    <span className="lbl">→</span>
                  </button>
                </Magnetic>
              </div>
            </form>
          )}
        </Panel>
      </section>

      {/* ---- FAQ ---- */}
      <section className="shell py-[10vh]">
        <h2 className="t-label mb-8">Before you write</h2>
        <div className="rule mb-2" />

        <div>
          {FAQ.map((item) => (
            <details key={item.q} className="group border-b border-w08 py-6">
              <summary
                data-cursor="Open"
                className="flex cursor-pointer list-none items-baseline justify-between gap-8"
              >
                <span className="t-display text-[clamp(1.1rem,1.9vw,1.5rem)] text-white">
                  {item.q}
                </span>
                <span
                  className="t-mono shrink-0 text-[14px] transition-transform duration-400 group-open:rotate-45"
                  style={{ color: "var(--accent)" }}
                >
                  +
                </span>
              </summary>
              <p className="t-body mt-4 max-w-[60ch] text-[14.5px]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
