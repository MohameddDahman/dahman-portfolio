"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";

import { api } from "@/convex/_generated/api";
import PageHead from "@/components/ui/PageHead";
import { Reveal } from "@/components/motion/Reveal";

const EMAIL = "medodahman454@gmail.com";

/** Messages are instructions: each says what to do, not what went wrong. */
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
  {
    name: "name",
    label: "Your name",
    type: "text",
    autoComplete: "name",
    hint: null,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    hint: "So I can reply.",
  },
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
    a: "Often. A slow page, or a build nobody wants to touch, is a well-defined problem — and those are satisfying to fix.",
  },
];

export default function ContactPage() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const sendMessage = useMutation(api.messages.sendMessage);

  const form = useForm<Values>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { name: "", email: "", messageContent: "" },
  });

  // Send focus to the error summary when a submit fails, so a keyboard or
  // screen-reader user is told what happened instead of being left on a
  // button that appears to have done nothing.
  useEffect(() => {
    if (failed) errorRef.current?.focus();
  }, [failed]);

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

  return (
    <>
      <PageHead
        eyebrow="Contact"
        title="Send a message"
        lead="Tell me what you're building and roughly when you need it. If it's outside what I do, I'll say so and point you somewhere better."
      />

      <section className="shell grid gap-14 pb-20 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
        <Reveal>
          <h2 className="t-label">Or just email me</h2>
          <a href={"mailto:" + EMAIL} className="link mt-4 block text-[1.125rem]">
            {EMAIL}
          </a>
          <p className="measure mt-6 text-[1rem] leading-relaxed text-ink-2">
            Same inbox as the form, and I read everything. Replies usually go
            out within a working day.
          </p>
          <Link href="/work" className="link mt-8 inline-block text-[1rem]">
            ← See the work first
          </Link>
        </Reveal>

        <Reveal delay={60}>
          {sent ? (
            <div className="card p-8">
              <h2 className="t-h3">Message received</h2>
              <p className="measure mt-3 text-[1rem] leading-relaxed text-ink-2">
                It&rsquo;s in the inbox. Expect a reply within a working day.
              </p>
              <button
                onClick={() => setSent(false)}
                className="btn btn-quiet mt-8"
              >
                Write another
              </button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-8">
              {failed && (
                <div
                  ref={errorRef}
                  tabIndex={-1}
                  role="alert"
                  className="border border-ink p-4 text-[0.95rem]"
                >
                  The message didn&rsquo;t send. Check your connection and try
                  again, or email {EMAIL} directly.
                </div>
              )}

              {FIELDS.map((f) => (
                <div key={f.name}>
                  <label
                    htmlFor={f.name}
                    className="block font-[family-name:var(--font-display)] text-[1rem] font-medium"
                  >
                    {f.label}
                  </label>
                  {f.hint && (
                    <p id={f.name + "-hint"} className="mt-1 text-[0.9rem] text-ink-3">
                      {f.hint}
                    </p>
                  )}
                  <input
                    id={f.name}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    aria-invalid={!!errors[f.name]}
                    aria-describedby={
                      [errors[f.name] ? f.name + "-error" : null, f.hint ? f.name + "-hint" : null]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                    {...form.register(f.name)}
                    className="mt-3 min-h-[48px] w-full border border-edge bg-paper px-4 text-[1rem] text-ink outline-none transition-colors duration-200 focus:border-ink aria-[invalid=true]:border-ink"
                  />
                  {errors[f.name] && (
                    <p id={f.name + "-error"} className="mt-2 text-[0.9rem] text-ink">
                      <span className="mark">{errors[f.name]?.message}</span>
                    </p>
                  )}
                </div>
              ))}

              <div>
                <label
                  htmlFor="messageContent"
                  className="block font-[family-name:var(--font-display)] text-[1rem] font-medium"
                >
                  What are you building?
                </label>
                <textarea
                  id="messageContent"
                  rows={7}
                  aria-invalid={!!errors.messageContent}
                  aria-describedby={
                    errors.messageContent ? "messageContent-error" : undefined
                  }
                  {...form.register("messageContent")}
                  className="mt-3 w-full resize-y border border-edge bg-paper p-4 text-[1rem] leading-relaxed text-ink outline-none transition-colors duration-200 focus:border-ink aria-[invalid=true]:border-ink"
                />
                {errors.messageContent && (
                  <p id="messageContent-error" className="mt-2 text-[0.9rem] text-ink">
                    <span className="mark">{errors.messageContent.message}</span>
                  </p>
                )}
              </div>

              <button type="submit" disabled={isPending} className="btn disabled:opacity-60">
                {isPending ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </Reveal>
      </section>

      <section className="rule-t bg-wash">
        <div className="shell py-20">
          <Reveal>
            <h2 className="t-h2">Before you write</h2>
          </Reveal>

          <dl className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
            {FAQ.map((item, i) => (
              <Reveal key={item.q} delay={i * 50}>
                <dt className="t-h3">{item.q}</dt>
                <dd className="measure mt-3 text-[1rem] leading-relaxed text-ink-2">
                  {item.a}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
