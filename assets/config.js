/* zevu.learn — site configuration.
   Only the Giscus block needs editing. Everything else is generated. */

window.ZV_CONFIG = {
  /* --- Giscus comments ---------------------------------------------------
     Powers the "Comments & corrections" box at the bottom of every note.
     Setup takes about two minutes, full steps in web/README.md:

       1. Push this repo to GitHub (public, or private if you want).
       2. Install the Giscus app: https://github.com/apps/giscus
          -> pick the repo, enable Discussions.
       3. Copy repo / repoId / category / categoryId from
          https://giscus.app and paste them below.
       4. python3 tools/sync-web.py

     Until you do, every note page shows a one-line "not wired up yet"
     note instead of an empty comment box. Nothing else breaks.         */

  giscus: {
    repo: "YOUR_USERNAME/YOUR_REPO",
    repoId: "YOUR_REPO_ID",
    category: "General",
    categoryId: "YOUR_CATEGORY_ID",
    mapping: "pathname",
    strict: true,
    reactions: true,
  },
};
