import { useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { Alert } from 'react-native';
import { api } from '../convex/_generated/api';
import { useDemo } from './DemoContext';
import {
  MOCK_TALENT, MOCK_GIGS, MOCK_BOOKINGS, MOCK_MY_BOOKINGS,
  MOCK_BOOKING_TALENT, MOCK_GIG_INTERESTS, MOCK_MY_INTERESTS,
  MOCK_CLIENT_PROFILE, getDemoUser,
} from './mockData';

function getDemoData(ref: any, role: string, args?: any): any {
  // Users
  if (ref === api.users.getCurrentUser) return getDemoUser(role);

  // Talent
  if (ref === api.talent.listPendingProfiles) {
    return MOCK_TALENT.filter(t => t.status === 'pending');
  }
  if (ref === api.talent.listAllProfiles) {
    if (args?.status) return MOCK_TALENT.filter(t => t.status === args.status);
    return MOCK_TALENT;
  }
  if (ref === api.talent.listApprovedProfiles) {
    const approved = MOCK_TALENT.filter(t => t.status === 'approved');
    if (args?.city) return approved.filter(t => t.city === args.city);
    return approved;
  }
  if (ref === api.talent.getMyProfile) {
    return role === 'talent' ? MOCK_TALENT[0] : null;
  }

  // Gigs
  if (ref === api.gigs.listGigs) {
    if (args?.status) return MOCK_GIGS.filter(g => g.status === args.status);
    return MOCK_GIGS;
  }
  if (ref === api.gigs.getGigInterests) return MOCK_GIG_INTERESTS;
  if (ref === api.gigs.getMyInterests) return MOCK_MY_INTERESTS;

  // Bookings
  if (ref === api.bookings.listBookingRequests) {
    if (args?.status) return MOCK_BOOKINGS.filter(b => b.status === args.status);
    return MOCK_BOOKINGS;
  }
  if (ref === api.bookings.getMyBookingRequests) return MOCK_MY_BOOKINGS;
  if (ref === api.bookings.getBookingTalent) return MOCK_BOOKING_TALENT;

  // Clients
  if (ref === api.clients.getMyClientProfile) {
    return role === 'client' ? MOCK_CLIENT_PROFILE : null;
  }

  return null;
}

export function useAppQuery(ref: any, args?: any) {
  const { isDemo, demoRole } = useDemo();
  const realResult = useQuery(ref, isDemo ? 'skip' : args);
  if (isDemo) return getDemoData(ref, demoRole, args);
  return realResult;
}

export function useAppMutation(ref: any) {
  const { isDemo } = useDemo();
  const realMutation = useMutation(ref);
  if (isDemo) {
    return async (..._args: any[]) => {
      Alert.alert(
        'Demo Mode',
        'Sign up to access this feature! Exit the demo and create your account.',
      );
      return null as any;
    };
  }
  return realMutation;
}

export function useAppAuthActions() {
  const { isDemo, exitDemo } = useDemo();
  const realActions = useAuthActions();
  if (isDemo) {
    return { signOut: async () => exitDemo() };
  }
  return realActions;
}
