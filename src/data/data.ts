export const dataCode = `// Here we define two completely separate scripts.
// You can build complex graphs by "plugging" multiple script modules together!

const bankingScript = {
  start: {
    q: 'Hi! What do you need help with?',
    options: [
      { label: 'Toggle Dark Mode', next: 'toggle_theme' },
      { label: 'Transaction Issue', next: 'transaction' },
      { label: 'Account Inquiry', next: 'account' },
      { label: 'Book Appointment (Form Module)', next: 'appointment_start' }
    ]
  },
  toggle_theme: {
    q: 'Theme toggled!',
    action: () => document.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'),
    options: []
  },
  transaction: {
    q: 'An executive will reach out to you.',
    options: []
  },
  account: {
    q: 'Which account do you need help with?',
    options: [
      { label: 'Savings', next: 'savings' },
      { label: 'Current', next: 'current' },
      { label: 'Fixed Deposit', next: 'fixed_deposit' }
    ]
  },
  savings: {
    q: 'All executives are busy. Try later!',
    options: [{ label: 'Check another account', next: 'account' }]
  },
  current: {
    q: 'Account details sent to your email.',
    options: [] // Dead end -> will automatically append "Any other help?" and restart
  },
  fixed_deposit: {
    q: 'Our executive will call you. Please wait.',
    options: []
  }
};

const appointmentFormScript = {
  appointment_start: {
    q: 'Let\\'s get your appointment booked. What is your full name?',
    type: 'input',
    field: 'name',
    next: 'appointment_email'
  },
  appointment_email: {
    q: 'What is your email address?',
    type: 'input',
    field: 'email',
    next: 'appointment_confirm'
  },
  appointment_confirm: {
    q: 'Got it. I have prepared your form. Shall I submit the appointment request?',
    options: [
      { label: 'Submit', next: 'appointment_success' },
      { label: 'Cancel & Restart Form', next: 'appointment_start' }
    ]
  },
  appointment_success: {
    q: 'Appointment booked successfully! You will receive a confirmation shortly.',
    options: [] // Dead end -> automatically restarts
  }
};

const botData = {
  startNode: 'start',
  nodes: {
    // We plug the two scripts together here!
    ...bankingScript,
    ...appointmentFormScript
  }
};

return botData;`;

export const profilepicture_bot =
  'https://www.meme-arsenal.com/memes/d8088c66439d176239e57f445da6834e.jpg';
export const profilepicture_user =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhRm11Dvf-GgGT-NMx_CWmVQNiBJRpWaLaB7pVSCc_c_X8bggRVj3-AGdhIADak6_g_W4&usqp=CAU';
