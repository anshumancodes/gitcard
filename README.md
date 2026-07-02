# Gitcard

Embed beautiful GitHub language stats in your README with a single image tag. Fetches live data from the GitHub API and returns an SVG card.

```md
![Languages](https://your-domain.com/username)
```

## How to use

Hit `/{username}` to get a card for any GitHub user.

```
https://your-domain.com/torvalds
```

Customize it with query params:

| Param | What it does |
|---|---|
| `?theme=light` | Light mode |
| `?top=5` | Show top N languages |
| `?hide=c,python` | Exclude languages |
| `?title=My Stack` | Override the card title |
| `?compact=true` | Compact layout |
| `?width=600` | Custom width (320–800) |
| `?bg=transparent` | Transparent background |
| `?avatar=false` | Hide avatar |

## Self-host

```bash
git clone https://github.com/anshumancodes/gitcard
cd gitcard
npm install
npm run dev
```

Needs a `GITHUB_TOKEN` env var to avoid rate limits. Add it to `.env.local`:

```
GITHUB_TOKEN=your_token_here
```
