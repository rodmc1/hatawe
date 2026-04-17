interface AvatarCardProps {
  firstname: string;
  lastname: string;
  subtitle?: string;
  subtitleClassName?: string;
  compact?: boolean;
}

function getInitials(firstname: string, lastname: string) {
  return `${firstname[0] ?? ''}${lastname[0] ?? ''}`.toUpperCase();
}

export default function AvatarCard({ firstname, lastname, subtitle, subtitleClassName, compact }: AvatarCardProps) {
  const initials = getInitials(firstname, lastname);

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-7 h-7 rounded-full bg-white border-2 border-indigo-400 text-indigo-700 flex items-center justify-center text-[10px] font-bold shadow shrink-0">
          {initials}
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
        {subtitle && (
          <span
            className={`text-xs font-medium truncate block ${subtitleClassName ? `px-2 py-0.5 rounded-full ${subtitleClassName}` : 'text-gray-500'}`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
