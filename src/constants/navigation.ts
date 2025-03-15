export const PAGES = ["Home", "Devices", "Received", "History", "Settings", "About"] as const;
export type PageType = (typeof PAGES)[number];

export const PAGES_ARRAY: PageType[] = [...PAGES];
