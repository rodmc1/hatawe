export type PlayerLevel = 'unrated' | 'beginner' | 'intermediate low' | 'intermediate high' | 'advanced';

export const levelColors: Record<PlayerLevel, string> = {
  unrated: 'bg-gray-100 text-gray-600',
  beginner: 'bg-green-100 text-green-700',
  'intermediate low': 'bg-yellow-100 text-yellow-700',
  'intermediate high': 'bg-orange-100 text-orange-700',
  advanced: 'bg-red-100 text-red-700'
};
