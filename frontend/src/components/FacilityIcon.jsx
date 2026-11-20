import { Wifi, Utensils, Shirt, Video, Car, Bath, BookOpen, Droplets, Zap, Snowflake, Tv, ShieldCheck } from 'lucide-react';

const MAP = {
  'Wi-Fi': Wifi, 'Food Included': Utensils, Laundry: Shirt, CCTV: Video, Parking: Car, 'Attached Bath': Bath,
  'Study Table': BookOpen, 'Hot Water': Droplets, 'Power Backup': Zap, AC: Snowflake, TV: Tv, Security: ShieldCheck,
};
export default function FacilityIcon({ name, size = 15 }) {
  const Icon = MAP[name] || ShieldCheck;
  return <Icon size={size} />;
}
