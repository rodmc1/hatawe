import { type PlayerLevel, levelColors } from '@/app/(app)/queuing/types';

interface PlayerCardProps {
  firstname: string;
  lastname: string;
  level?: PlayerLevel;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  compact?: boolean;
}

function getInitials(firstname: string, lastname: string) {
  return `${firstname[0] ?? ''}${lastname[0] ?? ''}`.toUpperCase();
}

function PlayerStats({ wins, losses, gamesPlayed }: Pick<PlayerCardProps, 'wins' | 'losses' | 'gamesPlayed'>) {
  if (wins === undefined && losses === undefined && gamesPlayed === undefined) return null;
  return (
    <div className="flex items-center gap-2 mt-0.5">
      {wins !== undefined && <span className="text-[10px] font-semibold text-green-600">{wins}W</span>}
      {losses !== undefined && <span className="text-[10px] font-semibold text-red-500">{losses}L</span>}
      {gamesPlayed !== undefined && <span className="text-[10px] font-medium text-gray-400">{gamesPlayed}G</span>}
    </div>
  );
}

export default function PlayerCard({
  firstname,
  lastname,
  level,
  gamesPlayed,
  wins,
  losses,
  compact
}: PlayerCardProps) {
  const initials = getInitials(firstname, lastname);

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div className="relative w-7 h-7">
          <div className="w-7 h-7 rounded-full bg-white border-2 border-indigo-400 text-indigo-700 flex items-center justify-center text-[10px] font-bold shadow shrink-0">
            {initials}
          </div>
          {gamesPlayed !== undefined && (
            <span className="absolute -bottom-1 -right-1 bg-indigo-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 leading-none">
              {gamesPlayed}
            </span>
          )}
        </div>
        <span className="text-[9px] font-semibold text-white drop-shadow-sm leading-none whitespace-nowrap">
          {firstname}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {firstname} {lastname}
        </p>
        {level && (
          <span className={`text-xs font-medium truncate block px-2 py-0.5 rounded-full ${levelColors[level]}`}>
            {level}
          </span>
        )}
        <PlayerStats wins={wins} losses={losses} gamesPlayed={gamesPlayed} />
      </div>
    </div>
  );
}
