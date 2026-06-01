import Image from "next/image";
import { ArrowUpRight, CircleDot, Sparkles } from "lucide-react";

import type { ProcessStep, Service, Work } from "@/types/home";

const services: Service[] = [
  {
    title: "Brand Experience",
    description: "把品牌主張轉成可被看見、參與與分享的體驗動線。",
    capabilities: ["品牌策略", "體驗企劃", "互動裝置", "活動敘事"],
  },
  {
    title: "Integrated Campaign",
    description: "串接社群、媒體、線下活動與銷售節點，形成完整傳播節奏。",
    capabilities: ["整合傳播", "KOL / PR", "媒體規劃", "成效追蹤"],
  },
  {
    title: "Creative Production",
    description: "從主視覺、內容製作到現場執行，維持品牌質感一致。",
    capabilities: ["KV / Motion", "影片製作", "展場內容", "現場導演"],
  },
];

const works: Work[] = [
  {
    title: "Launch Moment",
    category: "Product Campaign",
    description: "新品上市的沉浸首映，把話題、體驗與銷售導流集中在同一個高峰。",
    image: "/images/berry-work-launch.png",
  },
  {
    title: "Culture Signal",
    category: "Social Experience",
    description: "以社群語境設計可被轉傳的品牌場景，讓內容從現場自然擴散。",
    image: "/images/berry-work-content.png",
  },
  {
    title: "Retail Theatre",
    category: "OOH / Retail",
    description: "把門市、快閃與戶外媒體做成一段可被記住的品牌劇場。",
    image: "/images/berry-work-retail.png",
  },
];

const process: ProcessStep[] = [
  {
    phase: "01",
    title: "Insight",
    description: "釐清商業目標、TA 行為與市場語境，找出值得放大的品牌訊號。",
  },
  {
    phase: "02",
    title: "Narrative",
    description: "建立主張、腳本、視覺語彙與媒體節奏，讓每個接觸點說同一件事。",
  },
  {
    phase: "03",
    title: "Experience",
    description: "整合內容、空間、互動、KOL 與媒體，打造可以被參與的品牌時刻。",
  },
  {
    phase: "04",
    title: "Amplify",
    description: "追蹤聲量與成效，把現場體驗轉成後續內容、名單與長尾轉換。",
  },
];

export function HomeSections() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07080d] text-white">
      <SiteHeader />
      <HeroSection />
      <BrandExperienceSection />
      <ServicesSection />
      <SelectedWorksSection />
      <WhyBerrySection />
      <ProcessSection />
      <ContactCtaSection />
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#07080d]/55 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label="BERRY home">
          <span className="grid size-9 place-items-center rounded-sm bg-[#ff3d68] text-sm font-black text-white">
            B
          </span>
          <span className="leading-none">
            <span className="block text-sm font-semibold tracking-[0.28em]">
              BERRY
            </span>
            <span className="mt-1 block text-[11px] text-white/55">
              貝瑞整合行銷
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-xs uppercase tracking-[0.22em] text-white/60 md:flex">
          <a className="transition hover:text-white" href="#services">
            Services
          </a>
          <a className="transition hover:text-white" href="#works">
            Works
          </a>
          <a className="transition hover:text-white" href="#process">
            Process
          </a>
        </nav>
        <a
          href="#contact"
          className="inline-flex h-9 items-center gap-2 rounded-sm border border-white/15 px-3 text-xs uppercase tracking-[0.18em] text-white transition hover:border-[#ff3d68] hover:bg-[#ff3d68]"
        >
          Contact
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden px-4 pb-8 pt-24 sm:px-6 lg:px-8"
    >
      <Image
        src="/images/berry-hero.png"
        alt="Immersive abstract brand installation with luminous media surfaces"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover opacity-80"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,61,104,0.34),transparent_34%),linear-gradient(180deg,rgba(7,8,13,0.2)_0%,rgba(7,8,13,0.62)_52%,#07080d_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[linear-gradient(0deg,#07080d_0%,rgba(7,8,13,0)_100%)]" />
      <div className="mx-auto grid w-full max-w-[1480px] gap-10 lg:grid-cols-[1fr_0.32fr] lg:items-end">
        <div>
          <p className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.36em] text-white/70">
            <Sparkles className="size-4 text-[#ff3d68]" />
            BERRY Integrated Marketing
          </p>
          <h1 className="max-w-6xl text-[clamp(4.2rem,14vw,13.5rem)] font-black uppercase leading-[0.78] tracking-normal">
            Make Brands
            <span className="block text-white/35">Impossible</span>
            to Ignore.
          </h1>
        </div>
        <div className="mb-2 max-w-md border-l border-white/20 pl-5 text-lg leading-8 text-white/72 lg:mb-8">
          <p>
            貝瑞整合行銷為品牌打造沉浸式體驗、整合傳播與高記憶度內容，讓一次活動成為可延展的品牌資產。
          </p>
        </div>
      </div>
    </section>
  );
}

function BrandExperienceSection() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
      <div className="mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[0.58fr_1fr]">
        <div className="text-sm uppercase tracking-[0.3em] text-[#ff6d8c]">
          Brand Experience
        </div>
        <div>
          <h2 className="max-w-5xl text-[clamp(2.4rem,7vw,7.5rem)] font-black uppercase leading-[0.9] tracking-normal">
            從策略到現場，讓品牌變成一段可以被感受到的經驗。
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {["Presence", "Momentum", "Conversion"].map((item) => (
              <div
                key={item}
                className="border-t border-white/18 pt-5 text-sm text-white/62"
              >
                <span className="mb-4 block text-2xl font-semibold text-white">
                  {item}
                </span>
                品牌定位、內容節奏與行銷成效在同一套體驗系統中被設計與驗證。
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-10 flex items-end justify-between gap-6">
          <h2 className="text-5xl font-black uppercase tracking-normal sm:text-7xl">
            Services
          </h2>
          <p className="hidden max-w-sm text-sm leading-6 text-white/55 md:block">
            我們把策略、創意、內容、媒體與現場執行收斂成同一個品牌體驗。
          </p>
        </div>
        <div className="grid border-y border-white/12 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="group min-h-[430px] border-white/12 px-0 py-8 transition lg:border-r lg:px-8 lg:last:border-r-0"
            >
              <div className="flex items-center justify-between border-b border-white/12 pb-6">
                <h3 className="text-3xl font-semibold tracking-normal">
                  {service.title}
                </h3>
                <CircleDot className="size-5 text-[#ff3d68] transition group-hover:scale-125" />
              </div>
              <p className="mt-8 text-lg leading-8 text-white/68">
                {service.description}
              </p>
              <div className="mt-12 flex flex-wrap gap-2">
                {service.capabilities.map((capability) => (
                  <span
                    key={capability}
                    className="rounded-sm border border-white/12 bg-white/[0.04] px-3 py-2 text-xs text-white/62"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SelectedWorksSection() {
  return (
    <section id="works" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-[1480px]">
        <div className="sticky top-16 z-10 -mx-4 mb-8 border-y border-white/10 bg-[#07080d]/80 px-4 py-5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between">
            <h2 className="text-4xl font-black uppercase sm:text-6xl">
              Selected Works
            </h2>
            <span className="text-xs uppercase tracking-[0.28em] text-white/45">
              Scroll
            </span>
          </div>
        </div>
        <div className="space-y-8">
          {works.map((work, index) => (
            <article
              key={work.title}
              className="group grid min-h-[72svh] overflow-hidden border border-white/12 bg-white/[0.035] md:grid-cols-[0.82fr_1fr]"
            >
              <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-12">
                <div>
                  <p className="mb-5 text-xs uppercase tracking-[0.28em] text-[#ff6d8c]">
                    0{index + 1} / {work.category}
                  </p>
                  <h3 className="text-[clamp(3rem,9vw,8rem)] font-black uppercase leading-[0.82]">
                    {work.title}
                  </h3>
                </div>
                <p className="mt-10 max-w-xl text-xl leading-9 text-white/68">
                  {work.description}
                </p>
              </div>
              <div className="relative min-h-[420px] overflow-hidden">
                <Image
                  src={work.image}
                  alt={`${work.title} abstract campaign visual`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,8,13,0.65),rgba(7,8,13,0.05))]" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyBerrySection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
      <div className="mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <h2 className="text-[clamp(3rem,9vw,9rem)] font-black uppercase leading-[0.82]">
          Why
          <span className="block text-[#ff3d68]">BERRY</span>
        </h2>
        <div className="grid gap-4">
          {[
            "整合策略與執行，不讓創意停在提案裡。",
            "懂品牌，也懂媒體、內容、社群與現場限制。",
            "把漂亮的活動轉成可擴散、可追蹤、可累積的品牌資產。",
          ].map((reason) => (
            <p
              key={reason}
              className="border-t border-white/14 py-6 text-2xl leading-10 text-white/76"
            >
              {reason}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section id="process" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
        <h2 className="mb-12 text-5xl font-black uppercase sm:text-7xl">
          Process
        </h2>
        <div className="grid border-t border-white/12">
          {process.map((step) => (
            <article
              key={step.phase}
              className="grid gap-6 border-b border-white/12 py-8 md:grid-cols-[0.2fr_0.35fr_1fr] md:items-start"
            >
              <span className="text-sm text-[#ff6d8c]">{step.phase}</span>
              <h3 className="text-3xl font-semibold">{step.title}</h3>
              <p className="max-w-3xl text-xl leading-9 text-white/62">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCtaSection() {
  return (
    <section
      id="contact"
      className="relative isolate px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,61,104,0.22),transparent_36%)]" />
      <div className="mx-auto max-w-[1480px] border-y border-white/12 py-14">
        <p className="mb-6 text-sm uppercase tracking-[0.34em] text-white/55">
          Contact CTA
        </p>
        <div className="grid gap-10 lg:grid-cols-[1fr_0.42fr] lg:items-end">
          <h2 className="text-[clamp(3.5rem,11vw,11rem)] font-black uppercase leading-[0.8]">
            Build the next brand moment.
          </h2>
          <div>
            <p className="mb-8 text-xl leading-8 text-white/68">
              告訴我們你的品牌目標、上市時程或活動想像，BERRY 會把它整理成可執行的整合行銷路線。
            </p>
            <a
              href="mailto:hello@berry.im"
              className="inline-flex h-14 items-center gap-3 rounded-sm bg-white px-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#07080d] transition hover:bg-[#ff3d68] hover:text-white"
            >
              hello@berry.im
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
