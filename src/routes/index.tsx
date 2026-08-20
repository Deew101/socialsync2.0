import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  Instagram,
  Linkedin,
  Sparkles,
  Star,
  Twitter,
  Wand2,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  {
    icon: Calendar,
    title: "Visual scheduler",
    body: "Drag and drop posts onto a global calendar. Preview each network exactly as it will appear before you hit publish.",
  },
  {
    icon: BarChart3,
    title: "Unified analytics",
    body: "Compare engagement, reach, and follower growth across Instagram, X and LinkedIn in one normalized view.",
  },
  {
    icon: Wand2,
    title: "AI captions & hashtags",
    body: "Generate on-brand captions and trending hashtag sets in seconds. Refine the tone with a single click.",
  },
  {
    icon: Zap,
    title: "Multi-platform posting",
    body: "Compose once and tailor per network. Bulk upload, drag-and-drop scheduling, and drafts that actually stay organized.",
  },
];

const testimonials = [
  {
    name: "Maya R.",
    role: "Head of Social · Northwind",
    quote:
      "SocialSync replaced three tools for us. The calendar alone paid for itself in the first week.",
  },
  {
    name: "Devon K.",
    role: "Founder · Grainstore",
    quote:
      "AI captions get 80% of the way there. I spend minutes on posts that used to take an hour.",
  },
  {
    name: "Priya S.",
    role: "Marketing Lead · Loomtype",
    quote:
      "The analytics view finally lets me compare LinkedIn and Instagram side by side. Chef's kiss.",
  },
];

const faqs = [
  {
    q: "Which platforms does SocialSync support?",
    a: "Instagram, X (Twitter), and LinkedIn today. TikTok and YouTube Shorts are in private beta.",
  },
  {
    q: "Can I schedule posts to multiple accounts at once?",
    a: "Absolutely. Compose once, tailor the caption per network, and schedule to any combination of connected accounts.",
  },
  {
    q: "Is my data secure?",
    a: "We use industry-standard encryption at rest and in transit. You control which accounts are connected and can revoke access at any time.",
  },
  {
    q: "Do you offer team collaboration?",
    a: "Bring your whole team in with shared drafts, approval workflows, and role-based permissions.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Social<span className="text-primary">Sync</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#testimonials" className="hover:text-foreground">
              Testimonials
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
            <Link to="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                size="sm"
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-glow">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-24 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" /> New — AI captions, built in
          </div>
          <h1 className="mx-auto max-w-4xl text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            One command center for your{" "}
            <span className="text-gradient-primary">entire social presence</span>
            .
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Schedule, publish, and measure content across Instagram, X and
            LinkedIn — without the context switching, without the spreadsheets.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
              >
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> Instagram · X ·
              LinkedIn
            </span>
          </div>

          {/* Product mockup */}
          <div className="mx-auto mt-16 max-w-6xl">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-white/5">
              <div className="flex items-center gap-1.5 border-b border-border bg-background/40 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-4 text-xs text-muted-foreground">
                  socialsync.app / dashboard
                </span>
              </div>
              <div className="grid gap-4 p-6 text-left md:grid-cols-4">
                {[
                  { label: "Total reach", value: "142.8k", delta: "+8.2%" },
                  { label: "Scheduled", value: "12", delta: "Next: 4:00 PM" },
                  { label: "Engagement", value: "4.1%", delta: "steady" },
                  { label: "Followers", value: "52.4k", delta: "+412 this wk" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border bg-background/40 p-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold">{s.value}</p>
                    <p className="mt-1 text-xs text-primary">{s.delta}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 border-t border-border p-6 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-background/40 p-4 md:col-span-2">
                  <p className="text-sm font-semibold">Upcoming schedule</p>
                  <div className="mt-4 space-y-3">
                    {[
                      {
                        title:
                          "Excited to announce our new API integration features…",
                        meta: "LinkedIn & X · Jul 24, 10:00 AM",
                      },
                      {
                        title:
                          "Weekly roundup: Top 5 productivity hacks for teams…",
                        meta: "Instagram · Jul 25, 2:00 PM",
                      },
                    ].map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-md bg-gradient-primary/40 ring-1 ring-primary/30" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{r.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.meta}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <p className="text-sm font-semibold">Weekly performance</p>
                  <div className="mt-6 flex h-32 items-end gap-2">
                    {[40, 65, 50, 85, 70, 95, 60].map((h, i) => (
                      <div
                        key={i}
                        className="w-full rounded-t bg-gradient-to-t from-primary/30 to-primary"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform strip */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <Instagram className="h-6 w-6" />
            <Twitter className="h-6 w-6" />
            <Linkedin className="h-6 w-6" />
            <span className="text-sm">and more platforms every quarter</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Everything you need. Nothing you don't.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Built for modern marketing teams who care about craft as much as
              cadence.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-glow"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="border-t border-border bg-hero-glow py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Loved by teams that ship.
            </h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-foreground/90">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Frequently asked
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to know before signing up.
            </p>
          </div>
          <Accordion type="single" collapsible className="mt-12">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Ready to sync your social?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Bring every network into one workspace and ship content faster.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
              >
                Create your workspace <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-primary">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold">SocialSync</span>
            <span className="text-xs text-muted-foreground">
              © 2026. All rights reserved.
            </span>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Security
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
