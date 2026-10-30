import { defineConfig } from 'astro/config';

// GitHub Pages project site, e.g. https://hedu59.github.io/pilulas-de-tecnologia/
// In GitHub Actions the repository owner/name is discovered automatically.
const [owner = 'hedu59', repo = 'pilulas-de-tecnologia'] =
  (process.env.GITHUB_REPOSITORY || 'hedu59/pilulas-de-tecnologia').split('/');
const isUserSite = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;
export default defineConfig({
  site: `https://${owner}.github.io`,
  base: isUserSite ? '/' : `/${repo}/`,
  output: 'static',
  trailingSlash: 'always',
});