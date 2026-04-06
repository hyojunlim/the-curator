import type { Config } from "tailwindcss";

const c = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary":                    c("primary"),
        "primary-fixed":              c("primary-fixed"),
        "primary-fixed-dim":          c("primary-fixed-dim"),
        "primary-container":          c("primary-container"),
        "on-primary":                 c("on-primary"),
        "on-primary-fixed":           c("on-primary-fixed"),
        "on-primary-fixed-variant":   c("on-primary-fixed-variant"),
        "on-primary-container":       c("on-primary-container"),
        "inverse-primary":            c("inverse-primary"),

        "secondary":                  c("secondary"),
        "secondary-fixed":            c("secondary-fixed"),
        "secondary-fixed-dim":        c("secondary-fixed-dim"),
        "secondary-container":        c("secondary-container"),
        "on-secondary":               c("on-secondary"),
        "on-secondary-fixed":         c("on-secondary-fixed"),
        "on-secondary-fixed-variant": c("on-secondary-fixed-variant"),
        "on-secondary-container":     c("on-secondary-container"),

        "tertiary":                   c("tertiary"),
        "tertiary-container":         c("tertiary-container"),
        "tertiary-fixed":             c("tertiary-fixed"),
        "tertiary-fixed-dim":         c("tertiary-fixed-dim"),
        "on-tertiary":                c("on-tertiary"),
        "on-tertiary-container":      c("on-tertiary-container"),
        "on-tertiary-fixed":          c("on-tertiary-fixed"),
        "on-tertiary-fixed-variant":  c("on-tertiary-fixed-variant"),

        "error":                      c("error"),
        "error-container":            c("error-container"),
        "on-error":                   c("on-error"),
        "on-error-container":         c("on-error-container"),

        "background":                 c("background"),
        "on-background":              c("on-background"),
        "surface":                    c("surface"),
        "surface-bright":             c("surface-bright"),
        "surface-dim":                c("surface-dim"),
        "surface-variant":            c("surface-variant"),
        "surface-tint":               c("surface-tint"),
        "surface-container-lowest":   c("surface-container-lowest"),
        "surface-container-low":      c("surface-container-low"),
        "surface-container":          c("surface-container"),
        "surface-container-high":     c("surface-container-high"),
        "surface-container-highest":  c("surface-container-highest"),
        "on-surface":                 c("on-surface"),
        "on-surface-variant":         c("on-surface-variant"),
        "inverse-surface":            c("inverse-surface"),
        "inverse-on-surface":         c("inverse-on-surface"),

        "outline":                    c("outline"),
        "outline-variant":            c("outline-variant"),
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
