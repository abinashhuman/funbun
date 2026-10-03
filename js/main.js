// ==========================================================
// anaira.fun — main script
// Everything on the homepage that moves because of a click
// or a keypress lives here.
// ==========================================================

// ---------- 1. Make each letter of the name bounce ----------
// Each letter is a button. Tap once to grow it; tap again to shrink it.
const wiggle = document.querySelector(".wiggle");
if (wiggle) {
  const text = wiggle.textContent;
  wiggle.textContent = "";
  [...text].forEach((char, i) => {
    if (!/[A-Z]/i.test(char)) {
      const punctuation = document.createElement('span');
      punctuation.textContent = char;
      wiggle.appendChild(punctuation);
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'letter';
    button.setAttribute('aria-label', `Make ${char} bigger`);
    button.setAttribute('aria-pressed', 'false');
    const glyph = document.createElement('span');
    glyph.className = 'letter-glyph';
    glyph.textContent = char;
    glyph.style.animationDelay = `${i * 0.08}s`;
    button.appendChild(glyph);
    button.addEventListener('click', () => {
      const big = button.classList.toggle('is-big');
      button.setAttribute('aria-pressed', String(big));
      button.setAttribute('aria-label', `Make ${char} ${big ? 'smaller' : 'bigger'}`);
    });
    wiggle.appendChild(button);
  });
}

// ---------- 2. Confetti when you press "Surprise me" ----------
const colors = ["#ff7eb6", "#7c5cff", "#ffd166", "#6ee7b7", "#7dd3fc"];

function throwConfetti(count = 80) {
  const layer = document.getElementById("confetti");
  if (!layer) return;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(piece);

    // Clean up each piece after it has fallen
    setTimeout(() => piece.remove(), 5000);
  }
}

const surpriseBtn = document.getElementById("surprise-btn");
if (surpriseBtn) {
  surpriseBtn.addEventListener("click", () => throwConfetti());
}

// ---------- 3. Fun facts ----------
// Add your own facts here! Each one goes inside quotes, separated by commas.
const funFacts = [
  "Octopuses have three hearts. 🐙",
  "Honey never goes bad. Archaeologists have found 3000-year-old honey that was still good! 🍯",
  "A group of flamingos is called a 'flamboyance'. 🦩",
  "Bananas are berries, but strawberries are not. 🍌",
  "Sloths can hold their breath longer than dolphins. 🦥",
  "There are more stars in the universe than grains of sand on all of Earth's beaches. ✨",
  "A day on Venus is longer than a year on Venus. 🪐",
  "Butterflies can taste with their feet. 🦋",
];

const factBtn = document.getElementById("fact-btn");
const factText = document.getElementById("fun-fact");
let lastFact = -1;

if (factBtn && factText) {
  factBtn.addEventListener("click", () => {
    // Pick a random fact that is different from the last one
    let index;
    do {
      index = Math.floor(Math.random() * funFacts.length);
    } while (index === lastFact && funFacts.length > 1);
    lastFact = index;

    factText.textContent = funFacts[index];

    // Replay the little "pop" animation
    factText.classList.remove("pop");
    void factText.offsetWidth; // this line forces the browser to restart the animation
    factText.classList.add("pop");
  });
}

// ---------- 4. Secret! ----------
// Type the word "fun" anywhere on the page for a surprise.
let typed = "";
document.addEventListener("keydown", (event) => {
  typed = (typed + event.key.toLowerCase()).slice(-3);
  if (typed === "fun") {
    throwConfetti(200);
    typed = "";
  }
});
