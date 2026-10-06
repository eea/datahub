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
    eea: {
      blue: {
        50: '#eff6ff',
        100: '#a0d7ff',
        200: '#47b3ff',
        300: '#008ff5',
        400: '#0079cf',
        500: '#006bb8',
        600: '#004b7f',
        700: '#003c66',
        800: '#003052',
        900: '#002d4c',
        950: '#001e33',
      },
      red: {
        50: '#fbeef8',
        100: '#f6ddf0',
        200: '#e7b2c0',
        400: '#c65b59',
        500: '#b83230',
        600: '#5c1918',
      },
      green: '#007b6c',
      text: '#3d5265',
      silver: '#e6e7e8',
      oldSilver: '#808285',
      supplementary: '#f9f9f9',
      infoBackground: '#f8ffff',
      hover: '#edf1f2',
      header: '#2e3e4c',
      footer: '#212d38',
    },
  },
  semantic: {
    primary: {
      50: '{eea.blue.50}',
      100: '{eea.blue.100}',
      200: '{eea.blue.200}',
      300: '{eea.blue.300}',
      400: '{eea.blue.400}',
      500: '{eea.blue.500}',
      600: '{eea.blue.600}',
      700: '{eea.blue.700}',
      800: '{eea.blue.800}',
      900: '{eea.blue.900}',
      950: '{eea.blue.950}',
    },
    focusRing: {
      width: '2px',
      color: '{primary.300}',
      offset: '2px',
    },
    content: {
      borderRadius: '{border.radius.md}',
    },
    colorScheme: {
      light: {
        primary: {
          activeColor: '{primary.800}',
        },
        text: {
          color: '{eea.text}',
          hoverColor: '{eea.text}',
        },
        highlight: {
          focusBackground: '{eea.hover}',
        },
        formField: {
          color: '{text.color}',
          borderColor: '{eea.oldSilver}',
          hoverBorderColor: '{text.color}',
        },
      },
    },
    secondary: {
      background: '{eea.supplementary}',
      foreground: '{text.color}',
    },
    tertiary: '#ffffff',
    muted: '{slate.300}',
    mutedForeground: '{slate.500}',
    destructive: {
      color: '{eea.red.500}',
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
        color: '{primary.500}',
        hoverColor: '{primary.600}',
      },
      exclude: {
        color: '{eea.red.500}',
        hoverColor: '{eea.red.600}',
      },
      deselect: {
        color: '{eea.oldSilver}',
        hoverColor: '{eea.text}',
      },
    },
    excludedChip: {
      background: '{eea.red.50}',
      color: '{eea.red.500}',
      borderColor: '{eea.red.200}',
      hoverBackground: '{eea.red.100}',
    },
    fontSize: {
      label: '12.25px',
    },
  },
  components: {
    card: {
      root: {
        borderRadius: '{border.radius.md}',
        shadow: 'none',
      },
      body: {
        padding: '1.75rem 2rem',
      },
    },
    checkbox: {
      root: {
        width: '1rem',
        height: '1rem',
        borderRadius: '{border.radius.xs}',
        borderColor: '{eea.oldSilver}',
        hoverBorderColor: '{text.color}',
        focusBorderColor: '{eea.oldSilver}',
      },
      icon: {
        size: '0.75rem',
      },
    },
    inputtext: {
      root: {
        borderColor: '{content.border.color}',
        invalidBorderColor: '{content.border.color}',
        invalidPlaceholderColor: '{text.muted.color}',
      },
    },
    message: {
      root: {
        borderRadius: '{content.border.radius}',
      },
      colorScheme: {
        light: {
          error: {
            background: '#ffffff',
            borderColor: '{eea.red.400}',
            color: '{eea.red.500}',
            shadow: 'none',
          },
          info: {
            background: '{eea.infoBackground}',
            borderColor: '{primary.500}',
            color: '{primary.800}',
            shadow: 'none',
          },
        },
      },
    },
    tag: {
      root: {
        borderRadius: '{border.radius.sm}',
        fontSize: '{fontSize.label}',
        fontWeight: '400',
        padding: '0.25rem 0.5rem',
      },
      colorScheme: {
        light: {
          primary: {
            background: '{primary.50}',
            color: '{primary.color}',
          },
        },
      },
    },
  },
});

export default AppTheme;
