export const dataCode = `// Virtual Assistant Bot

const accountServices = {
  accounts_menu: {
    q: "I'd be happy to help with your accounts. Are you looking to check your balances, or would you like to apply for a credit card?",
    options: [
      { label: "Check my account balances", next: 'account' },
      { label: "Apply for a credit card", next: 'card_start' },
      { label: "Actually, let's start over", next: 'start' }
    ]
  },
  account: {
    q: "Sure! Which account balance would you like to see?",
    options: [
      { label: "My savings account", next: 'savings' },
      { label: "My current account", next: 'current' },
      { label: "My fixed deposit account", next: 'fixed_deposit' },
      { label: "Take me back to account help", next: 'accounts_menu' }
    ]
  },
  savings: {
    q: "Your savings account has a balance of $12,450.50. Would you like to check another account?",
    options: [
      { label: "Yes, show me my current account", next: 'current' },
      { label: "Show me my fixed deposit", next: 'fixed_deposit' },
      { label: "Go back to account questions", next: 'accounts_menu' }
    ]
  },
  current: {
    q: "Your current account balance is $3,820.15. Would you like to see another?",
    options: [
      { label: "Yes, show my savings", next: 'savings' },
      { label: "Show my fixed deposit", next: 'fixed_deposit' },
      { label: "Go back to account help", next: 'accounts_menu' }
    ]
  },
  fixed_deposit: {
    q: "Your fixed deposit stands at $50,000.00 and matures in December 2026. Need to check another account?",
    options: [
      { label: "Check my savings", next: 'savings' },
      { label: "Check my current account", next: 'current' },
      { label: "Go back to account questions", next: 'accounts_menu' }
    ]
  },
  card_start: {
    q: "Great! Let's see if you qualify for our Apex Platinum Card. Could you tell me your monthly income?",
    type: 'input',
    field: 'monthly_income',
    next: 'card_evaluate'
  },
  card_evaluate: {
    q: "Just a moment while I check your eligibility...",
    action: () => new Promise((resolve) => setTimeout(resolve, 2000)),
    next: 'card_offer'
  },
  card_offer: {
    q: "Congratulations! You're eligible for the Apex Platinum Card with a $15,000 credit limit. 🎉",
    options: []
  }
};

const technicalSupport = {
  support_menu: {
    q: "Of course. What kind of technical issue are you facing? I can help with interface settings, card problems, or other system issues.",
    options: [
      { label: "I need help with the interface or accessibility", next: 'ui_controls' },
      { label: "I'm having trouble with my card or a transaction", next: 'card_issues' },
      { label: "Let's go back to the beginning", next: 'start' }
    ]
  },
  ui_controls: {
    q: "I can adjust the app's appearance for you. What would you like to change?",
    options: [
      { label: "Toggle dark/light theme", next: 'toggle_theme' },
      { label: "Adjust the text size", next: 'adjust_zoom' },
      { label: "Take me back to support options", next: 'support_menu' }
    ]
  },
  toggle_theme: {
    q: "I've switched the theme for you. How does it look? You can toggle it again or head back.",
    action: () => document.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'),
    options: [
      { label: "Toggle the theme again", next: 'toggle_theme' },
      { label: "Go back to interface settings", next: 'ui_controls' }
    ]
  },
  adjust_zoom: {
    q: "I've adjusted the text size for you. Feel free to cycle through the sizes or go back.",
    action: () => {
      const current = document.documentElement.style.fontSize || '16px';
      if (current === '16px') {
        document.documentElement.style.fontSize = '18px';
      } else if (current === '18px') {
        document.documentElement.style.fontSize = '14px';
      } else {
        document.documentElement.style.fontSize = '16px';
      }
    },
    options: [
      { label: "Cycle the zoom again", next: 'adjust_zoom' },
      { label: "Return to interface settings", next: 'ui_controls' }
    ]
  },
  card_issues: {
    q: "I understand. Which card or transaction problem are you experiencing?",
    options: [
      { label: "My card was stolen – I need to block it", next: 'stolen_card' },
      { label: "I want to dispute a transaction", next: 'dispute_transaction' },
      { label: "Take me back to support", next: 'support_menu' }
    ]
  },
  stolen_card: {
    q: "I'm sorry to hear that. To block your card, please enter the last 4 digits of your card number:",
    type: 'input',
    field: 'card_last_digits',
    next: 'stolen_card_confirm'
  },
  stolen_card_confirm: {
    q: "Thank you. Your card has been temporarily blocked for safety. A representative will reach out soon to arrange a replacement.",
    options: []
  },
  dispute_transaction: {
    q: "We've logged your dispute. Our compliance team will review the transaction and get back to you via email.",
    options: []
  }
};

const entertainment = {
  fun_menu: {
    q: "Looking for a little fun? I can show a random cat photo, check the weather anywhere, grab some developer news, or tell you a joke. What tickles your fancy?",
    options: [
      { label: "Show me a random cat picture 🐱", next: 'cat_pic' },
      { label: "Get me a weather forecast", next: 'weather_city_select' },
      { label: "Give me the latest developer headlines", next: 'dev_news' },
      { label: "Tell me a dad joke", next: 'dad_joke' },
      { label: "Actually, I'd like to start over", next: 'start' }
    ]
  },
  cat_pic: {
    q: "Hang on, let me fetch a cute cat for you...",
    action: (updateQuestion) => {
      return new Promise((resolve) => {
        fetch('https://api.thecatapi.com/v1/images/search')
          .then(res => res.json())
          .then(data => {
            if (data && data[0] && data[0].url) {
              const url = data[0].url;
              updateQuestion('Meow! Here’s a random cat image for you: ' + url);
              resolve();
            } else {
              updateQuestion('Oops, I couldn’t get a cat picture. Try again?');
              resolve();
            }
          })
          .catch(err => {
            updateQuestion('Error fetching cat picture: ' + err.message);
            resolve();
          });
      });
    },
    options: [
      { label: "Show me another cat", next: 'cat_pic' },
      { label: "Take me back to the fun stuff", next: 'fun_menu' }
    ]
  },
  weather_city_select: {
    q: "Which city would you like the weather for?",
    options: [
      { label: "New York 🇺🇸", next: 'weather_ny' },
      { label: "London 🇬🇧", next: 'weather_london' },
      { label: "Tokyo 🇯🇵", next: 'weather_tokyo' },
      { label: "Paris 🇫🇷", next: 'weather_paris' },
      { label: "Mumbai 🇮🇳", next: 'weather_mumbai' },
      { label: "Take me back to the fun stuff", next: 'fun_menu' }
    ]
  },
  weather_ny: {
    q: "Fetching New York weather...",
    action: (updateQuestion) => {
      return new Promise((resolve) => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current_weather=true')
          .then(res => res.json())
          .then(data => {
            if (data && data.current_weather) {
              const temp = data.current_weather.temperature;
              const wind = data.current_weather.windspeed;
              updateQuestion(\`Current weather in New York: \\n🌡️ Temperature: \${temp}°C\\n💨 Wind Speed: \${wind} km/h\`);
            } else {
              updateQuestion('Couldn’t get the weather for New York.');
            }
            resolve();
          })
          .catch(err => {
            updateQuestion('Weather error: ' + err.message);
            resolve();
          });
      });
    },
    options: [
      { label: "Refresh the weather", next: 'weather_ny' },
      { label: "Check another city", next: 'weather_city_select' },
      { label: "Back to the fun stuff", next: 'fun_menu' }
    ]
  },
  weather_london: {
    q: "Fetching London weather...",
    action: (updateQuestion) => {
      return new Promise((resolve) => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current_weather=true')
          .then(res => res.json())
          .then(data => {
            if (data && data.current_weather) {
              const temp = data.current_weather.temperature;
              const wind = data.current_weather.windspeed;
              updateQuestion(\`Current weather in London: \\n🌡️ Temperature: \${temp}°C\\n💨 Wind Speed: \${wind} km/h\`);
            } else {
              updateQuestion('Couldn’t get the weather for London.');
            }
            resolve();
          })
          .catch(err => {
            updateQuestion('Weather error: ' + err.message);
            resolve();
          });
      });
    },
    options: [
      { label: "Refresh the weather", next: 'weather_london' },
      { label: "Check another city", next: 'weather_city_select' },
      { label: "Back to the fun stuff", next: 'fun_menu' }
    ]
  },
  weather_tokyo: {
    q: "Fetching Tokyo weather...",
    action: (updateQuestion) => {
      return new Promise((resolve) => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current_weather=true')
          .then(res => res.json())
          .then(data => {
            if (data && data.current_weather) {
              const temp = data.current_weather.temperature;
              const wind = data.current_weather.windspeed;
              updateQuestion(\`Current weather in Tokyo: \\n🌡️ Temperature: \${temp}°C\\n💨 Wind Speed: \${wind} km/h\`);
            } else {
              updateQuestion('Couldn’t get the weather for Tokyo.');
            }
            resolve();
          })
          .catch(err => {
            updateQuestion('Weather error: ' + err.message);
            resolve();
          });
      });
    },
    options: [
      { label: "Refresh the weather", next: 'weather_tokyo' },
      { label: "Check another city", next: 'weather_city_select' },
      { label: "Back to the fun stuff", next: 'fun_menu' }
    ]
  },
  weather_paris: {
    q: "Fetching Paris weather...",
    action: (updateQuestion) => {
      return new Promise((resolve) => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true')
          .then(res => res.json())
          .then(data => {
            if (data && data.current_weather) {
              const temp = data.current_weather.temperature;
              const wind = data.current_weather.windspeed;
              updateQuestion(\`Current weather in Paris: \\n🌡️ Temperature: \${temp}°C\\n💨 Wind Speed: \${wind} km/h\`);
            } else {
              updateQuestion('Couldn’t get the weather for Paris.');
            }
            resolve();
          })
          .catch(err => {
            updateQuestion('Weather error: ' + err.message);
            resolve();
          });
      });
    },
    options: [
      { label: "Refresh the weather", next: 'weather_paris' },
      { label: "Check another city", next: 'weather_city_select' },
      { label: "Back to the fun stuff", next: 'fun_menu' }
    ]
  },
  weather_mumbai: {
    q: "Fetching Mumbai weather...",
    action: (updateQuestion) => {
      return new Promise((resolve) => {
        fetch('https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current_weather=true')
          .then(res => res.json())
          .then(data => {
            if (data && data.current_weather) {
              const temp = data.current_weather.temperature;
              const wind = data.current_weather.windspeed;
              updateQuestion(\`Current weather in Mumbai: \\n🌡️ Temperature: \${temp}°C\\n💨 Wind Speed: \${wind} km/h\`);
            } else {
              updateQuestion('Couldn’t get the weather for Mumbai.');
            }
            resolve();
          })
          .catch(err => {
            updateQuestion('Weather error: ' + err.message);
            resolve();
          });
      });
    },
    options: [
      { label: "Refresh the weather", next: 'weather_mumbai' },
      { label: "Check another city", next: 'weather_city_select' },
      { label: "Back to the fun stuff", next: 'fun_menu' }
    ]
  },
  dev_news: {
    q: "Grabbing the latest developer headlines from Dev.to...",
    action: (updateQuestion) => {
      return new Promise((resolve) => {
        fetch('https://dev.to/api/articles?per_page=3')
          .then(res => res.json())
          .then(articles => {
            if (Array.isArray(articles) && articles.length > 0) {
              const list = articles.map((a, i) => \`\${i + 1}. \${a.title}\\n🔗 \${a.url}\`).join('\\n\\n');
              updateQuestion('Here are the latest developer headlines:\\n\\n' + list);
            } else {
              updateQuestion('No news found at the moment.');
            }
            resolve();
          })
          .catch(err => {
            updateQuestion('Error fetching news: ' + err.message);
            resolve();
          });
      });
    },
    options: [
      { label: "Refresh the news", next: 'dev_news' },
      { label: "Back to the fun stuff", next: 'fun_menu' }
    ]
  },
  dad_joke: {
    q: "Let me find a good one for you...",
    action: (updateQuestion) => {
      return new Promise((resolve) => {
        fetch('https://icanhazdadjoke.com/', { headers: { 'Accept': 'application/json' } })
          .then(res => res.json())
          .then(data => {
            if (data && data.joke) {
              updateQuestion(data.joke);
            } else {
              updateQuestion('Sorry, I couldn’t get a joke right now.');
            }
            resolve();
          })
          .catch(err => {
            updateQuestion('Joke error: ' + err.message);
            resolve();
          });
      });
    },
    options: [
      { label: "Tell me another joke", next: 'dad_joke' },
      { label: "Back to the fun stuff", next: 'fun_menu' }
    ]
  }
};

const appointmentFormScript = {
  appointment_start: {
    q: "Sure! Let's get you booked. May I have your full name?",
    type: 'input',
    field: 'name',
    next: 'appointment_email'
  },
  appointment_email: {
    q: "And your email address, please?",
    type: 'input',
    field: 'email',
    next: 'appointment_confirm'
  },
  appointment_confirm: {
    q: "Perfect, I've prepared your appointment request. Ready to submit?",
    options: [
      { label: "Yes, submit my appointment", next: 'appointment_success' },
      { label: "No, let me restart the form", next: 'appointment_start' }
    ]
  },
  appointment_success: {
    q: "Done! Your appointment is confirmed. You'll receive a confirmation email shortly.",
    options: []
  }
};

const botData = {
  startNode: 'start',
  nodes: {
    start: {
      q: "Hello! Welcome to Apex Bank. How can I assist you today? I can help with account services, technical support, booking an appointment, or even share some fun content with you.",
      options: [
        { label: "I need help with my accounts", next: 'accounts_menu' },
        { label: "I have a technical issue", next: 'support_menu' },
        { label: "I'd like to schedule an appointment", next: 'appointment_start' },
        { label: "Surprise me with something fun", next: 'fun_menu' }
      ]
    },
    ...accountServices,
    ...technicalSupport,
    ...entertainment,
    ...appointmentFormScript
  }
};

return botData;`;

export const profilepicture_bot =
  'https://www.meme-arsenal.com/memes/d8088c66439d176239e57f445da6834e.jpg';
export const profilepicture_user =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhRm11Dvf-GgGT-NMx_CWmVQNiBJRpWaLaB7pVSCc_c_X8bggRVj3-AGdhIADak6_g_W4&usqp=CAU';
