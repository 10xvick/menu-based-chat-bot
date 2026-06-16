export const ecommerceExampleCode = `const botData = {
  startNode: 'start',
  nodes: {
    start: {
      q: 'Hi! Welcome to ShopNova. How can I help you today?',
      options: [
        { label: 'Track Order', next: 'track_order' },
        { label: 'Returns & Refunds', next: 'returns' },
        { label: 'Talk to an Agent', next: 'agent' }
      ]
    },
    track_order: {
      q: 'Please enter your 6-digit order number:',
      type: 'input',
      field: 'orderNumber',
      next: 'track_result'
    },
    track_result: {
      q: 'Checking your order...',
      action: () => {
        // Mock action that could fetch order details
      },
      options: [
        { label: 'View Result', next: 'track_done' }
      ]
    },
    track_done: {
      q: 'Your order is currently out for delivery and will arrive by 8 PM today.',
      options: []
    },
    returns: {
      q: 'What seems to be the issue with your item?',
      options: [
        { label: 'Damaged Item', next: 'damaged' },
        { label: 'Wrong Size', next: 'wrong_size' }
      ]
    },
    damaged: {
      q: 'We are so sorry about that! A return label has been emailed to you.',
      options: []
    },
    wrong_size: {
      q: 'No problem. Would you like an exchange or a full refund?',
      options: [
        { label: 'Exchange', next: 'exchange' },
        { label: 'Refund', next: 'refund' }
      ]
    },
    exchange: {
      q: 'Please reply to our support email with the required size.',
      options: []
    },
    refund: {
      q: 'Your refund will be processed within 3-5 business days.',
      options: []
    },
    agent: {
      q: 'Connecting you to our next available support agent. Current wait time: 2 minutes.',
      options: []
    }
  }
};

return botData;`;

export const itSupportExampleCode = `const botData = {
  startNode: 'start',
  nodes: {
    start: {
      q: 'IT Service Desk here. What issue are you experiencing?',
      options: [
        { label: 'Password Reset', next: 'password' },
        { label: 'Network Issues', next: 'network' }
      ]
    },
    password: {
      q: 'Which system are you locked out of?',
      options: [
        { label: 'Email', next: 'email_pass' },
        { label: 'Internal VPN', next: 'vpn_pass' }
      ]
    },
    email_pass: {
      q: 'A reset link has been sent to your secondary email.',
      options: []
    },
    vpn_pass: {
      q: 'VPN resets require manager approval. Shall I raise a ticket?',
      options: [
        { label: 'Yes, please', next: 'ticket_created' },
        { label: 'No, thanks', next: 'start' }
      ]
    },
    ticket_created: {
      q: 'Ticket #IT-8842 has been created. Manager notified.',
      options: []
    },
    network: {
      q: 'Are you working from the office or remotely?',
      options: [
        { label: 'Office', next: 'office_net' },
        { label: 'Remotely', next: 'remote_net' }
      ]
    },
    office_net: {
      q: 'We are aware of a partial outage. ETA: 30 minutes.',
      options: []
    },
    remote_net: {
      q: 'Please ensure your VPN client is updated to v4.2.1.',
      options: []
    }
  }
};

return botData;`;

export const appointmentExampleCode = `const botData = {
  startNode: 'start',
  nodes: {
    start: {
      q: 'Hello! What would you like to do?',
      options: [
        { label: 'Book Appointment', next: 'book' },
        { label: 'Cancel Appointment', next: 'cancel' }
      ]
    },
    book: {
      q: 'Which service are you looking to book?',
      options: [
        { label: 'General Checkup', next: 'checkup' },
        { label: 'Dental Cleaning', next: 'dental' }
      ]
    },
    checkup: {
      q: 'Our next available slot is Wednesday at 10:00 AM. Does that work?',
      options: [
        { label: 'Yes', next: 'confirm_book' },
        { label: 'No, show other options', next: 'call_us' }
      ]
    },
    dental: {
      q: 'We have availability on Friday at 2:00 PM or 4:00 PM.',
      options: [
        { label: '2:00 PM', next: 'confirm_book' },
        { label: '4:00 PM', next: 'confirm_book' }
      ]
    },
    confirm_book: {
      q: 'Great! Your appointment is confirmed.',
      options: []
    },
    call_us: {
      q: 'Please call our front desk at 555-0192.',
      options: []
    },
    cancel: {
      q: 'Are you sure you want to cancel your upcoming appointment?',
      options: [
        { label: 'Yes, cancel it', next: 'canceled' },
        { label: 'No, keep it', next: 'start' }
      ]
    },
    canceled: {
      q: 'Your appointment has been successfully canceled.',
      options: []
    }
  }
};

return botData;`;
