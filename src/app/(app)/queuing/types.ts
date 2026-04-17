import { type PlayerLevel } from '@/lib/types/player';

export { type PlayerLevel, levelColors } from '@/lib/types/player';

export interface QueuePlayer {
  id: number;
  firstname: string;
  lastname: string;
  level: PlayerLevel;
}
