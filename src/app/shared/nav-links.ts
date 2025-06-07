export interface NavLink {
  label: string;
  url: string;
}

export const BASE_NAV_LINKS: NavLink[] = [
  { label: 'A propos', url: '/about' },
  { label: 'Film', url: '/movies' },
  { label: 'Réservation', url: '/bookings' },
  { label: 'Contact', url: '/contact' },
];
export const USER_NAV_LINKS: NavLink[] = [
  { label: 'A propos', url: '/about' },
  { label: 'Film', url: '/movies' },
  { label: 'Réservation', url: '/bookings' },
  { label: 'Profil', url: '/user/:userId' },
  { label: 'Contact', url: '/contact' },
];
export const EMPLOYYEE_NAV_LINKS: NavLink[] = [
  { label: 'A propos', url: '/about' },
  { label: 'Film', url: '/movies' },
  { label: 'Administration', url: '/admin' },
  { label: 'Profil', url: '/employee/:employeeId' },
  { label: 'Contact', url: '/contact' },
];
export const ADMIN_NAV_LINKS: NavLink[] = [
  { label: 'A propos', url: '/about' },
  { label: 'Film', url: '/movies' },
  { label: 'Administration', url: '/admin' },
  { label: 'Profil', url: '/employee/:employeeId' },
  { label: 'Contact', url: '/contact' },
];
