/**
 * Site settings — migrated from the original app's data/db.json.
 *
 * This file is the single source of truth for everything that is not a post:
 * the masthead, the home page hero, the newsletter block, the footer, and the
 * site-wide typography. Edit it and rebuild — no code changes needed.
 */

export const site = {
  title: "The Slow Draft",
  tagline: "Essays on writing, building things, and paying attention.",

  hero: {
    kicker: "A personal blog",
    heading: "Notes from the slow lane of the internet.",
    intro: "Long-ish thoughts on writing, craft, and the small systems that keep a creative life running. New pieces land here every couple of weeks — you can also get them by email.",
  },

  author: {
    name: "Chirag Yadav",
    role: "Student · Active reader",
    photo: "",
    email: "hello@example.com",
    /* the About page opening, shown trimmed on the home page */
    shortBio: "I'm Chirag — a student, and an active reader. This site is where I keep what I'm learning: notes from the books I'm reading, essays about writing and attention, and the occasional thing I build while I'm figuring things ",
  },

  social: {
    twitter: "",
    github: "",
    linkedin: "",
  },

  newsletter: {
    heading: "Letters, occasionally",
    blurb: "One short email when something new goes up. No spam, no selling your address, unsubscribe in one click.",
    /**
     * Leave endpoint empty and the form hands the address to the writer's inbox
     * through the visitor's own mail app. Fill it in with a form service such as
     * Buttondown (https://buttondown.email/api/emails/embed-subscribe/<user>)
     * or Formspree and the form POSTs there instead.
     */
    endpoint: '',
    mode: 'mailto',
  },

  footerNote: "Written by hand, published from a small editor.",

  /* Site-wide typography — ids come from src/lib/fonts.js */
  typography: {
    body: "lora",
    heading: "playfair",
    size: "medium",
  },

  /* Posts per page on /blog/ (pagination appears once you exceed it). */
  postsPerPage: 9,

  /**
   * The nav's "Write" button. It now points at the Decap CMS dashboard in
   * public/admin/ — sign in there and commit posts straight to git.
   * Set it to '' to hide the button, or swap in your own editor URL.
   */
  adminLink: '/admin/',

  /**
   * Load the Netlify Identity widget on every page. Needed only when you send
   * invitation emails: the invite link lands on the home page with a token in
   * the URL fragment, and this widget is what turns that into a login.
   *
   * Leave false if you sign in to /admin/ directly (the admin page loads the
   * widget itself) — or set true if you want invitations to work end to end.
   */
  identityWidget: false,

  /* Absolute URL used in RSS, the sitemap and canonical tags.
     SITE_URL=https://yourdomain.com npm run build overrides this. */
  url: "https://theslowdraft.netlify.app",
};

export default site;
