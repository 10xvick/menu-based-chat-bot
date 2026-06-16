export const dataCode = `// Apex Bank Virtual Assistant Script
// Organized by Category with Interactive Actions & Form Capturing

const accountServices = {
  accounts_menu: {
    q: 'Account Services Menu. What would you like to do?',
    options: [
      { label: 'Check Account Balances', next: 'account' },
      { label: 'Apply for Credit Card', next: 'card_start' },
      { label: '⬅️ Back to Main Menu', next: 'start' }
    ]
  },
  account: {
    q: 'Which account do you need help with?',
    options: [
      { label: 'Savings Account', next: 'savings' },
      { label: 'Current Account', next: 'current' },
      { label: 'Fixed Deposit Account', next: 'fixed_deposit' },
      { label: '⬅️ Back to Accounts Menu', next: 'accounts_menu' }
    ]
  },
  savings: {
    q: 'Your savings account balance is $12,450.50.\\nNeed any other account balance?',
    options: [
      { label: 'Current Account', next: 'current' },
      { label: 'Fixed Deposit Account', next: 'fixed_deposit' },
      { label: '⬅️ Back to Accounts Menu', next: 'accounts_menu' }
    ]
  },
  current: {
    q: 'Your current account balance is $3,820.15.\\nNeed any other account balance?',
    options: [
      { label: 'Savings Account', next: 'savings' },
      { label: 'Fixed Deposit Account', next: 'fixed_deposit' },
      { label: '⬅️ Back to Accounts Menu', next: 'accounts_menu' }
    ]
  },
  fixed_deposit: {
    q: 'Your fixed deposit account balance is $50,000.00 (Matures Dec 2026).\\nNeed any other account balance?',
    options: [
      { label: 'Savings Account', next: 'savings' },
      { label: 'Current Account', next: 'current' },
      { label: '⬅️ Back to Accounts Menu', next: 'accounts_menu' }
    ]
  },
  card_start: {
    q: 'Sure, let\\'s check your credit card eligibility. What is your monthly income?',
    type: 'input',
    field: 'monthly_income',
    next: 'card_evaluate'
  },
  card_evaluate: {
    q: 'Evaluating eligibility...',
    options: [
      { label: 'Show Offer', next: 'card_offer' }
    ]
  },
  card_offer: {
    q: 'Congratulations! You are eligible for our Apex Platinum Card with a $15,000 limit.',
    options: [] // Dead end -> auto-prompt restart
  }
};

const technicalSupport = {
  support_menu: {
    q: 'Technical Support Menu. How can we help?',
    options: [
      { label: 'Toggle App Dark/Light Theme', next: 'toggle_theme' },
      { label: 'Report Transaction Issue', next: 'transaction' },
      { label: '⬅️ Back to Main Menu', next: 'start' }
    ]
  },
  toggle_theme: {
    q: 'App theme toggled! You can toggle it again or return to the support menu.',
    action: () => document.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'),
    options: [
      { label: 'Toggle Theme Again', next: 'toggle_theme' },
      { label: '⬅️ Back to Support Menu', next: 'support_menu' }
    ]
  },
  transaction: {
    q: 'We are sorry you had a transaction issue. An executive will reach out to you within 24 hours.',
    options: [] // Dead end -> auto-prompt restart
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
      { label: 'Submit Appointment', next: 'appointment_success' },
      { label: 'Cancel & Restart Form', next: 'appointment_start' }
    ]
  },
  appointment_success: {
    q: 'Appointment booked successfully! You will receive a confirmation shortly.',
    options: [] // Dead end -> auto-prompt restart
  }
};

const botData = {
  startNode: 'start',
  nodes: {
    start: {
      q: 'Hi! Welcome to Apex Bank. How can we help you today?',
      options: [
        { label: '💳 Account Services', next: 'accounts_menu' },
        { label: '🛠️ Technical Support', next: 'support_menu' },
        { label: '📅 Schedule Appointment', next: 'appointment_start' }
      ]
    },
    ...accountServices,
    ...technicalSupport,
    ...appointmentFormScript
  }
};

return botData;`;

export const profilepicture_bot =
  'https://www.meme-arsenal.com/memes/d8088c66439d176239e57f445da6834e.jpg';
export const profilepicture_user =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhRm11Dvf-GgGT-NMx_CWmVQNiBJRpWaLaB7pVSCc_c_X8bggRVj3-AGdhIADak6_g_W4&usqp=CAU';
