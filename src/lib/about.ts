/**
 * Single source of truth for the /about page (and any future
 * print/PDF variant). Edit copy here — the page and downloadable
 * artefacts read from this module.
 */

export type ExperienceEntry = {
  title: string;
  /** Compact title for the roadmap detail H3, e.g. "Visual Comms
   *  Designer" rather than the full job title. */
  shortTitle: string;
  company: string;
  /** Year-range only pill label — ≤ 10 chars, e.g. "2025—Now". */
  yearPill: string;
  dates: string;
  location: string;
  context: string;
  featured?: boolean;
  /** Short paragraph shown in the roadmap detail stage. */
  description: string;
  bullets: string[];
  /** Role thumbnail rendered in the roadmap image stage. */
  image: { src: string; alt: string };
};

export type Testimonial = {
  /** Quote body. Empty string renders as a dashed placeholder. */
  quote: string;
  /** Recommender name. */
  name: string;
  /** Recommender role + company / title line. */
  role: string;
  /** Optional context (e.g. "managed Sam directly", "worked with Sam on the same team"). */
  relationship?: string;
  /** Optional date string (e.g. "Mar 2018", "Nov 2024"). */
  date?: string;
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
    shortTitle: "Full-Stack Designer",
    company: "Ten 8 City",
    yearPill: "2025—Now",
    dates: "Sept 2025 — Present",
    location: "Amsterdam · AI products & design",
    context: "Currently building HeyOtis",
    featured: true,
    description:
      "Eight roles across thirteen years. Currently building AI-native products at Ten 8 City — scroll back through the work, all the way to the first junior role at Radar Advertising in Cape Town.",
    bullets: [
      "Designing and shipping HeyOtis end-to-end — research, IA, design system, brand, Claude API conversation flows.",
      "Built and launched smallstitch.club — full visual identity, brand, and product.",
      "Generative AI experimentation across Claude Code, ElevenLabs, and OpenAI.",
    ],
    image: { src: "/about/roadmap-ten8.svg", alt: "Ten 8 City placeholder artwork" },
  },
  {
    title: "Senior Visual Communications Designer",
    shortTitle: "Visual Comms Designer",
    company: "Temper",
    yearPill: "2022—25",
    dates: "Nov 2022 — Sept 2025",
    location: "Amsterdam · B2B/B2C flexible work marketplace",
    context: "Growth, systems, brand",
    description:
      "Senior Visual Communications Designer at Temper — Amsterdam-based B2B/B2C flexible work marketplace. Three years building systems and shipping growth-led work.",
    bullets: [
      "Built and maintained design systems and component libraries across product and marketing surfaces.",
      "Led growth and conversion-focused design, working cross-functionally with product, marketing, and engineering.",
      "Owned end-to-end brand and visual communications from concept through production.",
    ],
    image: { src: "/about/roadmap-temper.svg", alt: "Temper placeholder artwork" },
  },
  {
    title: "Senior Art Director, EMEA",
    shortTitle: "Senior Art Director, EMEA",
    company: "Beyond Meat",
    yearPill: "2022",
    dates: "Feb 2022 — Oct 2022",
    location: "Amsterdam · Plant-based FMCG",
    context: "Regional brand execution",
    description:
      "Beyond Meat — Amsterdam. Led regional brand execution across the EMEA market for the global plant-based FMCG.",
    bullets: [
      "Led regional brand execution for the EMEA market.",
      "Directed end-to-end packaging creative production across the EMEA portfolio.",
      "Developed scalable brand systems and guidelines used across regional teams.",
    ],
    image: { src: "/about/roadmap-beyondmeat.svg", alt: "Beyond Meat placeholder artwork" },
  },
  {
    title: "Senior Brand Designer",
    shortTitle: "Senior Brand Designer",
    company: "Recharge.com",
    yearPill: "2020—22",
    dates: "Sept 2020 — Feb 2022",
    location:
      "Amsterdam · Digital top-up marketplace · Partner clients: Google Play, Apple, PlayStation",
    context: "Multi-market brand systems",
    description:
      "Recharge.com — Amsterdam. Built brand systems across the parent brand and five European subsidiaries, working with Google Play, Apple, and PlayStation as partner clients.",
    bullets: [
      "Built scalable brand systems across the parent brand and 5 European subsidiaries (UK, NL, DE, BE, FR).",
      "Led brand execution across product, marketing, and partner channels.",
      "Drove brand alignment across cross-functional product and marketing teams.",
    ],
    image: { src: "/about/roadmap-recharge.svg", alt: "Recharge.com placeholder artwork" },
  },
  {
    title: "Senior Art Director",
    shortTitle: "Senior Art Director",
    company: "Saatchi & Saatchi",
    yearPill: "2019—20",
    dates: "Aug 2019 — Oct 2020",
    location: "Cape Town · Clients: VISA, Standard Bank, Old Mutual Insurance",
    context: "Integrated, multi-market",
    description:
      "Saatchi & Saatchi — Cape Town. Integrated multi-market campaigns for VISA, Standard Bank, and Old Mutual Insurance.",
    bullets: [
      "Led integrated media launch design for flagship campaigns across multiple markets.",
      "Conceptualised and executed multi-market integrated campaigns spanning digital, OOH, social, and experiential.",
      "Developed large-scale creative experiences working with cross-functional teams.",
    ],
    image: { src: "/about/roadmap-saatchi.svg", alt: "Saatchi & Saatchi placeholder artwork" },
  },
  {
    title: "Senior Art Director",
    shortTitle: "Senior Art Director",
    company: "BOS Brands",
    yearPill: "2018—19",
    dates: "Jan 2018 — Jan 2019",
    location: "Cape Town · FMCG · BOS Ice Tea",
    context: "Retail + experiential",
    description:
      "BOS Brands — Cape Town. Creative direction for BOS Ice Tea across retail and experiential channels.",
    bullets: [
      "Led creative direction for BOS Ice Tea across retail and experiential channels.",
      "Designed and delivered retail, in-store, and event activation assets.",
      "Managed packaging design and launch campaigns for new product ranges.",
    ],
    image: { src: "/about/roadmap-bos.svg", alt: "BOS Brands placeholder artwork" },
  },
  {
    title: "Senior Art Director",
    shortTitle: "Senior Art Director",
    company: "Leo Burnett",
    yearPill: "2016—18",
    dates: "Jul 2016 — Jan 2018",
    location:
      "Cape Town · Clients: VISA, TOTAL, Philip Morris, Standard Bank, Old Mutual, Mutual & Federal",
    context: "Cross-channel storytelling",
    description:
      "Leo Burnett — Cape Town. Cross-channel storytelling across VISA, TOTAL, Philip Morris, Standard Bank, Old Mutual, Mutual & Federal.",
    bullets: [
      "Developed strategic concepts and key visuals for integrated campaigns across digital, print, and OOH.",
      "Designed across a wide range of platforms with focus on cohesive cross-channel storytelling.",
      "Created and visualised experiential brand activations.",
    ],
    image: { src: "/about/roadmap-leoburnett.svg", alt: "Leo Burnett placeholder artwork" },
  },
  {
    title: "Mid-Weight & Junior Designer",
    shortTitle: "Mid-Weight & Junior Designer",
    company: "Radar Advertising",
    yearPill: "2012—16",
    dates: "Oct 2012 — Jul 2016",
    location:
      "Cape Town · Acquired by Leo Burnett · Promoted Junior → Mid-Weight 2014",
    context: "Foundations",
    description:
      "Radar Advertising — Cape Town. Foundations. Started as Junior in 2012, promoted to Mid-Weight in 2014. Acquired by Leo Burnett during tenure.",
    bullets: [
      "Supported campaign development and brand roll-outs across multiple accounts.",
      "Produced campaign creative, marketing collateral, and pitch materials.",
      "Clients: VISA, Standard Bank, Old Mutual, Mutual & Federal, TOTAL.",
    ],
    image: { src: "/about/roadmap-radar.svg", alt: "Radar Advertising placeholder artwork" },
  },
];

/* LinkedIn recommendations. Ordered newest → oldest. */
export const testimonials: Testimonial[] = [
  {
    quote:
      "I had the pleasure of working closely with Sam during my time at Temper, and she’s one of those rare designers who combines creative excellence with strategic thinking. She consistently brings fresh energy and high standards to everything she works on, with a sharp eye for visual detail and a strong sense of how design contributes to the bigger picture.\n\nWhat stands out most is her ability to lead with initiative — she doesn’t wait to be asked. Whether it’s shaping design direction, connecting her work to broader product goals, or initiating new ideas, Sam steps forward with clarity and purpose. She’s also a highly collaborative teammate, involving others early, staying open to feedback, and always looking for ways to make the work better.\n\nIf you’re looking for a designer who takes ownership, thinks big, and cares deeply about quality and impact, Sam is someone you want on your team.",
    name: "Love Sootalu",
    role: "User Experience",
    relationship: "Love managed Sam directly",
    date: "Jul 2025",
  },
  {
    quote:
      "Sam is a super creative designer and one I had the pleasure of hiring and managing during her time at Recharge. She consistently delivered work that elevated our brand and pushed it forward, bringing real creative muscle to the team.\n\nShe’s also a great mentor and was a huge support to me in growing the team. Whether leading on big projects or rolling up her sleeves to tackle the details, Sam brought fresh ideas, energy, and a drive to get things done.\n\nI’d recommend Sam to any team looking for a talented creative who makes a real impact.",
    name: "Ross Cumming",
    role: "Chief of Staff · Strategy, Communication, PR, Corporate Narrative & M&A transformation",
    relationship: "Ross managed Sam directly",
    date: "Nov 2024",
  },
  {
    quote:
      "Sam was great to work with, always positive and willing to bounce ideas off of, while still managing to solve her own problems and come up with well-designed solutions. As a team member, she was invaluable. She’s got all the skills needed, but more than that, she is a positive asset to have and is always raising the office morale.",
    name: "Claire Shaban",
    role: "Freelance Senior Digital Art Director · Cape Town",
    relationship: "Claire worked with Sam on the same team",
    date: "Oct 2022",
  },
  {
    quote:
      "Having worked with Sam as her CD for the past 6 years I can tell you that there is no one more dedicated or hard working. When the brief changes at the last minute she’s able to pull rabbits out of thin air and deliver great design in the limited time. And, when given the chance to craft her work, her designs are standout, well thought out and out the box. The quintessential millennial means she’s also always got her fingers on the pulse of the target market. I wish her all the best in the future.",
    name: "David Jennions",
    role: "Freelance Copywriter, Creative Director, Creative Strategist & BIG ideas acolyte",
    relationship: "David managed Sam directly",
    date: "Mar 2018",
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
