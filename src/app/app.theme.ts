import { definePreset } from '@openng/optimus-ui-themes';
import Aura from '@openng/optimus-ui-themes/aura';

const AppTheme = definePreset(Aura, {
  primitive: {
    cyan: undefined,
    fuchsia: undefined,
    gray: undefined,
    indigo: undefined,
    lime: undefined,
    neutral: undefined,
    pink: undefined,
    rose: undefined,
    stone: undefined,
    teal: undefined,
    violet: undefined,
  },
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
    secondary: {
      background: 'rgba(241, 245, 249, 1)',
      foreground: 'rgba(71, 85, 105, 1)',
    },
    tertiary: 'rgba(245, 245, 243)',
    muted: '{slate.300}',
    mutedForeground: '{slate.500}',
    destructive: {
      color: '{red.500}',
      contrastColor: '#ffffff',
    },
    decorative: {
      blue: {
        50: 'oklch(97% 0.014 254.604)',
        200: 'oklch(88.2% 0.059 254.128)',
        600: 'oklch(54.6% 0.245 262.881)',
      },
      purple: {
        50: 'oklch(97.7% 0.014 308.299)',
        200: 'oklch(90.2% 0.063 306.703)',
        600: 'oklch(55.8% 0.288 302.321)',
      },
      orange: {
        50: 'oklch(98% 0.016 73.684)',
        200: 'oklch(90.1% 0.076 70.697)',
        600: 'oklch(64.6% 0.222 41.116)',
      },
    },
    filterAction: {
      include: {
        color: 'oklch(62.3% 0.214 259.815)',
        hoverColor: 'oklch(54.6% 0.245 262.881)',
      },
      exclude: {
        color: 'oklch(63.7% 0.237 25.331)',
        hoverColor: 'oklch(57.7% 0.245 27.325)',
      },
      deselect: {
        color: 'oklch(55.1% 0.027 264.364)',
        hoverColor: 'oklch(44.6% 0.03 256.802)',
      },
    },
    excludedChip: {
      background: 'oklch(97.1% 0.013 17.38)',
      color: 'oklch(50.5% 0.213 27.518)',
      borderColor: 'oklch(88.5% 0.062 18.334)',
      hoverBackground: 'oklch(88.5% 0.062 18.334)',
    },
    fontSize: {
      label: '12.25px',
    },
  },
  components: {
    card: {
      root: {
        borderRadius: '6px',
        shadow: 'none',
      },
      body: {
        padding: '1.75rem 2rem',
      },
    },
    inputtext: {
      root: {
        borderColor: '{content.border.color}',
        invalidBorderColor: '{content.border.color}',
        invalidPlaceholderColor: '{text.muted.color}',
      },
    },
    tag: {
      root: {
        borderRadius: '0.25rem',
        fontSize: '{fontSize.label}',
        fontWeight: '400',
        padding: '0.25rem 0.5rem',
      },
      colorScheme: {
        light: {
          primary: {
            background: '{secondary.background}',
            color: '{secondary.foreground}',
          },
        },
      },
    },
  },
});

export default AppTheme;
