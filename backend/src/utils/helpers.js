/**
 * Generate a random confirmation code
 * @param {number} length - Length of the code
 * @returns {string} Random confirmation code
 */
const generateConfirmationCode = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Generate OTP (for mock purposes, always returns 123456 in dev)
 * @returns {string} OTP code
 */
const generateOTP = () => {
  if (process.env.NODE_ENV === 'development' && process.env.OTP_MOCK) {
    return process.env.OTP_MOCK;
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Add minutes to a date
 * @param {Date} date - The date to add minutes to
 * @param {number} minutes - Number of minutes to add
 * @returns {Date} New date with added minutes
 */
const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

module.exports = {
  generateConfirmationCode,
  generateOTP,
  addMinutes
};
