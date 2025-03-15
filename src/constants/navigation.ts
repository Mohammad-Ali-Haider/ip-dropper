export const PAGES = ["Home", "Devices", "Received", "History", "Settings", "About"] as const;
export type PageType = (typeof PAGES)[number];

// If you need a mutable version of PAGES somewhere
export const PAGES_ARRAY: PageType[] = [...PAGES];
