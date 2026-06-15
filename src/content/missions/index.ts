import type { Mission } from './types';
import { ecommerceRevenue } from './ecommerceRevenue';

export const missions: Mission[] = [ecommerceRevenue];

export function getMission(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}

export type { Mission, MissionStep } from './types';
