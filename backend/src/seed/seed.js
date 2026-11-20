const User = require('../models/User');
const PG = require('../models/PG');
const Booking = require('../models/Booking');
const Activity = require('../models/Activity');
const Contact = require('../models/Contact');
const { DISTRICTS } = require('../config/constants');
const { IMAGES, PLACES, NAMES, FAC_SETS } = require('./data');

const round100 = (n) => Math.round(n / 100) * 100;

async function seedDatabase() {
  await Promise.all([User.deleteMany(), PG.deleteMany(), Booking.deleteMany(), Activity.deleteMany(), Contact.deleteMany()]);

  const admin = await User.create({ name: 'Admin HimachalStay', email: 'admin@himachalstay.com', password: 'Admin@123', role: 'admin', phone: '9805000001', district: 'Shimla' });
  const owners = await User.create([
    { name: 'Vikram Thakur', email: 'owner1@himachalstay.com', password: 'Owner@123', role: 'owner', phone: '9816012345', district: 'Kangra', organization: 'Thakur Properties' },
    { name: 'Sunita Sharma', email: 'owner2@himachalstay.com', password: 'Owner@123', role: 'owner', phone: '9418067890', district: 'Shimla', organization: 'Ridge Stays' },
    { name: 'Rajesh Verma', email: 'owner3@himachalstay.com', password: 'Owner@123', role: 'owner', phone: '9805511223', district: 'Mandi', organization: 'Verma Residency' },
  ]);
  const students = await User.create([
    { name: 'Aarav Sharma', email: 'student1@himachalstay.com', password: 'Student@123', role: 'student', phone: '9876543210', district: 'Hamirpur', organization: 'NIT Hamirpur' },
    { name: 'Priya Negi', email: 'student2@himachalstay.com', password: 'Student@123', role: 'student', phone: '9876501234', district: 'Kinnaur', organization: 'HP University' },
    { name: 'Rohit Chauhan', email: 'student3@himachalstay.com', password: 'Student@123', role: 'student', phone: '9876598765', district: 'Sirmaur', organization: 'Shoolini University' },
  ]);

  const list = [];
  DISTRICTS.forEach((district, di) => {
    const p = PLACES[district];
    [0, 1, 2].forEach((j) => {
      const idx = di * 3 + j;
      const owner = owners[idx % 3];
      const kind = j === 0 ? 'Boys PG' : j === 1 ? 'Girls PG' : 'Rooms';
      const isPG = j < 2;
      const base = round100(3800 + ((di * 397 + j * 211) % 2200));
      const total = [4, 3, 5][j];
      const av = (k) => Math.min(total, (di + j + k) % 4);
      const rooms = isPG
        ? [
            { type: 'Single', rent: round100(base * 1.35), capacity: 1, totalUnits: total, available: av(0) },
            { type: 'Double', rent: base, capacity: 2, totalUnits: total, available: av(1) },
            { type: 'Triple', rent: round100(base * 0.8), capacity: 3, totalUnits: total, available: av(2) },
          ]
        : [
            { type: 'Single', rent: round100(base * 1.5), capacity: 1, totalUnits: total, available: av(0) },
            { type: 'Double', rent: round100(base * 1.1), capacity: 2, totalUnits: total, available: av(1) },
          ];
      const gender = j === 0 ? 'Boys' : j === 1 ? 'Girls' : 'Unisex';
      list.push({
        owner: owner._id,
        name: `${NAMES[idx]} ${kind}`,
        district,
        location: p.towns[j],
        address: `Near ${p.marks[j]}, ${p.towns[j]}, ${district}, Himachal Pradesh`,
        description: `${isPG ? `A safe and comfortable ${gender.toLowerCase()} PG` : 'Independent, fully furnished rooms'} in ${p.towns[j]}, ${district}. Close to ${p.marks[j]}, with clean rooms, reliable water supply, friendly owners and a peaceful Himalayan environment ideal for students and working professionals.`,
        propertyType: isPG ? 'PG' : 'Room',
        gender,
        images: [0, 1, 2].map((k) => IMAGES[(idx * 3 + k) % IMAGES.length]),
        facilities: FAC_SETS[idx % FAC_SETS.length],
        rules: isPG ? ['Gate closes at 10 PM', 'No smoking or alcohol on premises', 'Visitors allowed until 7 PM'] : ['One month security deposit', 'No loud music after 10 PM'],
        nearby: `${1 + ((idx * 3) % 5)}.${(idx * 7) % 10} km from ${p.marks[j]}`,
        contactPhone: owner.phone,
        rooms,
        status: 'approved',
        featured: j === 0 && di % 2 === 0,
        rating: Math.round((3.9 + ((idx * 7) % 11) / 10) * 10) / 10,
        reviewsCount: 5 + ((idx * 5) % 30),
      });
    });
  });
  // one pending listing so the admin approval flow has data
  list.push({
    owner: owners[0]._id, name: 'Deodar Heights Boys PG', district: 'Kangra', location: 'Palampur',
    address: 'Near CSKHPKV University, Palampur, Kangra, Himachal Pradesh',
    description: 'New boys PG near the agriculture university with mess, Wi-Fi and a quiet study environment. Awaiting admin approval.',
    propertyType: 'PG', gender: 'Boys', images: [IMAGES[3]], facilities: ['Wi-Fi', 'Food Included', 'Hot Water'],
    rules: ['Gate closes at 10 PM'], nearby: '0.8 km from CSKHPKV', contactPhone: owners[0].phone,
    rooms: [{ type: 'Double', rent: 5200, capacity: 2, totalUnits: 4, available: 4 }], status: 'pending',
  });
  const pgs = await PG.create(list);

  students[0].favorites = [pgs[0]._id, pgs[7]._id, pgs[9]._id];
  students[1].favorites = [pgs[1]._id, pgs[22]._id];
  await Promise.all([students[0].save(), students[1].save()]);

  // [studentIdx, pgIdx, roomIdx, status, monthsAgo]
  const plan = [[0, 9, 1, 'Approved', 2], [0, 7, 0, 'Pending', 0], [0, 3, 1, 'Rejected', 1], [1, 1, 1, 'Pending', 0],
    [1, 22, 0, 'Approved', 3], [1, 14, 1, 'Cancelled', 1], [2, 30, 1, 'Pending', 0], [2, 4, 2, 'Approved', 1], [2, 25, 0, 'Pending', 0]];
  for (const [si, pi, ri, status, ago] of plan) {
    const pg = pgs[pi];
    const room = pg.rooms[ri] || pg.rooms[0];
    const created = new Date(); created.setMonth(created.getMonth() - ago); created.setDate(8);
    const move = new Date(); move.setDate(move.getDate() + 20);
    if (status === 'Approved' && room.available > 0) { room.available -= 1; await pg.save(); }
    await Booking.create({
      tenant: students[si]._id, owner: pg.owner, pg: pg._id, room: room._id, roomType: room.type, rent: room.rent,
      moveInDate: move, durationMonths: 6, message: 'Looking for a quiet place near my college.',
      status, ownerNote: status === 'Rejected' ? 'Room reserved for a returning tenant.' : undefined, createdAt: created, updatedAt: created,
    });
  }

  await Activity.create([
    { user: admin._id, userName: admin.name, role: 'admin', action: 'Database seeded with demo data for 12 districts', type: 'general' },
    { user: owners[0]._id, userName: owners[0].name, role: 'owner', action: 'Vikram Thakur added listing "Deodar Heights Boys PG" (Kangra)', type: 'listing' },
    { user: students[0]._id, userName: students[0].name, role: 'student', action: 'Aarav Sharma requested a Double room at "Deodar Boys PG"', type: 'booking' },
    { user: students[1]._id, userName: students[1].name, role: 'student', action: 'Priya Negi registered as student', type: 'user' },
  ]);
  await Contact.create([
    { name: 'Neha Kapoor', email: 'neha@example.com', subject: 'Listing question', message: 'How can I list my 10-room property in Manali on this platform?' },
    { name: 'Ankit Rana', email: 'ankit@example.com', subject: 'Feedback', message: 'Great website, please add more PGs in Lahaul & Spiti.' },
  ]);
  console.log(`Seeded: ${await User.countDocuments()} users, ${await PG.countDocuments()} listings, ${await Booking.countDocuments()} bookings`);
}

module.exports = { seedDatabase };
