export type ProjectStatus = "WIP" | "Live" | "Archived";

export type Project = {
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  tags: string[];
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
};

export type ValidationErrors = Record<string, string>;

export type ProjectFormData = {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  tags: string;
  status: ProjectStatus;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  order: number;
};

export type SiteContent = {
  brand: {
    name: string;
  };
  hero: {
    title: string;
    titleAccent: string;
    subtitle: string;
    scrollLabel: string;
  };
  about: {
    heading: string;
    text: string;
  };
  contact: {
    heading: string;
    text: string;
    email: string;
    buttonText: string;
  };
  footer: {
    text: string;
    subtext: string;
  };
};
