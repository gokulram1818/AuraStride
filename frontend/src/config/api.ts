import { Platform } from 'react-native';

// FOR PHYSICAL DEVICES RUNNING EXPO GO:
// Replace 'localhost' with your computer's local IP address (e.g., '192.168.1.15')
const DEV_MACHINE_IP = '172.20.10.3';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.select({
  ios: `http://${DEV_MACHINE_IP}:5000/api`,
  android: `http://10.0.2.2:5000/api`, // Android Emulator loopback
  default: `http://localhost:5000/api`,
}) as string);

console.log(`Aurastride API URL set to: ${API_URL}`);
