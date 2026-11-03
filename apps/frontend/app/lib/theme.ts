/**
 * SOFA-CLOUD — Theme Loader
 * Charge le theme.config.json côté serveur et expose les tokens au frontend.
 */

import themeConfig from "../../../../shared/config/theme.config.json";

export type ThemeConfig = typeof themeConfig;

export function getTheme(): ThemeConfig {
    return themeConfig;
}

/** Couleurs aplaties pour usage direct */
export const theme = {
    palette: themeConfig.palette,
    typography: themeConfig.typography,
    layout: themeConfig.layout,
    features: themeConfig.features,
    tenant: themeConfig.tenant,
} as const;

/** Génère les CSS variables à injecter dans le <head> */
export function getThemeCssVars(): string {
    const { palette, typography, layout, animations } = themeConfig;
    return `
    :root {
      --color-primary: ${palette.primary};
      --color-secondary: ${palette.secondary};
      --color-accent: ${palette.accent};
      --color-background: ${palette.background};
      --color-surface: ${palette.surface};
      --color-text-primary: ${palette.text_primary};
      --color-text-secondary: ${palette.text_secondary};
      --color-border: ${palette.border};
      --font-heading: ${typography.font_heading};
      --font-body: ${typography.font_body};
      --max-width: ${layout.max_width};
      --transition-duration: ${animations.transition_duration};
      --transition-easing: ${animations.transition_easing};
    }
  `.trim();
}
