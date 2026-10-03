# anaira.fun

Anayra's own corner of the internet: a homepage, fun projects, puzzles to share with friends, and things to discover.

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
│   ├── index.html      ← list of fun projects
│   ├── painting/       ← painting game with shared drawing tools
│   ├── birthday-invitation/ ← JJ & Mikey invitation designer
│   └── rocket/         ← space flight and multiplication game
├── puzzles/
│   ├── index.html      ← list of puzzles
│   └── play/           ← memory, patterns, and number games
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

- The only personal detail on this site is the first name **Anayra**. No last name, age, school, city, photos of people, or anything else that identifies a real person.
- Keep it simple: HTML, CSS, JS. No frameworks unless there's a very good reason.
- Have fun. That's the whole point.

## Games & creations

- `projects/painting/`: brush, rainbow brush, glitter, shapes, spirals, JJ and Mikey stamps, undo/redo, and PNG downloads.
- `projects/birthday-invitation/`: an Anayra birthday card with separate JJ, Mikey, and Amazing stickers beside the card. Includes paint colors, a Coming Yes/No choice, editable party instructions, and a share/download action for a standalone invitation file whose buttons work offline. Earlier saved card artwork stays available with Save previous card.
- `projects/rocket/`: choose a rocket, saucer, or meteorite, name it, and dodge 15 rocks. A collision pauses for multiplication; a correct answer repairs the ride. Supports keyboard, pointer dragging, and touch buttons.
- `puzzles/play/`: six-pair memory match, six pattern questions, and six arithmetic puzzles.

Pictures are stored only in this browser's local storage. No user data is sent to a server.
The generated JJ and Mikey sticker artwork and its generation prompt are in `assets/images/`.
