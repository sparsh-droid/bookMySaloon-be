const User = require('./User');
const Salon = require('./Salon');
const Service = require('./Service');
const Booking = require('./Booking');
const BookingService = require('./BookingService');
const Payment = require('./Payment');
const OTP = require('./OTP');

// Define associations
Salon.hasMany(Service, { foreignKey: 'salonId', as: 'services' });
Service.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Salon.hasMany(Booking, { foreignKey: 'salonId', as: 'bookings' });
Booking.belongsTo(Salon, { foreignKey: 'salonId', as: 'salon' });

// Many-to-many relationship between Booking and Service through BookingService
Booking.belongsToMany(Service, {
  through: BookingService,
  foreignKey: 'bookingId',
  otherKey: 'serviceId',
  as: 'services'
});
Service.belongsToMany(Booking, {
  through: BookingService,
  foreignKey: 'serviceId',
  otherKey: 'bookingId',
  as: 'bookings'
});

// Direct associations with BookingService
Booking.hasMany(BookingService, { foreignKey: 'bookingId', as: 'bookingServices' });
BookingService.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

Service.hasMany(BookingService, { foreignKey: 'serviceId', as: 'bookingServices' });
BookingService.belongsTo(Service, { foreignKey: 'serviceId', as: 'service' });

Booking.hasOne(Payment, { foreignKey: 'bookingId', as: 'payment' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

module.exports = {
  User,
  Salon,
  Service,
  Booking,
  BookingService,
  Payment,
  OTP
};
