// An invitation that friends can open as a file, even without an internet connection.
(() => {
  const canvas = document.querySelector('.drawing-canvas');
  const instructionText = document.getElementById('instruction-text');
  const guestInstructions = document.getElementById('guest-instructions');
  const instructions = document.getElementById('party-instructions');
  const comingMessage = document.getElementById('coming-message');
  const shareMessage = document.getElementById('share-message');
  const shareButton = document.getElementById('share-invitation');
  const defaultInstructions = instructionText.value;
  const instructionKey = 'anayra-invitation-instructions-v1';
  try { instructionText.value = localStorage.getItem(instructionKey) || defaultInstructions; } catch { /* Editing still works. */ }
  function updateInstructions() {
    guestInstructions.textContent = instructionText.value.trim() || defaultInstructions;
  }
  updateInstructions();
  instructionText.addEventListener('input', () => {
    updateInstructions();
    try { localStorage.setItem(instructionKey, instructionText.value); } catch { /* Sharing still works. */ }
  });
  document.querySelectorAll('[data-coming]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-coming]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      const yes = button.dataset.coming === 'yes';
      instructions.hidden = !yes;
      comingMessage.textContent = yes ? 'Yay! Here are your party instructions. 🎉' : 'Thanks for letting me know. Maybe next time! 💜';
    });
  });

  // The previous card stays available, so the new design doesn't erase old artwork.
  const previousButton = document.getElementById('previous-card');
  let previousCard;
  try { previousCard = localStorage.getItem('anayra-invitation-v1'); } catch { /* Optional backup. */ }
  if (previousCard && previousCard.startsWith('data:image/png;base64,')) {
    previousButton.hidden = false;
    previousButton.addEventListener('click', () => download(previousCard, 'anayra-previous-invitation.png'));
  }
  function download(url, filename) {
    const link = document.createElement('a');
    link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
  }
  function invitationFile() {
    // Escape text before putting it in an HTML file. Friends never run typed-in code.
    const escape = text => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const picture = canvas.toDataURL('image/png');
    const text = escape(instructionText.value.trim() || defaultInstructions);
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ANAYRA'S Birthday Invitation</title>
<style>*{box-sizing:border-box}body{margin:0;padding:24px;font-family:system-ui,sans-serif;color:#2b2140;background:#fff0f7}main{max-width:650px;margin:auto}img{display:block;width:100%;height:auto;border-radius:20px;box-shadow:0 8px 30px #2b214020}.reply{margin-top:20px;padding:24px;text-align:center;background:white;border-radius:20px}h1{font-size:1.6rem}button{font:700 1.1rem system-ui;padding:14px 24px;border:2px solid #ddd0f3;border-radius:14px;background:#faf6ff;color:#2b2140;cursor:pointer;margin:5px}button[aria-pressed=true]{background:#eee5ff;border-color:#7c5cff}button:focus-visible{outline:3px solid #7c5cff;outline-offset:3px}.sign{background:#faf6ff;border:2px dashed #d0c0ed;border-radius:16px;padding:16px;margin-top:16px;white-space:pre-wrap;overflow-wrap:anywhere}h2{font-size:1.2rem}[hidden]{display:none}</style></head>
<body><main><img src="${picture}" alt="ANAYRA'S decorated birthday invitation"><section class="reply"><h1>Coming to the party?</h1><div role="group" aria-label="Coming to the party"><button type="button" data-coming="yes" aria-pressed="false">Yes! 🎉</button><button type="button" data-coming="no" aria-pressed="false">No 💜</button></div><p id="response" role="status">Choose Yes or No.</p><div id="instructions" class="sign" hidden><h2>🪧 Party instructions</h2><p>${text}</p></div></section></main>
<script>document.querySelectorAll('[data-coming]').forEach(function(button){button.addEventListener('click',function(){document.querySelectorAll('[data-coming]').forEach(function(other){other.setAttribute('aria-pressed',String(other===button))});var yes=button.dataset.coming==='yes';document.getElementById('instructions').hidden=!yes;document.getElementById('response').textContent=yes?'Yay! Here are your party instructions. 🎉':'Thanks for letting me know. Maybe next time! 💜'})});<\/script></body></html>`;
    return new File([html], 'anayra-birthday-invitation.html', { type: 'text/html' });
  }
  function downloadInvitation(file = invitationFile()) {
    const url = URL.createObjectURL(file);
    download(url, file.name);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    shareMessage.textContent = 'Invitation downloaded! Send this file to your friends. They can open it in a browser and choose Yes or No. 💌';
  }
  document.getElementById('download-invitation').addEventListener('click', () => downloadInvitation());
  shareButton.addEventListener('click', async () => {
    const file = invitationFile();
    // Use the device's share menu when it supports invitation files.
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "ANAYRA'S birthday invitation" });
        shareMessage.textContent = 'Your invitation is shared! 💌'; return;
      } catch (error) {
        if (error.name === 'AbortError') { shareMessage.textContent = 'Your invitation is ready whenever you want to send it.'; return; }
      }
    }
    downloadInvitation(file);
  });
})();
