import { Alert as RNAlert, Platform } from 'react-native';

const alertPolyfill = (title: string, message?: string, buttons?: any[]) => {
  if (Platform.OS === 'web') {
    const msg = message ? `${title}\n\n${message}` : title;
    
    if (!buttons || buttons.length === 0) {
      window.alert(msg);
      return;
    }

    if (buttons.length > 2) {
      const optionsText = buttons
        .map((btn, index) => `${index + 1}. ${btn.text}`)
        .join('\n');
      const choice = window.prompt(`${msg}\n\nEnter the number of your choice:\n${optionsText}`);
      if (choice !== null) {
        const index = parseInt(choice.trim(), 10) - 1;
        if (index >= 0 && index < buttons.length) {
          const selectedBtn = buttons[index];
          if (selectedBtn && typeof selectedBtn.onPress === 'function') {
            selectedBtn.onPress();
            return;
          }
        }
      }
      const cancelBtn = buttons.find(btn => btn.style === 'cancel');
      if (cancelBtn && typeof cancelBtn.onPress === 'function') {
        cancelBtn.onPress();
      }
      return;
    }

    const result = window.confirm(msg);
    if (result) {
      const confirmBtn = buttons.find(btn => btn.style !== 'cancel') || buttons[0];
      if (confirmBtn && typeof confirmBtn.onPress === 'function') {
        confirmBtn.onPress();
      }
    } else {
      const cancelBtn = buttons.find(btn => btn.style === 'cancel');
      if (cancelBtn && typeof cancelBtn.onPress === 'function') {
        cancelBtn.onPress();
      }
    }
  } else {
    RNAlert.alert(title, message, buttons);
  }
};

export const Alert = {
  alert: alertPolyfill
};

