// CipherVault Demo Interactive Engine
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const resultDisplay = document.getElementById('result-display');
  const passphraseContainer = document.getElementById('passphrase-container');
  const modeBadge = document.getElementById('mode-badge');
  const modeText = document.getElementById('mode-text');
  const entropyFill = document.getElementById('entropy-fill');
  const generateBtn = document.getElementById('generate-btn');
  const copyBtn = document.getElementById('copy-btn');
  const copyLabel = document.getElementById('copy-label');
  const qrBtn = document.getElementById('qr-btn');
  
  const modePasswordBtn = document.getElementById('mode-password-btn');
  const modePassphraseBtn = document.getElementById('mode-passphrase-btn');
  const lengthSlider = document.getElementById('length-slider');
  const lengthLabel = document.getElementById('length-label');
  const lengthVal = document.getElementById('length-val');
  const separatorGroup = document.getElementById('separator-group');
  const charsetOptions = document.getElementById('charset-options');
  
  const qrModal = document.getElementById('qr-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalDoneBtn = document.getElementById('modal-done-btn');
  const modalKeyPreview = document.getElementById('modal-key-preview');
  
  // Mobile elements
  const mobileGenerateBtn = document.getElementById('mobile-generate-btn');
  const mobileCopyBtn = document.getElementById('mobile-copy-btn');
  const mobileQrBtn = document.getElementById('mobile-qr-btn');

  // State
  let mode = 'password'; // 'password' | 'passphrase'
  let length = 16;
  let wordCount = 4;
  let separator = '-';
  let currentKey = 'kX8#mQ9!vP2$zW7@';

  const passphraseWords = [
    'correct', 'horse', 'battery', 'staple',
    'quantum', 'nebula', 'cipher', 'stellar',
    'voyage', 'shield', 'phantom', 'falcon'
  ];

  // Helper: Generate Random Key
  function generatePassword(len) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
    let res = '';
    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < len; i++) {
      res += chars[array[i] % chars.length];
    }
    return res;
  }

  // Helper: Generate Passphrase
  function generatePassphrase(count, sep) {
    // If exactly 4 words and default, produce the famous xkcd reference
    const pool = ['correct', 'horse', 'battery', 'staple'];
    let words = [];
    if (count === 4 && pool.length === 4) {
      words = [...pool];
    } else {
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * passphraseWords.length);
        words.push(passphraseWords[idx]);
      }
    }
    return words;
  }

  // Update Display
  function render() {
    if (mode === 'password') {
      resultDisplay.classList.remove('hidden');
      passphraseContainer.classList.add('hidden');
      
      // Colorize password segments
      const segLen = Math.max(1, Math.floor(currentKey.length / 4));
      const s1 = currentKey.slice(0, segLen);
      const s2 = currentKey.slice(segLen, segLen * 2);
      const s3 = currentKey.slice(segLen * 2, segLen * 3);
      const s4 = currentKey.slice(segLen * 3);
      resultDisplay.innerHTML = `<span class="char-highlight">${s1}</span><span class="char-mid">${s2}</span><span class="char-low">${s3}</span><span class="char-accent">${s4}</span>`;
      
      modeText.textContent = 'RANDOM KEY MODE';
      entropyFill.style.width = '96%';
      modalKeyPreview.textContent = currentKey;
    } else {
      resultDisplay.classList.add('hidden');
      passphraseContainer.classList.remove('hidden');
      passphraseContainer.innerHTML = '';
      
      const words = Array.isArray(currentKey) ? currentKey : currentKey.split(separator);
      words.forEach((word, idx) => {
        const chip = document.createElement('span');
        chip.className = 'word-chip';
        chip.textContent = word;
        passphraseContainer.appendChild(chip);

        if (idx < words.length - 1) {
          const sepSpan = document.createElement('span');
          sepSpan.className = 'chip-sep font-mono';
          sepSpan.textContent = separator;
          passphraseContainer.appendChild(sepSpan);
        }
      });
      
      modeText.textContent = 'PASSPHRASE MODE';
      entropyFill.style.width = '100%';
      const formatted = words.join(separator);
      modalKeyPreview.textContent = formatted;
    }
  }

  // Action: Generate
  function onGenerate() {
    if (mode === 'password') {
      currentKey = generatePassword(length);
    } else {
      const words = generatePassphrase(wordCount, separator);
      currentKey = words;
    }
    render();

    // Pulse effect
    const card = document.querySelector('.vault-card');
    card.style.transform = 'scale(1.008)';
    setTimeout(() => { card.style.transform = 'scale(1)'; }, 150);
  }

  // Action: Switch to Password
  function setPasswordMode() {
    mode = 'password';
    modePasswordBtn.classList.add('active');
    modePassphraseBtn.classList.remove('active');
    separatorGroup.classList.add('hidden');
    charsetOptions.classList.remove('hidden');
    lengthLabel.textContent = 'Key Length';
    lengthSlider.min = '8';
    lengthSlider.max = '40';
    lengthSlider.value = length;
    lengthVal.textContent = `${length} chars`;
    currentKey = generatePassword(length);
    render();
  }

  // Action: Switch to Passphrase
  function setPassphraseMode() {
    mode = 'passphrase';
    modePassphraseBtn.classList.add('active');
    modePasswordBtn.classList.remove('active');
    separatorGroup.classList.remove('hidden');
    charsetOptions.classList.add('hidden');
    lengthLabel.textContent = 'Word Count';
    lengthSlider.min = '3';
    lengthSlider.max = '8';
    lengthSlider.value = wordCount;
    lengthVal.textContent = `${wordCount} words`;
    currentKey = ['correct', 'horse', 'battery', 'staple'];
    render();
  }

  // Modal Controls
  function openQrModal() {
    qrModal.classList.remove('hidden');
  }

  function closeQrModal() {
    qrModal.classList.add('hidden');
  }

  // Copy Feedback
  function triggerCopy() {
    const textToCopy = Array.isArray(currentKey) ? currentKey.join(separator) : currentKey;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    copyLabel.textContent = 'Copied!';
    copyBtn.style.borderColor = 'var(--accent-emerald)';
    setTimeout(() => {
      copyLabel.textContent = 'Copy';
      copyBtn.style.borderColor = '';
    }, 1500);
  }

  // Event Listeners
  generateBtn.addEventListener('click', onGenerate);
  mobileGenerateBtn.addEventListener('click', onGenerate);

  copyBtn.addEventListener('click', triggerCopy);
  mobileCopyBtn.addEventListener('click', triggerCopy);

  qrBtn.addEventListener('click', openQrModal);
  mobileQrBtn.addEventListener('click', openQrModal);

  closeModalBtn.addEventListener('click', closeQrModal);
  modalDoneBtn.addEventListener('click', closeQrModal);
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) closeQrModal();
  });

  modePasswordBtn.addEventListener('click', setPasswordMode);
  modePassphraseBtn.addEventListener('click', setPassphraseMode);

  lengthSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (mode === 'password') {
      length = val;
      lengthVal.textContent = `${val} chars`;
    } else {
      wordCount = val;
      lengthVal.textContent = `${val} words`;
    }
    onGenerate();
  });

  // Delimiter pills
  document.querySelectorAll('.delimiter-pills .pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.delimiter-pills .pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      separator = pill.getAttribute('data-sep');
      render();
    });
  });

  // Initial render
  render();
});
