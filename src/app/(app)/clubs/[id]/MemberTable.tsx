'use client';

import { useParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePlayers } from '@/hooks/usePlayers';
import { type Player } from '@/lib/api/players';
import AvatarCard from '@/components/common/AvatarCard';
import { type PlayerLevel, levelColors } from '@/lib/types/player';
import { Pencil, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

function membershipBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'suspended':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function MemberTable() {
  const params = useParams();
  const clubId = params.id as string;
  const { data: players, isLoading } = usePlayers(clubId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-4">Loading members...</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Player Level</TableHead>
          <TableHead>Membership Status</TableHead>
          <TableHead>Total Games</TableHead>
          <TableHead>Win Rate</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players?.length ? (
          players.map(player => {
            const [firstname = '', ...rest] = player.name.split(' ');
            const lastname = rest.join(' ');
            const level = (player as Player & { playerLevel?: PlayerLevel }).playerLevel;
            const totalGames = (player as Player & { totalGames?: number }).totalGames;
            const wins = (player as Player & { wins?: number }).wins;
            const winRate = totalGames && wins != null ? Math.round((wins / totalGames) * 100) : null;

            return (
              <TableRow key={player.id}>
                <TableCell>
                  <AvatarCard firstname={firstname} lastname={lastname} subtitle={player.role} />
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      levelColors[level ?? 'unrated']
                    )}>
                    {level ?? 'Unrated'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={membershipBadgeVariant(player.membershipStatus)} className="capitalize">
                    {player.membershipStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{totalGames ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{winRate != null ? `${winRate}%` : '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-xs" aria-label="Edit member">
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Remove from club"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <UserMinus />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
              No members found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
