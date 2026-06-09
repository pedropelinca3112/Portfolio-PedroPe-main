const form         = document.getElementById('contactForm');
const submitBtn    = document.getElementById('submitBtn');
const messageField = document.getElementById('message');
const charCounter  = document.getElementById('charCounter');

const MAX_CHARS = 500;

function showError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);

  field?.classList.add('error');
  if (error) error.textContent = message;
}

function clearErrors() {
  ['name', 'email', 'subject', 'message'].forEach(id => {
    document.getElementById(id)?.classList.remove('error');
  });

  ['nameError', 'emailError', 'subjectError', 'messageError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function validateEmail(email) {
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRe.test(email);
}

function updateCharCounter() {
  if (!messageField || !charCounter) return;
  const length = messageField.value.length;
  charCounter.textContent = `${length} / ${MAX_CHARS}`;
  charCounter.classList.remove('warn', 'over');

  if (length > MAX_CHARS) {
    charCounter.classList.add('over');
  } else if (length > MAX_CHARS * 0.8) {
    charCounter.classList.add('warn');
  }
}

messageField?.addEventListener('input', updateCharCounter);

form?.addEventListener('submit', (e) => {
  clearErrors();

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  let valid = true;

  if (!name) {
    showError('name', 'nameError', 'Por favor, informe seu nome.');
    valid = false;
  }

  if (!email || !validateEmail(email)) {
    showError('email', 'emailError', 'Informe um e-mail válido.');
    valid = false;
  }

  if (!subject) {
    showError('subject', 'subjectError', 'Selecione um assunto.');
    valid = false;
  }

  if (!message || message.length < 10) {
    showError('message', 'messageError', 'A mensagem deve ter ao menos 10 caracteres.');
    valid = false;
  } else if (message.length > MAX_CHARS) {
    showError('message', 'messageError', `A mensagem deve ter no máximo ${MAX_CHARS} caracteres.`);
    valid = false;
  }

  if (!valid) {
    e.preventDefault(); // impede envio se inválido
    return;
  }

  // se for válido, deixamos o FormSubmit enviar normalmente
  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Enviando...';
});

// Inicializa contador na carga
updateCharCounter();