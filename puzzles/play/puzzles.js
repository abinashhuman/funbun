// Three small puzzle games. A wrong answer always gets another try!
(() => {
  const symbols = ['🌈', '🚀', '🦋', '🎨', '🌟', '🐢'];
  let memoryCards = [];
  let flipped = [];
  let matched = 0;
  let turns = 0;
  let locked = false;
  let mismatchTimer;
  const grid = document.getElementById('memory-grid');
  const memoryMessage = document.getElementById('memory-message');

  function memoryProgress() {
    document.getElementById('memory-progress').textContent = `Pairs: ${matched} / 6 · Turns: ${turns}`;
  }
  function resetMemory() {
    clearTimeout(mismatchTimer); flipped = []; matched = 0; turns = 0; locked = false;
    const values = [...symbols, ...symbols];
    // Fisher-Yates shuffle gives every card a fair place.
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    grid.replaceChildren();
    memoryCards = values.map((symbol, i) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'memory-card'; button.textContent = '?';
      button.setAttribute('aria-label', `Card ${i + 1}, face down`);
      button.addEventListener('click', () => flip(i)); grid.appendChild(button);
      return { symbol, button, matched: false, index: i };
    });
    memoryProgress(); memoryMessage.textContent = 'Choose your first card!';
  }
  function flip(index) {
    const card = memoryCards[index];
    if (locked || card.matched || flipped.includes(index)) return;
    card.button.textContent = card.symbol; card.button.classList.add('revealed');
    card.button.setAttribute('aria-label', `Card ${index + 1}: ${card.symbol}`);
    flipped.push(index);
    if (flipped.length === 1) { memoryMessage.textContent = 'Now choose another card.'; return; }
    turns++;
    const [first, second] = flipped.map(i => memoryCards[i]);
    if (first.symbol === second.symbol) {
      matched++;
      [first, second].forEach(item => {
        item.matched = true; item.button.classList.add('matched'); item.button.disabled = true;
        item.button.setAttribute('aria-label', `Matched ${item.symbol}`);
      });
      flipped = [];
      memoryMessage.textContent = matched === 6 ? 'You found every pair! Puzzle solved! 🎉' : 'A match! Keep going!';
    } else {
      locked = true; memoryMessage.textContent = 'Different pictures. Remember them and try again!';
      mismatchTimer = setTimeout(() => {
        [first, second].forEach(item => {
          item.button.textContent = '?'; item.button.classList.remove('revealed');
          item.button.setAttribute('aria-label', `Card ${item.index + 1}, face down`);
        });
        flipped = []; locked = false; memoryMessage.textContent = 'Choose another pair!';
      }, 1100);
    }
    memoryProgress();
  }
  document.getElementById('memory-reset').addEventListener('click', resetMemory);

  const patterns = [
    { sequence: ['🔴','🔵','🔴','🔵','🔴'], names: 'red, blue, red, blue, red', answer: '🔵', choices: ['🟢','🔵','🔴'], hint: 'Red, blue. Red, blue. What follows red?' },
    { sequence: ['⭐','⭐','🌙','⭐','⭐'], names: 'star, star, moon, star, star', answer: '🌙', choices: ['☀️','⭐','🌙'], hint: 'Two stars, then a moon!' },
    { sequence: ['1','2','3','4'], names: 'one, two, three, four', answer: '5', choices: ['6','5','7'], hint: 'Count up by one each time.' },
    { sequence: ['🐢','🐇','🐢','🐇','🐢'], names: 'turtle, rabbit, turtle, rabbit, turtle', answer: '🐇', choices: ['🐢','🐸','🐇'], hint: 'The turtle and rabbit take turns.' },
    { sequence: ['2','4','6','8'], names: 'two, four, six, eight', answer: '10', choices: ['9','12','10'], hint: 'Add two each time.' },
    { sequence: ['🌈','☁️','☀️','🌈','☁️'], names: 'rainbow, cloud, sun, rainbow, cloud', answer: '☀️', choices: ['☀️','🌈','☁️'], hint: 'Rainbow, cloud, sun. Then repeat!' },
  ];
  let patternIndex = 0;
  let patternSolved = false;
  const patternNext = document.getElementById('pattern-next');
  function showPattern() {
    patternSolved = false; patternNext.hidden = true;
    const pattern = patterns[patternIndex];
    document.getElementById('patterns-progress').textContent = `Pattern ${patternIndex + 1} / 6`;
    const display = document.getElementById('pattern-display');
    display.textContent = `${pattern.sequence.join(' ')}  ?`;
    display.setAttribute('aria-label', `Pattern: ${pattern.names}. What comes next?`);
    document.getElementById('patterns-message').textContent = 'Which piece comes next?';
    const choices = document.getElementById('pattern-choices'); choices.replaceChildren();
    pattern.choices.forEach(choice => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'choice-button'; button.textContent = choice;
      button.addEventListener('click', () => {
        if (patternSolved) return;
        if (choice !== pattern.answer) { document.getElementById('patterns-message').textContent = `Try again! ${pattern.hint}`; return; }
        patternSolved = true; display.textContent = `${pattern.sequence.join(' ')}  ${choice}`;
        display.setAttribute('aria-label', `Solved pattern: ${pattern.names}, ${choice}`);
        choices.querySelectorAll('button').forEach(other => { other.disabled = true; });
        document.getElementById('patterns-message').textContent = patternIndex === 5 ? 'All six patterns solved! You did it! 🎉' : 'You spotted the pattern! 🌟';
        patternNext.hidden = patternIndex === 5;
      });
      choices.appendChild(button);
    });
  }
  patternNext.addEventListener('click', () => { if (patternSolved && patternIndex < 5) { patternIndex++; showPattern(); } });
  document.getElementById('patterns-reset').addEventListener('click', () => { patternIndex = 0; showPattern(); });

  let numberIndex = 0;
  let numberSolved = false;
  let expectedAnswer = 0;
  let numberHint = '';
  const numberAnswer = document.getElementById('number-answer');
  const numberCheck = document.getElementById('number-check');
  const numberNext = document.getElementById('number-next');
  function showNumber() {
    numberSolved = false; numberNext.hidden = true; numberAnswer.value = ''; numberAnswer.disabled = false; numberCheck.disabled = false;
    const a = 2 + Math.floor(Math.random() * 5), b = 2 + Math.floor(Math.random() * 5);
    let expression;
    if (numberIndex % 3 === 0) { expression = `${a} + ${b}`; expectedAnswer = a + b; numberHint = `Start at ${a} and count ${b} more.`; }
    else if (numberIndex % 3 === 1) { expression = `${a + b} − ${b}`; expectedAnswer = a; numberHint = `Start at ${a + b} and count back ${b}.`; }
    else { expression = `${a} × ${b}`; expectedAnswer = a * b; numberHint = `Add ${Array(a).fill(b).join(' + ')}.`; }
    document.getElementById('number-display').textContent = `${expression} = ?`;
    document.getElementById('numbers-progress').textContent = `Puzzle ${numberIndex + 1} / 6`;
    document.getElementById('numbers-message').textContent = 'What is the missing number?';
  }
  document.getElementById('number-form').addEventListener('submit', event => {
    event.preventDefault();
    if (numberSolved || !numberAnswer.value.trim()) return;
    if (Number(numberAnswer.value) !== expectedAnswer) {
      document.getElementById('numbers-message').textContent = `Try again! ${numberHint}`;
      numberAnswer.select(); return;
    }
    numberSolved = true; numberAnswer.disabled = true; numberCheck.disabled = true;
    document.getElementById('numbers-message').textContent = numberIndex === 5 ? 'All six number puzzles solved! You are a number detective! 🎉' : 'Correct! Another mystery solved! 🌟';
    numberNext.hidden = numberIndex === 5;
    if (!numberNext.hidden) numberNext.focus({ preventScroll: true });
  });
  numberNext.addEventListener('click', () => { if (numberSolved && numberIndex < 5) { numberIndex++; showNumber(); numberAnswer.focus({ preventScroll: true }); } });
  document.getElementById('numbers-reset').addEventListener('click', () => { numberIndex = 0; showNumber(); });

  function selectGame(game) {
    if (!['memory', 'patterns', 'numbers'].includes(game)) game = 'memory';
    document.querySelectorAll('[data-game]').forEach(button => {
      const selected = button.dataset.game === game;
      button.setAttribute('aria-pressed', String(selected));
      document.getElementById(`${button.dataset.game}-panel`).hidden = !selected;
    });
    const url = new URL(window.location.href); url.searchParams.set('game', game); history.replaceState(null, '', url);
  }
  document.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => selectGame(button.dataset.game)));
  resetMemory(); showPattern(); showNumber();
  selectGame(new URLSearchParams(window.location.search).get('game'));
})();
