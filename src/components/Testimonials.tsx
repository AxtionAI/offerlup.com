import { Reveal } from "@/components/Reveal";

type Testimonial = {
  quote: string;
  name: string;
  location: string;
  tag: string;
};

const sellerTestimonials: Testimonial[] = [
  {
    quote:
      "I inherited my mom's house and just couldn't face fixing it up to list it. OfferLup handled everything — I had cash in hand in under two weeks.",
    name: "Monica R.",
    location: "Tampa, FL",
    tag: "Sold an inherited property",
  },
  {
    quote:
      "Watching investors bid against each other for my house was honestly kind of fun. My offer went up twice before closing, and it never once went down.",
    name: "Darnell W.",
    location: "Columbus, OH",
    tag: "Sold in 9 days",
  },
  {
    quote:
      "No repairs, no strangers walking through my home, no waiting on a buyer's financing to fall through. Just a number I could count on.",
    name: "Priya S.",
    location: "Mesa, AZ",
    tag: "Sold as-is",
  },
];

const investorTestimonials: Testimonial[] = [
  {
    quote:
      "I used to spend my weekends scrolling listing sites hoping something would pencil. Now deals that already fit my buy box just show up.",
    name: "Carlos M.",
    location: "San Antonio, TX",
    tag: "Buy box: single-family, 3+ bed",
  },
  {
    quote:
      "The auction is genuinely transparent — I can see I'm bidding against real competition, not a sales tactic. Won my last deal by a fair margin.",
    name: "Aaliyah T.",
    location: "Charlotte, NC",
    tag: "Won 4 auctions this year",
  },
  {
    quote:
      "Every deal already has ARV and rehab numbers pulled together before I even see it. That alone saves my team hours on every property.",
    name: "Ben K.",
    location: "Indianapolis, IN",
    tag: "Verified investor since 2024",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-cash-500" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  );
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-ink-100 bg-cream-50 p-7 shadow-sm">
      <Stars />
      <blockquote className="mt-4 flex-1 text-[15px] leading-6 text-ink-700">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {initialsOf(testimonial.name)}
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-900">{testimonial.name}</p>
          <p className="text-xs text-ink-500">
            {testimonial.location} · {testimonial.tag}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sellerTestimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 100}>
            <TestimonialCard testimonial={t} />
          </Reveal>
        ))}
      </div>
      <div className="mt-10 flex items-center gap-4">
        <div className="h-px flex-1 bg-ink-100" />
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">And from our investors</span>
        <div className="h-px flex-1 bg-ink-100" />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {investorTestimonials.map((t, i) => (
          <Reveal key={t.name} delay={i * 100}>
            <TestimonialCard testimonial={t} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
