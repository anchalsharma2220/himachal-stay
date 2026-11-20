const PHOTO = [
  'photo-1555854877-bab0e564b8d5', 'photo-1595526114035-0d45ed16cfbf', 'photo-1584622650111-993a426fbf0a',
  'photo-1522771739844-6a9f6d5f14af', 'photo-1507089947368-19c1da9775ae', 'photo-1560448204-e02f11c3d0e2',
  'photo-1513694203232-719a280e022f', 'photo-1484154218962-a197022b5858', 'photo-1502672260266-1c1ef2d93688',
  'photo-1566665797739-1674de7a421a', 'photo-1590490360182-c33d57733427', 'photo-1616486338812-3dadae4b4ace',
  'photo-1626621341517-bbf3d9990a23',
];
exports.IMAGES = PHOTO.map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`);

// 3 towns + 3 nearby landmarks per district
exports.PLACES = {
  Bilaspur: { towns: ['Bilaspur Town', 'Ghumarwin', 'Kandrour'], marks: ['AIIMS Bilaspur', 'Govt. College Ghumarwin', 'Gobind Sagar Lake'] },
  Chamba: { towns: ['Chamba Town', 'Dalhousie', 'Banikhet'], marks: ['Govt. Degree College Chamba', 'Dalhousie Mall Road', 'Banikhet Chowk'] },
  Hamirpur: { towns: ['Hamirpur Town', 'Nadaun', 'Sujanpur Tira'], marks: ['NIT Hamirpur', 'HPTU Campus', 'Govt. College Sujanpur'] },
  Kangra: { towns: ['Dharamshala', 'Palampur', 'Kangra Town'], marks: ['Central University of HP', 'CSKHPKV Palampur', 'Kangra Bus Stand'] },
  Kinnaur: { towns: ['Reckong Peo', 'Kalpa', 'Sangla'], marks: ['Govt. College Kinnaur', 'District Hospital Peo', 'Sangla Market'] },
  Kullu: { towns: ['Kullu Town', 'Manali', 'Bhuntar'], marks: ['Govt. College Kullu', 'Manali Mall Road', 'Bhuntar Airport'] },
  'Lahaul & Spiti': { towns: ['Keylong', 'Kaza', 'Udaipur'], marks: ['Govt. College Keylong', 'Kaza Market', 'Udaipur Bus Stand'] },
  Mandi: { towns: ['Mandi Town', 'Sundernagar', 'Jogindernagar'], marks: ['IIT Mandi (Kamand)', 'Govt. College Sundernagar', 'Jogindernagar Bus Stand'] },
  Shimla: { towns: ['Shimla', 'Sanjauli', 'Kufri'], marks: ['HP University, Summer Hill', 'IGMC Shimla', 'Sanjauli Chowk'] },
  Sirmaur: { towns: ['Nahan', 'Paonta Sahib', 'Rajgarh'], marks: ['Govt. College Nahan', 'Paonta Sahib Bus Stand', 'Rajgarh Market'] },
  Solan: { towns: ['Solan Town', 'Baddi', 'Kasauli'], marks: ['Shoolini University', 'Baddi University', 'Kasauli Road'] },
  Una: { towns: ['Una Town', 'Amb', 'Gagret'], marks: ['Govt. College Una', 'Amb Bus Stand', 'Gagret Market'] },
};

exports.NAMES = ['Green View', 'Sharma', 'Himalayan Residency', 'Sunrise', 'The Nest', 'Rajput', 'Apple Home Stays', 'Mountain View', 'Deodar',
  'Pine Haven', 'Devbhumi', 'Snow Peak', 'Kailash', 'Shivalik', 'Dhauladhar', 'Cedar Crest', 'Pahadi Nivas', 'Rhododendron', 'Beas View',
  'Sutlej', 'Chenab', 'Ravi Residency', 'Narvana', 'Hill Crest', 'Maple Leaf', 'Orchard Inn', 'Kanchan', 'Tara Devi', 'Anand', 'Lotus',
  'Himgiri', 'Rainbow', 'Blue Pine', 'Valley View', 'Evergreen', 'Heritage'];

exports.FAC_SETS = [
  ['Wi-Fi', 'Food Included', 'Laundry', 'CCTV', 'Hot Water', 'Power Backup'],
  ['Wi-Fi', 'Food Included', 'Parking', 'Security', 'Study Table', 'Hot Water'],
  ['Wi-Fi', 'Attached Bath', 'Study Table', 'TV', 'Parking', 'Power Backup'],
  ['Wi-Fi', 'Food Included', 'Laundry', 'Attached Bath', 'CCTV', 'AC'],
];
