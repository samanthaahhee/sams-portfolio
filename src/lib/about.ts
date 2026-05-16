/**
 * Single source of truth for the /about page (and any future
 * print/PDF variant). Edit copy here — the page and downloadable
 * artefacts read from this module.
 */

export type ExperienceEntry = {
  title: string;
  company: string;
  dates: string;
  location: string;
  context: string;
  featured?: boolean;
  bullets: string[];
};

export type Testimonial = {
  /** Leave empty / placeholder string until the real quote arrives.
   *  The tile renders a dashed-border placeholder when this is empty. */
  quote: string;
  name: string;
  role: string;
};

export const profile = {
  name: "Sam Ahhee Schneider",
  shortName: "Sam Ahhee",
  role: "Senior Product & Visual Designer",
  location: "Amsterdam, NL",
  email: "samantha.ahhee@gmail.com",
  phone: "+27 76 752 6436",
  links: {
    linkedin: "https://linkedin.com/in/samanthaahhee",
    portfolio: "https://sam-ahhee-portfolio.vercel.app",
  },
  headline: "Curious designer, image maker, storyteller.",
  subhead:
    "Senior product & visual designer with 13+ years across digital products, brand systems, and integrated campaigns — currently building HeyOtis (AI-powered communication app) at Ten 8 City in Amsterdam.",
  paragraph:
    "Senior product and visual designer with 13+ years across digital products, brand systems, and integrated campaigns. Currently designing and building HeyOtis — an AI-powered communication app — end-to-end at Ten 8 City. Previously led growth and brand design at Temper and creative direction across Beyond Meat, Recharge.com, and Saatchi & Saatchi global accounts. Strengths in design systems, component libraries, brand-to-product translation, and AI-integrated workflows.",
};

export const stats: { value: string; label: string }[] = [
  { value: "13+", label: "Years of design practice" },
  { value: "25+", label: "Brands shaped — FMCG, fintech, product, agency" },
  { value: "02", label: "Languages — English · Mandarin" },
  { value: "01", label: "Full-stack AI product in build — HeyOtis" },
];

export const experience: ExperienceEntry[] = [
  {
    title: "Full-Stack Designer",
    company: "Ten 8 City",
    dates: "Sept 2025 — Present",
    location: "Amsterdam · AI products & design",
    context: "Currently building HeyOtis",
    featured: true,
    bullets: [
      "HeyOtis — designed and built an AI-powered communication app for couples and professionals, end-to-end. Owned research, IA, UI, complete Figma design system (Fraunces / DM Sans), brand identity, hand-illustrated mascot (Scout), and AI conversation flows via the Anthropic Claude API on a Supabase backend with attention to POPIA compliance.",
      "Built and launched smallstitch.club — full visual identity, brand, and product.",
      "Generative AI experimentation across Claude Code, ElevenLabs, and OpenAI.",
    ],
  },
  {
    title: "Senior Visual Communications Designer",
    company: "Temper",
    dates: "Nov 2022 — Sept 2025",
    location: "Amsterdam · B2B/B2C flexible work marketplace",
    context: "Growth, systems, brand",
    bullets: [
      "Built and maintained scalable design systems and component libraries used across product and marketing surfaces.",
      "Led growth and conversion-focused design, working cross-functionally with product, marketing, and engineering.",
      "Owned end-to-end brand and visual communications from concept through production.",
      "Developed and maintained the product asset library, ensuring consistency across all touchpoints.",
    ],
  },
  {
    title: "Senior Art Director, EMEA",
    company: "Beyond Meat",
    dates: "Feb 2022 — Oct 2022",
    location: "Amsterdam · Plant-based FMCG",
    context: "Regional brand execution",
    bullets: [
      "Led regional brand execution for the EMEA market.",
      "Directed end-to-end packaging creative production across the EMEA portfolio.",
      "Developed scalable brand systems and guidelines used across regional teams.",
    ],
  },
  {
    title: "Senior Brand Designer",
    company: "Recharge.com",
    dates: "Sept 2020 — Feb 2022",
    location:
      "Amsterdam · Digital top-up marketplace · Partner clients: Google Play, Apple, PlayStation",
    context: "Multi-market brand systems",
    bullets: [
      "Built scalable brand systems and toolkits across the parent brand and 5 European subsidiaries (MobileTop.co.uk, Beltegoed.nl, Guthaben.de, Herladen.be, Recharge.fr).",
      "Led brand execution across product, marketing, and partner channels.",
      "Drove brand alignment across cross-functional product and marketing teams.",
    ],
  },
  {
    title: "Senior Art Director",
    company: "Saatchi & Saatchi",
    dates: "Aug 2019 — Oct 2020",
    location: "Cape Town · Clients: VISA, Standard Bank, Old Mutual Insurance",
    context: "Integrated, multi-market",
    bullets: [
      "Led integrated media launch design for flagship campaigns across multiple markets.",
      "Conceptualised and executed multi-market integrated campaigns spanning digital, OOH, social, and experiential.",
      "Developed large-scale creative experiences working with cross-functional teams.",
    ],
  },
  {
    title: "Senior Art Director",
    company: "BOS Brands",
    dates: "Jan 2018 — Jan 2019",
    location: "Cape Town · FMCG · BOS Ice Tea",
    context: "Retail + experiential",
    bullets: [
      "Led creative direction for BOS Ice Tea across retail and experiential channels.",
      "Designed and delivered retail, in-store, and event activation assets.",
      "Managed packaging design and launch campaigns for new product ranges.",
    ],
  },
  {
    title: "Senior Art Director",
    company: "Leo Burnett",
    dates: "Jul 2016 — Jan 2018",
    location:
      "Cape Town · Clients: VISA, TOTAL, Philip Morris, Standard Bank, Old Mutual, Mutual & Federal",
    context: "Cross-channel storytelling",
    bullets: [
      "Developed strategic concepts and key visuals for integrated campaigns across digital, print, and OOH.",
      "Designed across a wide range of platforms with focus on cohesive cross-channel storytelling.",
      "Created and visualised experiential brand activations.",
    ],
  },
  {
    title: "Mid-Weight & Junior Designer",
    company: "Radar Advertising",
    dates: "Oct 2012 — Jul 2016",
    location:
      "Cape Town · Acquired by Leo Burnett · Promoted Junior → Mid-Weight 2014",
    context: "Foundations",
    bullets: [
      "Supported campaign development and brand roll-outs across multiple accounts.",
      "Produced campaign creative, marketing collateral, and pitch materials.",
      "Clients: VISA, Standard Bank, Old Mutual, Mutual & Federal, TOTAL.",
    ],
  },
];

/* Placeholder testimonials — empty `quote` renders as dashed placeholder
 * tile. Paste real LinkedIn recommendations to swap each one in. */
export const testimonials: Testimonial[] = [
  {
    quote: "",
    name: "[Recommender name]",
    role: "[Role · Company]",
  },
  {
    quote: "",
    name: "[Recommender name]",
    role: "[Role · Company]",
  },
  {
    quote: "",
    name: "[Recommender name]",
    role: "[Role · Company]",
  },
  {
    quote: "",
    name: "[Recommender name]",
    role: "[Role · Company]",
  },
];

export const skills: string[] = [
  "Product Design",
  "UX/UI Design",
  "Design Systems",
  "Component Libraries",
  "Brand Identity",
  "Information Architecture",
  "Prototyping",
  "User Research",
  "Accessibility (WCAG)",
  "Design Tokens",
  "Growth & Conversion Design",
  "Brand Systems",
  "Creative Direction",
  "Art Direction",
  "Packaging Design",
  "Integrated Campaigns",
  "AI-Integrated Workflows",
];

export const tools: string[] = [
  "Figma",
  "Adobe Creative Suite",
  "Procreate",
  "Claude Code",
  "Anthropic Claude API",
  "Supabase",
  "GitHub",
  "ElevenLabs",
  "OpenAI API",
];

export const education: { title: string; institution: string; year: string }[] =
  [
    {
      title: "BTech, Graphic Design",
      institution: "Cape Peninsula University of Technology",
      year: "2013",
    },
    {
      title: "Design Systems",
      institution: "Memorisely",
      year: "2024",
    },
    {
      title: "Social Media Marketing & Web Design",
      institution: "University of Cape Town (short courses)",
      year: "2015 · 2017",
    },
  ];

export const languages: { name: string; level: string }[] = [
  { name: "English", level: "Native" },
  { name: "Mandarin", level: "Limited Working" },
];

export const downloads = {
  pdf: { href: "/files/Sam_Schneider_CV.pdf", label: "Styled PDF" },
  docx: { href: "/files/Sam_Schneider_CV.docx", label: "Plain DOCX (for ATS uploads)" },
};
