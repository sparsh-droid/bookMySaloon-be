require('dotenv').config();
const { Salon, Service } = require('../models');
const logger = require('../config/logger');

const salonsData = [
  // Delhi NCR
  { name: 'Glamour Studio', city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Beauty Haven', city: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  { name: 'Elite Cuts', city: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.3910 },
  { name: 'Style & Grace', city: 'Faridabad', state: 'Haryana', lat: 28.4089, lng: 77.3178 },
  { name: 'The Salon Lounge', city: 'Rohtak', state: 'Haryana', lat: 28.8955, lng: 76.6066 },
  { name: 'Elegant Touch', city: 'Connaught Place', state: 'Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'Modern Hair Lab', city: 'Dwarka', state: 'Delhi', lat: 28.5921, lng: 77.0460 },
  { name: 'Luxe Beauty Bar', city: 'Saket', state: 'Delhi', lat: 28.5244, lng: 77.2066 },

  // Mumbai & Maharashtra
  { name: 'Chic Salon & Spa', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Radiance Studio', city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Trendy Tresses', city: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781 },
  { name: 'Pure Bliss Salon', city: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882 },
  { name: 'Urban Glow', city: 'Navi Mumbai', state: 'Maharashtra', lat: 19.0330, lng: 73.0297 },

  // Bangalore & Karnataka
  { name: 'The Hair Sanctuary', city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Serenity Spa & Salon', city: 'Mysore', state: 'Karnataka', lat: 12.2958, lng: 76.6394 },
  { name: 'Refresh Beauty Studio', city: 'Mangalore', state: 'Karnataka', lat: 12.9141, lng: 74.8560 },

  // Hyderabad & Telangana
  { name: 'Premier Hair Design', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
  { name: 'Divine Locks', city: 'Secunderabad', state: 'Telangana', lat: 17.4399, lng: 78.4983 },

  // Chennai & Tamil Nadu
  { name: 'Bliss & Beauty', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Crown & Glory Salon', city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { name: 'Vintage Vibes Salon', city: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198 },

  // Kolkata & West Bengal
  { name: 'Silk & Scissors', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'Polished Beauty Bar', city: 'Salt Lake', state: 'West Bengal', lat: 22.5697, lng: 88.4346 },

  // Ahmedabad & Gujarat
  { name: 'Mirror Mirror Salon', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Allure Hair Studio', city: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311 },
  { name: 'Glitz & Glam', city: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812 },

  // Jaipur & Rajasthan
  { name: 'Bella Vita Salon', city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Perfect Cuts Studio', city: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243 },
  { name: 'Oasis Hair Lounge', city: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lng: 73.7125 },

  // Chandigarh & Punjab
  { name: 'Luxe Locks Salon', city: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Salon Magnifique', city: 'Ludhiana', state: 'Punjab', lat: 30.9010, lng: 75.8573 },
  { name: 'Renaissance Beauty', city: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723 },

  // Kerala
  { name: 'Uptown Hair Design', city: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673 },
  { name: 'Azure Salon & Spa', city: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366 },
  { name: 'Velvet Touch Salon', city: 'Kozhikode', state: 'Kerala', lat: 11.2588, lng: 75.7804 },

  // Lucknow & Uttar Pradesh
  { name: 'Metropolitan Hair', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Sculpted Beauty Bar', city: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319 },
  { name: 'Enigma Hair Studio', city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lng: 82.9739 },

  // Other Major Cities
  { name: 'The Glam Room', city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { name: 'Shear Elegance', city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { name: 'Platinum Salon', city: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
  { name: 'Haute Hair Boutique', city: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245 },
  { name: 'Reflections Salon', city: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  { name: 'Studio 54 Hair', city: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lng: 80.6480 },
  { name: 'Charm City Cuts', city: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lng: 85.3096 },
  { name: 'Fusion Hair Gallery', city: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lng: 81.6296 },
  { name: 'Illusions Salon Spa', city: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lng: 78.0322 },
  { name: 'Soleil Beauty Studio', city: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { name: 'Velvet Hair Lounge', city: 'Jammu', state: 'Jammu and Kashmir', lat: 32.7266, lng: 74.8570 },
  { name: 'Majestic Hair Design', city: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lng: 77.4538 }
];

const serviceTemplates = [
  { name: 'Haircut - Men', category: 'haircut', price: 25.00, duration: 30, gender: 'male' },
  { name: 'Haircut - Women', category: 'haircut', price: 45.00, duration: 45, gender: 'female' },
  { name: 'Hair Coloring', category: 'coloring', price: 85.00, duration: 120, gender: 'unisex' },
  { name: 'Highlights', category: 'coloring', price: 95.00, duration: 150, gender: 'unisex' },
  { name: 'Blow Dry & Style', category: 'styling', price: 35.00, duration: 40, gender: 'female' },
  { name: 'Keratin Treatment', category: 'treatment', price: 150.00, duration: 180, gender: 'unisex' },
  { name: 'Manicure', category: 'nails', price: 20.00, duration: 30, gender: 'unisex' },
  { name: 'Pedicure', category: 'nails', price: 35.00, duration: 45, gender: 'unisex' },
  { name: 'Facial - Basic', category: 'facial', price: 60.00, duration: 60, gender: 'unisex' },
  { name: 'Facial - Premium', category: 'facial', price: 95.00, duration: 90, gender: 'unisex' },
  { name: 'Waxing - Eyebrows', category: 'waxing', price: 15.00, duration: 15, gender: 'female' },
  { name: 'Waxing - Full Face', category: 'waxing', price: 30.00, duration: 30, gender: 'female' },
  { name: 'Makeup - Basic', category: 'makeup', price: 40.00, duration: 45, gender: 'female' },
  { name: 'Makeup - Bridal', category: 'makeup', price: 120.00, duration: 90, gender: 'female' },
  { name: 'Beard Trim & Shape', category: 'beard', price: 18.00, duration: 20, gender: 'male' },
  { name: 'Hair Spa', category: 'treatment', price: 80.00, duration: 60, gender: 'unisex' },
  { name: 'Head Massage', category: 'massage', price: 30.00, duration: 30, gender: 'unisex' },
  { name: 'Shave', category: 'shaving', price: 15.00, duration: 20, gender: 'male' }
];

const runSeeds = async () => {
  try {
    logger.info('Starting database seeding...');

    // Check if salons already exist
    const existingSalons = await Salon.count();
    if (existingSalons > 0) {
      logger.info(`Database already has ${existingSalons} salons. Skipping seeding.`);
      process.exit(0);
    }

    // Create salons
    for (const salonData of salonsData) {
      const salon = await Salon.create({
        name: salonData.name,
        description: `Welcome to ${salonData.name}, your premier destination for beauty and wellness services.`,
        address: `${Math.floor(Math.random() * 9999) + 1} Main Street`,
        city: salonData.city,
        state: salonData.state,
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        latitude: salonData.lat,
        longitude: salonData.lng,
        phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        email: `info@${salonData.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
        rating: (Math.random() * 2 + 3).toFixed(2), // 3.00 to 5.00
        totalReviews: Math.floor(Math.random() * 500) + 50,
        imageUrl: `https://picsum.photos/seed/${salonData.name}/400/300`,
        openingTime: '09:00:00',
        closingTime: '21:00:00',
        isActive: true
      });

      // Add services to each salon (randomly select 8-12 services)
      const numServices = Math.floor(Math.random() * 5) + 8;
      const shuffled = [...serviceTemplates].sort(() => 0.5 - Math.random());
      const selectedServices = shuffled.slice(0, numServices);

      for (const serviceTemplate of selectedServices) {
        const priceVariation = (Math.random() * 20) - 10; // ±$10 variation
        await Service.create({
          salonId: salon.id,
          name: serviceTemplate.name,
          description: `Professional ${serviceTemplate.name.toLowerCase()} service by our expert stylists.`,
          price: Math.max(10, serviceTemplate.price + priceVariation).toFixed(2),
          duration: serviceTemplate.duration,
          category: serviceTemplate.category,
          gender: serviceTemplate.gender,
          isActive: true
        });
      }

      logger.info(`Created salon: ${salon.name} with ${numServices} services`);
    }

    logger.info('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeds();
