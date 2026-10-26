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
      text: '#3d5265',
      oldSilver: '#808285',
      supplementary: '#f9f9f9',
      infoBackground: '#f8ffff',
      hover: '#edf1f2',
      white: '#ffffff',
      green: '#007b6c',
      navy: '#212d38',
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
    formField: {
      focusRing: {
        width: '{focus.ring.width}',
        style: '{focus.ring.style}',
        color: '{focus.ring.color}',
        offset: '{focus.ring.offset}',
        shadow: 'none',
      },
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
    },
    muted: '{slate.300}',
    mutedForeground: '{slate.500}',
    destructive: {
      color: '{eea.red.500}',
      contrastColor: '{eea.white}',
    },
    filterAction: {
      contrastColor: '{eea.white}',
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
    footer: {
      background: {
        start: '{eea.green}',
        end: '{eea.navy}',
      },
      color: '{eea.white}',
    },
    fontSize: {
      base: '0.875rem',
      body: '0.875rem',
      h1: '2.75rem',
      h2: '2rem',
      h3: '1.625rem',
      label: '0.765625rem',
      mobile: {
        h1: '1.875rem',
        h2: '1.5rem',
        h3: '1.25rem',
      },
      footer: {
        contact: '1.25rem',
        button: '1rem',
      },
    },
    fontWeight: {
      h1: '700',
      h2: '600',
      h3: '600',
    },
  },
  css: ({ dt }) => `
    @media (width < 48rem) {
      :root {
        --p-font-size-h1: ${dt('fontSize.mobile.h1')};
        --p-font-size-h2: ${dt('fontSize.mobile.h2')};
        --p-font-size-h3: ${dt('fontSize.mobile.h3')};
      }
    }
  `,
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
            background: '{eea.white}',
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
