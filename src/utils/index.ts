import { customAlphabet, urlAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";

export const cn = twMerge;

export const safeId = customAlphabet(urlAlphabet, 10);
