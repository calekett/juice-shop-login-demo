const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const message = document.getElementById('message');

function showMessage(text, isError) {
  // textContent (not innerHTML) means any HTML in the text is shown as plain
  // characters and never runs as code.
  message.textContent = text;
  message.className = 'message ' + (isError ? 'error' : 'success');
}

function clientSideValid(email, password) {
  if (email.trim() === '' || password === '') {
    showMessage('Please fill in both fields.', true);
    return false;
  }
  if (!email.includes('@')) {
    showMessage('Email must contain an "@".', true);
    return false;
  }
  if (password.length < 8) {
    showMessage('Password must be at least 8 characters.', true);
    return false;
  }
  return true;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!clientSideValid(email, password)) return;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    showMessage(data.message, !data.ok);
  } catch (err) {
    showMessage('Something went wrong. Please try again.', true);
  }
});
