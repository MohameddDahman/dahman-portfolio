"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useTransition } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

const messageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  messageContent: z.string().min(1),
});

type MessageValues = z.infer<typeof messageSchema>;

export default function Contact() {
  const [isPending, startTransition] = useTransition();
  const [isSent, setIsSent] = useState(false);
  const sendMessage = useMutation(api.messages.sendMessage);

  const form = useForm<MessageValues>({
    resolver: standardSchemaResolver(messageSchema),
    defaultValues: { name: "", email: "", messageContent: "" },
  });

  async function submitMessage(values: MessageValues) {
    startTransition(async () => {
      await sendMessage(values);
      form.reset();
      setIsSent(true);
      setTimeout(() => setIsSent(false), 2000);
    });
  }

  return (
    <section className="bg-[#0e0e0e] px-6 md:px-20 py-24">
      <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
        Get in touch.
      </h2>
      <p className="text-[#888] text-[15px] leading-relaxed max-w-sm mb-12">
        Available for technical architecture, frontend engineering, and building
        high-performance web experiences. Let&apos;s create something monolithically significant.
      </p>

      <form onSubmit={form.handleSubmit(submitMessage)} className="border-t border-[#222] pt-10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[#666] text-[11px] tracking-widest uppercase">Full Name</label>
            <input {...form.register("name")} placeholder="Jane Doe" className="w-full bg-transparent border border-[#2a2a2a] text-white text-[14px] px-4 py-3 rounded-sm placeholder:text-[#444] focus:outline-none focus:border-[#555] transition-colors" />
            {form.formState.errors.name && <p className="text-red-500 text-[12px]">Can't send an empty message</p>}
          </div>
          <div className="space-y-2">
            <label className="text-[#666] text-[11px] tracking-widest uppercase">Email Address</label>
            <input {...form.register("email")} type="email" placeholder="jane@example.com" className="w-full bg-transparent border border-[#2a2a2a] text-white text-[14px] px-4 py-3 rounded-sm placeholder:text-[#444] focus:outline-none focus:border-[#555] transition-colors" />
            {form.formState.errors.email && <p className="text-red-500 text-[12px]">Can't send an empty message</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[#666] text-[11px] tracking-widest uppercase">Message</label>
          <textarea {...form.register("messageContent")} placeholder="Describe your project goals and timeline..." rows={6} className="w-full bg-transparent border border-[#2a2a2a] text-white text-[14px] px-4 py-3 rounded-sm placeholder:text-[#444] focus:outline-none focus:border-[#555] transition-colors resize-none" />
          {form.formState.errors.messageContent && <p className="text-red-500 text-[12px]">Can't send an empty message</p>}
        </div>

        <div className="flex justify-end">
          <button disabled={isPending} type="submit" className="flex items-center gap-3 bg-white text-black text-[11px] tracking-widest uppercase font-semibold px-8 py-4 hover:bg-[#e0e0e0] transition-colors disabled:opacity-50">
            {isPending ? "Sending..." : isSent ? "Sent ✓" : "Send Message"}
            {!isPending && !isSent && <span>→</span>}
          </button>
        </div>
      </form>
    </section>
  );
}