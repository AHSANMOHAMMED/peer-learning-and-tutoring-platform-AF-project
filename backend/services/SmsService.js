/**
 * Mock SMS Service for PeerLearn
 * In a production environment, this would integrate with a provider like Twilio, Nexmo, or AWS SNS.
 */
class SmsService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.senderId = process.env.SMS_SENDER_ID || 'PeerLearn';
  }

  /**
   * Send an OTP via SMS
   * @param {string} phoneNumber - Recipient's phone number
   * @param {string} otp - 6-digit code
   */
  async sendOTP(phoneNumber, otp) {
    try {
      const message = `Your PeerLearn verification code is: ${otp}. Valid for 10 minutes.`;
      
      // Mocking the external API call
      console.log('--- 📱 MOCK SMS SENT ---');
      console.log(`TO: ${phoneNumber}`);
      console.log(`MESSAGE: ${message}`);
      console.log('------------------------');

      // For production integration, you would use:
      // await axios.post(...) or sdk.sendMessage(...)

      return { success: true, messageId: `mock-sms-${Date.now()}` };
    } catch (error) {
      console.error('❌ SMS Sending Error:', error);
      throw new Error('Failed to send SMS');
    }
  }

  /**
   * Send a custom notification via SMS
   * @param {string} phoneNumber 
   * @param {string} message 
   */
  async sendNotification(phoneNumber, message) {
    try {
      console.log(`📱 MOCK NOTIFICATION SENT TO ${phoneNumber}: ${message}`);
      return { success: true };
    } catch (error) {
       console.error('❌ SMS Notification Error:', error);
       return { success: false };
    }
  }
}

module.exports = new SmsService();
