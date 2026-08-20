type ClassValue = string | false | null | undefined;

/** Minimal class joiner — no shadcn/clsx required. */
export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}
