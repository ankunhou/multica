export type Locale = "en" | "zh";

export const locales: Locale[] = ["en", "zh"];

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
};

type FeatureSection = {
  label: string;
  title: string;
  description: string;
  cards: { title: string; description: string }[];
};

type FooterGroup = {
  label: string;
  links: { label: string; href: string }[];
};

type FeatureVisuals = {
  common: {
    demo: string;
    issueTitle: string;
    issueDescription: string;
    status: {
      backlog: string;
      todo: string;
      in_progress: string;
      in_review: string;
      done: string;
    };
    priority: {
      none: string;
      low: string;
      medium: string;
      high: string;
      urgent: string;
    };
  };
  teammates: {
    activity: string;
    subscribe: string;
    properties: string;
    status: string;
    priority: string;
    assignee: string;
    assignTo: string;
    unassigned: string;
    members: string;
    agents: string;
    assignedToClaude: string;
    statusChanged: string;
    comments: string[];
  };
  autonomous: {
    working: string;
    toolCalls: string;
    result: string;
    history: string;
    toolTimeline: {
      analyzing: string;
      issuePreview: string;
      editIssue: string;
      updatedErrors: string;
      checkingComments: string;
      commentPreview: string;
      testsPassed: string;
    };
    historyItems: {
      setupTypes: string;
      migrateIssue: string;
      migrateComment: string;
    };
  };
  skills: {
    title: string;
    files: string;
    items: {
      deploy: { name: string; description: string };
      migration: { name: string; description: string };
      review: { name: string; description: string };
      tests: { name: string; description: string };
    };
    doc: {
      title: string;
      description: string;
      stepsTitle: string;
      steps: string[];
    };
  };
  runtimes: {
    title: string;
    online: string;
    offline: string;
    range7d: string;
    range30d: string;
    range90d: string;
    input: string;
    output: string;
    cacheRead: string;
    cacheWrite: string;
    activity: string;
    weekdays: {
      mon: string;
      wed: string;
      fri: string;
    };
    less: string;
    more: string;
    dailyCost: string;
    dateMar18: string;
    dateMar25: string;
    dateMar31: string;
  };
};

export type LandingDict = {
  header: { github: string; login: string; dashboard: string; changelog: string };
  hero: {
    headlineLine1: string;
    headlineLine2: string;
    subheading: string;
    cta: string;
    downloadDesktop: string;
    worksWith: string;
    imageAlt: string;
  };
  features: {
    teammates: FeatureSection;
    autonomous: FeatureSection;
    skills: FeatureSection;
    runtimes: FeatureSection;
  };
  featureVisuals: FeatureVisuals;
  howItWorks: {
    label: string;
    headlineMain: string;
    headlineFaded: string;
    steps: { title: string; description: string }[];
    cta: string;
    ctaGithub: string;
    ctaDocs: string;
  };
  openSource: {
    label: string;
    headlineLine1: string;
    headlineLine2: string;
    description: string;
    cta: string;
    highlights: { title: string; description: string }[];
  };
  faq: {
    label: string;
    headline: string;
    items: { question: string; answer: string }[];
  };
  footer: {
    tagline: string;
    cta: string;
    groups: {
      product: FooterGroup;
      resources: FooterGroup;
      company: FooterGroup;
    };
    copyright: string;
  };
  about: {
    title: string;
    nameLine: {
      prefix: string;
      mul: string;
      tiplexed: string;
      i: string;
      nformationAnd: string;
      c: string;
      omputing: string;
      a: string;
      gent: string;
    };
    paragraphs: string[];
    cta: string;
  };
  changelog: {
    title: string;
    subtitle: string;
    toc: string;
    categories: {
      features: string;
      improvements: string;
      fixes: string;
    };
    entries: {
      version: string;
      date: string;
      title: string;
      changes: string[];
      features?: string[];
      improvements?: string[];
      fixes?: string[];
    }[];
  };
  download: {
    hero: {
      macArm64: {
        title: string;
        sub: string;
        primary: string;
        altZip: string;
      };
      macIntel: {
        title: string;
        sub: string;
        disabledCta: string;
        intelHint: string;
      };
      winX64: { title: string; sub: string; primary: string };
      winArm64: { title: string; sub: string; primary: string };
      linux: {
        title: string;
        sub: string;
        primary: string;
        altFormats: string;
      };
      unknown: { title: string; sub: string };
      safariMacHint: string;
      archFallbackHint: string;
    };
    allPlatforms: {
      title: string;
      macLabel: string;
      winX64Label: string;
      winArm64Label: string;
      linuxX64Label: string;
      linuxArm64Label: string;
      formatDmg: string;
      formatZip: string;
      formatExe: string;
      formatAppImage: string;
      formatDeb: string;
      formatRpm: string;
      intelNote: string;
      unavailable: string;
    };
    cli: {
      title: string;
      sub: string;
      installLabel: string;
      startLabel: string;
      sshNote: string;
      copyLabel: string;
      copiedLabel: string;
    };
    cloud: { title: string; sub: string };
    footer: {
      releaseNotes: string;
      allReleases: string;
      currentVersion: string;
      versionUnavailable: string;
    };
  };
};
