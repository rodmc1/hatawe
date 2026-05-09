'use client';

import { useId, useState } from 'react';
import { Plus, Shuffle, Trash2, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';

type Level = 'advanced' | 'intermediate';

interface MiniPlayer {
  id: string;
  name: string;
  level: Level;
}

interface Pair {
  advanced: MiniPlayer;
  intermediate: MiniPlayer;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MiniTournamentPage() {
  const [tournamentName, setTournamentName] = useState('');
  const [players, setPlayers] = useState<MiniPlayer[]>([]);
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState<Level>('advanced');
  const [nameError, setNameError] = useState('');
  const [pairs, setPairs] = useState<Pair[] | null>(null);
  const [randomizeError, setRandomizeError] = useState('');
  const nameInputId = useId();

  const advanced = players.filter(p => p.level === 'advanced');
  const intermediate = players.filter(p => p.level === 'intermediate');

  function addPlayer() {
    const trimmed = newName.trim();
    if (!trimmed) {
      setNameError('Player name is required');
      return;
    }
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }
    setNameError('');
    setPlayers(prev => [...prev, { id: crypto.randomUUID(), name: trimmed, level: newLevel }]);
    setNewName('');
    setPairs(null);
  }

  function removePlayer(id: string) {
    setPlayers(prev => prev.filter(p => p.id !== id));
    setPairs(null);
  }

  function randomize() {
    setRandomizeError('');
    if (players.length < 2) {
      setRandomizeError('Add at least 2 players (1 Advanced + 1 Intermediate).');
      return;
    }
    if (players.length % 2 !== 0) {
      setRandomizeError('Total number of players must be even.');
      return;
    }
    if (advanced.length !== intermediate.length) {
      setRandomizeError(
        `Advanced and Intermediate players must be equal. You have ${advanced.length} Advanced and ${intermediate.length} Intermediate.`
      );
      return;
    }
    const shuffledAdv = shuffle(advanced);
    const shuffledInt = shuffle(intermediate);
    setPairs(shuffledAdv.map((a, i) => ({ advanced: a, intermediate: shuffledInt[i] })));
  }

  return (
    <div className="flex flex-col gap-6 p-4 pt-0 max-w-2xl">
      <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Trophy className="size-5" />
        Mini Tournament
      </h1>

      {/* Tournament details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tournament Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="mini-tournament-name">Tournament Name</FieldLabel>
              <Input
                id="mini-tournament-name"
                value={tournamentName}
                onChange={e => setTournamentName(e.target.value)}
                placeholder="e.g. Friday Night Doubles"
                autoComplete="off"
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Players */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4" />
              Players
              {players.length > 0 && <Badge variant="secondary">{players.length}</Badge>}
            </CardTitle>
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-700">{advanced.length} Adv</span>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-orange-700">{intermediate.length} Int</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Add player form */}
          <div className="flex items-end gap-2">
            <Field className="flex-1">
              <FieldLabel htmlFor={nameInputId}>Player Name</FieldLabel>
              <Input
                id={nameInputId}
                value={newName}
                onChange={e => {
                  setNewName(e.target.value);
                  setNameError('');
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPlayer();
                  }
                }}
                placeholder="Full name"
                aria-invalid={!!nameError}
                autoComplete="off"
              />
              {nameError && <FieldError errors={[{ message: nameError }]} />}
            </Field>
            <Field>
              <FieldLabel>Level</FieldLabel>
              <Select value={newLevel} onValueChange={v => setNewLevel(v as Level)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Button type="button" onClick={addPlayer} className="shrink-0 self-end">
              <Plus />
              Add
            </Button>
          </div>

          {/* Player list */}
          {players.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-1.5">
                {players.map((player, i) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 shrink-0 text-right text-xs text-muted-foreground">{i + 1}.</span>
                      <span className="text-sm font-medium text-foreground">{player.name}</span>
                      {player.level === 'advanced' ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                          Advanced
                        </span>
                      ) : (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                          Intermediate
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePlayer(player.id)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${player.name}`}>
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Randomize */}
      <div className="flex flex-col gap-2">
        {randomizeError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{randomizeError}</p>
        )}
        <Button onClick={randomize} disabled={players.length === 0} className="w-full sm:w-auto">
          <Shuffle />
          Randomize Partners
        </Button>
      </div>

      {/* Pairs result */}
      {pairs && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paired Teams ({pairs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {pairs.map((pair, i) => (
                <div
                  key={pair.advanced.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
                  <span className="w-6 shrink-0 text-center text-xs font-bold text-muted-foreground">#{i + 1}</span>
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{pair.advanced.name}</span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700">
                      Adv
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">&amp;</span>
                    <span className="text-sm font-semibold">{pair.intermediate.name}</span>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-700">
                      Int
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
