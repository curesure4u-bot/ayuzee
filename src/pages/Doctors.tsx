import { SiteNav } from '@/components/site/SiteNav';
import { Footer } from '@/components/site/Footer';
import { usePageSEO } from '@/hooks/usePageSEO';
import { DoctorDirectory } from '@/features/professionals/DoctorDirectory';
import { doctorDirectory } from '@/features/professionals/directoryService';

export default function Doctors() {
  usePageSEO({
    title: 'Find an AYUSH doctor | Ayuzee',
    description: 'Explore public AYUSH professional profiles by name, city, type of care and consultation fee.',
    canonicalPath: '/doctors',
  });
  return <><SiteNav /><DoctorDirectory source={doctorDirectory} /><Footer appLevel /></>;
}
