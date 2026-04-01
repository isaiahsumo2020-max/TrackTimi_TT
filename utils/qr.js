const QRCode = require('qrcode');

const qrUtils = {
  // Generate user QR code (format: "userId:userName")
  generateUserQR: (userId, userName) => {
    const data = `tracktimi:${userId}:${userName.replace(/ /g, '_')}`;
    return QRCode.toDataURL(data);
  },

  // Generate shift QR code  
  generateShiftQR: (shiftId, userId) => {
    const data = `tracktimi:shift:${shiftId}:${userId}`;
    return QRCode.toDataURL(data);
  },

  // Validate QR data format
  validateQRData: (qrData) => {
    const parts = qrData.split(':');
    if (parts[0] !== 'tracktimi') return false;
    
    if (parts[1] === 'user') {
      return { type: 'user', userId: parts[2], userName: parts[3] };
    }
    if (parts[1] === 'shift') {
      return { type: 'shift', shiftId: parts[2], userId: parts[3] };
    }
    return false;
  }
};

module.exports = qrUtils;
