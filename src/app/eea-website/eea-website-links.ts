import { httpResource } from '@angular/common/http';
import { computed, Injectable } from '@angular/core';

export interface EeaWebsiteAction {
  id: string;
  title: string;
  url: string;
}

export interface EeaWebsiteActions {
  contact_actions: EeaWebsiteAction[];
  contact_extra_actions: EeaWebsiteAction[];
  footer_actions: EeaWebsiteAction[];
  copyright_actions: EeaWebsiteAction[];
  social_actions: EeaWebsiteAction[];
}

export const EEA_WEBSITE_ACTIONS: EeaWebsiteActions = {
  contact_actions: [
    { id: 'about', title: 'About us', url: 'https://www.eea.europa.eu/en/about' },
    { id: 'contact', title: 'Contact us', url: 'https://www.eea.europa.eu/en/about/contact-us' },
    {
      id: 'newsletter',
      title: 'Sign up to our newsletter',
      url: 'https://www.eea.europa.eu/en/datahub/newsroom/newsletter',
    },
  ],
  contact_extra_actions: [
    { id: 'faqs', title: 'FAQs', url: 'https://www.eea.europa.eu/en/about/contact-us/faqs' },
    { id: 'careers', title: 'Careers', url: 'https://www.eea.europa.eu/en/about/careers' },
  ],
  footer_actions: [
    { id: 'privacy', title: 'Privacy statement', url: 'https://www.eea.europa.eu/en/privacy' },
    {
      id: 'accessibility',
      title: 'Accessibility',
      url: 'https://www.eea.europa.eu/en/accessibility',
    },
    { id: 'legal', title: 'Legal notice', url: 'https://www.eea.europa.eu/en/legal-notice' },
  ],
  copyright_actions: [
    { id: 'sitemap', title: 'Sitemap', url: 'https://www.eea.europa.eu/en/sitemap' },
    { id: 'status_page', title: 'System status', url: 'https://status.eea.europa.eu/' },
    { id: 'login', title: 'Login', url: 'https://www.eea.europa.eu/en/datahub/login' },
  ],
  social_actions: [
    { id: 'twitter', title: 'Twitter', url: 'https://twitter.com/euenvironment' },
    {
      id: 'facebook',
      title: 'Facebook',
      url: 'https://www.facebook.com/European.Environment.Agency',
    },
    {
      id: 'linkedin',
      title: 'Linkedin',
      url: 'https://www.linkedin.com/company/european-environment-agency',
    },
    { id: 'youtube', title: 'Youtube', url: 'https://www.youtube.com/user/EEAvideos' },
    { id: 'instagram', title: 'Instagram', url: 'https://www.instagram.com/onehealth_eu' },
    { id: 'bluesky', title: 'Bluesky', url: 'https://bsky.app/profile/eea.europa.eu' },
  ],
};

const ACTION_GROUPS = Object.keys(EEA_WEBSITE_ACTIONS) as (keyof EeaWebsiteActions)[];

function parseActions(response: unknown): EeaWebsiteActions {
  const actions = response as Partial<EeaWebsiteActions> | null;
  if (ACTION_GROUPS.some((group) => !Array.isArray(actions?.[group]))) {
    throw new Error('The EEA website actions are missing a link group');
  }
  return actions as EeaWebsiteActions;
}

@Injectable({ providedIn: 'root' })
export class EeaWebsiteLinks {
  private readonly actions = httpResource(() => 'eea-website/@actions', { parse: parseActions });

  readonly footer = computed(() =>
    this.actions.hasValue() ? this.actions.value() : EEA_WEBSITE_ACTIONS,
  );
}
