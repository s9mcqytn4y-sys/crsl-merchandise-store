import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility helper menggabungkan classnames dengan Tailwind Merge dan Clsx.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
