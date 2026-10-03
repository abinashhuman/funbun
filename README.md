# anaira.fun

Anaira's own corner of the internet: a homepage, fun projects, puzzles to share with friends, and things to discover.

Plain HTML, CSS, and JavaScript. No build step. Open `index.html` in a browser and it just works.

## Folder map

```
funbun/
├── index.html          ← the homepage (start here!)
├── css/
│   └── style.css       ← all the colors, fonts, and animations
├── js/
│   └── main.js         ← buttons, confetti, fun facts
├── projects/
│   └── index.html      ← list of fun projects (each project gets its own folder here)
├── puzzles/
│   └── index.html      ← list of puzzles (each puzzle gets its own folder here)
├── assets/
│   ├── images/         ← pictures, icons, the favicon
│   └── sounds/         ← sound effects, music
├── vercel.json         ← deploy settings
└── CLAUDE.md           ← notes for the AI helper
```

## Working on it locally

Any static server works. Two easy options:

```bash
# Python (already on most Macs)
python3 -m http.server 3000

# or Node
npx serve .
```

Then open http://localhost:3000.

## Adding a project or puzzle

1. Create a folder: `projects/my-thing/` (or `puzzles/my-thing/`)
2. Put an `index.html` inside it. Link to `../../css/style.css` to reuse the site's look, or write your own styles.
3. Add a card in `projects/index.html` (or `puzzles/index.html`) that links to it.
4. Optionally swap one of the "Coming soon" cards on the homepage to point at it.

## Deploying

Hosted on Vercel as a static site. Every push to `main` deploys to https://anaira.fun.

## House rules

- The only personal detail on this site is the first name **Anaira**. No last name, age, school, city, photos of people, or anything else that identifies a real person.
- Keep it simple: HTML, CSS, JS. No frameworks unless there's a very good reason.
- Have fun. That's the whole point.
