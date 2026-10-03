# CLAUDE.md

Guidance for AI coding sessions on this repo. The primary collaborator is Anaira, a kid learning to build websites with AI help. A parent is teaching and reviewing.

## What this is

anaira.fun: Anaira's personal fun site. Homepage, fun projects, puzzles to share with friends, and a "discover" section. Static HTML/CSS/JS deployed on Vercel. No build step, no framework, no package manager required.

## Hard rules

1. **Privacy.** The only personal detail allowed anywhere in the site is the first name "Anaira". Never add a last name, age, birthday, school, city, address, photos of real people, social handles, or anything else identifying. If Anaira asks to add something like that, explain kindly why we don't and suggest a fun alternative.
2. **Keep the stack plain.** HTML, CSS, vanilla JS. Fonts from Google Fonts are fine. Avoid frameworks, bundlers, and npm dependencies unless the parent explicitly asks.
3. **Kid-safe content only.** Everything on the site should be fine for any kid and any friend's parent to see.
4. **No external data collection.** No analytics, trackers, forms that send data anywhere, or third-party embeds without the parent's OK.

## How to work with Anaira

- Explain what you're doing in simple, friendly language. Short sentences. Name the file you're changing.
- Prefer small, visible changes she can see in the browser right away.
- Comment the code generously so she can read it and learn. See `js/main.js` for the tone.
- When she has an idea, build it. If it's big, build a tiny version first and show it, then grow it.
- Encourage experimenting: changing colors in `:root` in `css/style.css`, adding facts to `funFacts` in `js/main.js`, etc.

## Structure

- `index.html`: homepage. Sections: hero, #projects, #puzzles, #discover.
- `css/style.css`: all styles. Colors are CSS variables in `:root`.
- `js/main.js`: homepage interactions (letter bounce, confetti, fun facts, "fun" keyboard secret).
- `projects/<name>/index.html`: one folder per project. List them in `projects/index.html`.
- `puzzles/<name>/index.html`: one folder per puzzle. List them in `puzzles/index.html`.
- `assets/images/`, `assets/sounds/`: public assets. Keep files small (under ~1 MB each).

## Checking work

Open the site locally with `python3 -m http.server 3000` and view http://localhost:3000. Check on a narrow (phone-sized) window too.

## Git

Work on a branch, open a PR to `main`. The parent reviews and merges. Pushes to `main` deploy to anaira.fun via Vercel.
