import type { OrganizationProfile } from "@/types";

export const mockCurrentOrg: OrganizationProfile = {
  id: "org-1",
  name: "Green Almaty",
  about: "Non-profit dedicated to urban ecology and green spaces in Almaty. We organize cleanup events, tree planting, and environmental education.",
  city: "Almaty",
  verified: true,
  links: {
    instagram: "https://instagram.com/greenalmaty",
    website: "https://greenalmaty.kz",
  },
  contacts: {
    telegram: "@greenalmaty",
    phone: "+7 (707) 123-4567",
  },
};

export const mockOrganizations: OrganizationProfile[] = [
  mockCurrentOrg,
  {
    id: "org-2",
    name: "Helping Hands KZ",
    about: "We connect volunteers with people in need across Kazakhstan.",
    city: "Almaty",
    verified: true,
    links: { website: "https://helpinghands.kz" },
    contacts: { telegram: "@helphandskz" },
  },
  {
    id: "org-3",
    name: "Care Foundation",
    about: "Supporting elderly communities through volunteer visits and care programs.",
    city: "Astana",
    verified: true,
    links: { instagram: "https://instagram.com/carefoundation" },
    contacts: { phone: "+7 (701) 555-0101" },
  },
  {
    id: "org-4",
    name: "Youth Initiative",
    about: "Empowering young people through social projects.",
    city: "Almaty",
    verified: false,
    links: {},
    contacts: { telegram: "@youthinitkz" },
  },
  {
    id: "org-5",
    name: "Animal Rescue Astana",
    about: "Rescuing and rehoming stray animals in the capital.",
    city: "Astana",
    verified: false,
    links: { instagram: "https://instagram.com/animalrescueastana" },
    contacts: { telegram: "@rescueastana", phone: "+7 (702) 333-4455" },
  },
];
