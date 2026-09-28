import { definePreset } from '@openng/optimus-ui-themes';
import Aura from '@openng/optimus-ui-themes/aura';

const AppTheme = definePreset(Aura, {
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
