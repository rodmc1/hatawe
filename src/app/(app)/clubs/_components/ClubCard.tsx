import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { type Club } from '@/lib/api/clubs';

const ROLE_VARIANT = {
  admin: 'default',
  member: 'outline'
} as const;

function getInitials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ClubCard({ club }: { club: Club }) {
  return (
    <Link
      href={`/clubs/${club.id}`}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/20 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <Avatar size="lg">
          {club.logo ? <AvatarImage src={club.logo} alt={club.name} /> : null}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(club.name)}</AvatarFallback>
        </Avatar>
        <Badge variant={ROLE_VARIANT[club.role]} className="capitalize">
          {club.role}
        </Badge>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {club.name}
        </h3>
        <p className="text-xs text-muted-foreground">{club.memberCount} members</p>
      </div>
      <div className="flex items-center justify-between">
        <AvatarGroup>
          {club.members.slice(0, 3).map(member => (
            <Avatar key={member.id} size="sm">
              {member.avatar ? <AvatarImage src={member.avatar} alt={member.name} /> : null}
              <AvatarFallback className="text-[10px]">{getInitials(member.name)}</AvatarFallback>
            </Avatar>
          ))}
          {club.memberCount > 3 && <AvatarGroupCount className="text-[10px]">+{club.memberCount - 3}</AvatarGroupCount>}
        </AvatarGroup>
      </div>
    </Link>
  );
}
