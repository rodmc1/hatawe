'use client';

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { type QueuePlayer } from '../types';

export interface QueueSlot {
  id: string;
  players: (QueuePlayer | null)[];
}

export interface PhysicalCourt {
  id: string;
  name: string;
  status: 'idle' | 'playing';
  players: (QueuePlayer | null)[];
  startedAt: number | null;
}

interface QueuingState {
  queueSlots: QueueSlot[];
  physicalCourts: PhysicalCourt[];
  queueCounter: number;
  courtCounter: number;
  gamesPlayed: Record<number, number>;
  wins: Record<number, number>;
  losses: Record<number, number>;
}

interface QueuingContextValue {
  queueSlots: QueueSlot[];
  physicalCourts: PhysicalCourt[];
  availablePlayers: QueuePlayer[];
  queuedPlayers: QueuePlayer[];
  playingPlayers: QueuePlayer[];
  playingCourts: PhysicalCourt[];
  gamesPlayed: Record<number, number>;
  wins: Record<number, number>;
  losses: Record<number, number>;

  // Queue actions
  addToQueue: (player: QueuePlayer) => void;
  removeFromQueue: (slotId: string, slotIndex: number) => void;
  swapInQueue: (slotId: string, slotIndex: number, newPlayer: QueuePlayer) => void;
  addToQueueSlot: (slotId: string, slotIndex: number, player: QueuePlayer) => void;
  playQueue: (slotId: string) => void;

  // Court config
  setCourtCount: (n: number) => void;
  renamePhysicalCourt: (courtId: string, name: string) => void;

  // Playing court actions
  removeFromCourt: (courtId: string, slotIndex: number) => void;
  swapInCourt: (courtId: string, slotIndex: number, newPlayer: QueuePlayer) => void;
  addToCourtSlot: (courtId: string, slotIndex: number, player: QueuePlayer) => void;
  startCourt: (courtId: string) => void;
  finishCourt: (courtId: string, winnerTeam: 1 | 2) => void;
}

const QueuingContext = createContext<QueuingContextValue | null>(null);

export function useQueuing(): QueuingContextValue {
  const ctx = useContext(QueuingContext);
  if (!ctx) throw new Error('useQueuing must be used inside QueuingProvider');
  return ctx;
}

type PlayerLocation =
  | { type: 'queue'; slotId: string; slotIndex: number }
  | { type: 'court'; courtId: string; slotIndex: number };

function findPlayerAnywhere(state: QueuingState, playerId: number): PlayerLocation | null {
  for (const slot of state.queueSlots) {
    const idx = slot.players.findIndex(p => p?.id === playerId);
    if (idx !== -1) return { type: 'queue', slotId: slot.id, slotIndex: idx };
  }
  for (const court of state.physicalCourts) {
    const idx = court.players.findIndex(p => p?.id === playerId);
    if (idx !== -1) return { type: 'court', courtId: court.id, slotIndex: idx };
  }
  return null;
}

function removePlacedPlayer(
  newSlots: QueueSlot[],
  newCourts: PhysicalCourt[],
  loc: PlayerLocation,
  displaced: QueuePlayer | null
) {
  if (loc.type === 'queue') {
    const src = newSlots.find(s => s.id === loc.slotId)!;
    src.players[loc.slotIndex] = displaced;
  } else {
    const src = newCourts.find(c => c.id === loc.courtId)!;
    src.players[loc.slotIndex] = displaced;
  }
}

interface QueuingProviderProps {
  allPlayers: QueuePlayer[];
  initialCourtCount?: number;
  children: ReactNode;
}

export function QueuingProvider({ allPlayers, initialCourtCount = 2, children }: QueuingProviderProps) {
  const [state, setState] = useState<QueuingState>(() => ({
    queueSlots: [],
    gamesPlayed: {},
    wins: {},
    losses: {},
    physicalCourts: Array.from({ length: initialCourtCount }, (_, i) => ({
      id: `phys-court-${i + 1}`,
      name: `Court ${i + 1}`,
      status: 'idle' as const,
      players: [null, null, null, null],
      startedAt: null
    })),
    queueCounter: 0,
    courtCounter: initialCourtCount
  }));

  const { gamesPlayed, wins, losses } = state;

  const queuedPlayers = useMemo(
    () => state.queueSlots.flatMap(s => s.players).filter((p): p is QueuePlayer => p !== null),
    [state.queueSlots]
  );

  const playingPlayers = useMemo(
    () => state.physicalCourts.flatMap(c => c.players).filter((p): p is QueuePlayer => p !== null),
    [state.physicalCourts]
  );

  const allUsedIds = useMemo(
    () => new Set([...queuedPlayers.map(p => p.id), ...playingPlayers.map(p => p.id)]),
    [queuedPlayers, playingPlayers]
  );

  const availablePlayers = useMemo(() => allPlayers.filter(p => !allUsedIds.has(p.id)), [allPlayers, allUsedIds]);

  const playingCourts = useMemo(() => state.physicalCourts.filter(c => c.status === 'playing'), [state.physicalCourts]);

  // ── Queue actions ──────────────────────────────────────────────────

  function addToQueue(player: QueuePlayer) {
    setState(prev => {
      const targetIdx = prev.queueSlots.findIndex(s => s.players.some(p => p === null));
      if (targetIdx !== -1) {
        const newSlots = prev.queueSlots.map((s, i) => {
          if (i !== targetIdx) return s;
          const players = [...s.players];
          players[players.findIndex(p => p === null)] = player;
          return { ...s, players };
        });
        return { ...prev, queueSlots: newSlots };
      }
      const newCounter = prev.queueCounter + 1;
      return {
        ...prev,
        queueSlots: [...prev.queueSlots, { id: `queue-${newCounter}`, players: [player, null, null, null] }],
        queueCounter: newCounter
      };
    });
  }

  function removeFromQueue(slotId: string, slotIndex: number) {
    setState(prev => ({
      ...prev,
      queueSlots: prev.queueSlots
        .map(s => {
          if (s.id !== slotId) return s;
          const players = [...s.players];
          players[slotIndex] = null;
          return { ...s, players };
        })
        .filter(s => s.players.some(Boolean))
    }));
  }

  function swapInQueue(slotId: string, slotIndex: number, newPlayer: QueuePlayer) {
    setState(prev => {
      const newSlots = prev.queueSlots.map(s => ({ ...s, players: [...s.players] }));
      const newCourts = prev.physicalCourts.map(c => ({ ...c, players: [...c.players] }));
      const targetSlot = newSlots.find(s => s.id === slotId)!;
      const displaced = targetSlot.players[slotIndex];
      const loc = findPlayerAnywhere({ ...prev, queueSlots: newSlots, physicalCourts: newCourts }, newPlayer.id);
      if (loc) removePlacedPlayer(newSlots, newCourts, loc, displaced);
      targetSlot.players[slotIndex] = newPlayer;
      return {
        ...prev,
        queueSlots: newSlots.filter(s => s.players.some(Boolean)),
        physicalCourts: newCourts
      };
    });
  }

  function addToQueueSlot(slotId: string, slotIndex: number, player: QueuePlayer) {
    setState(prev => {
      const newSlots = prev.queueSlots.map(s => ({ ...s, players: [...s.players] }));
      const newCourts = prev.physicalCourts.map(c => ({ ...c, players: [...c.players] }));
      const loc = findPlayerAnywhere({ ...prev, queueSlots: newSlots, physicalCourts: newCourts }, player.id);
      if (loc) removePlacedPlayer(newSlots, newCourts, loc, null);
      newSlots.find(s => s.id === slotId)!.players[slotIndex] = player;
      return {
        ...prev,
        queueSlots: newSlots.filter(s => s.players.some(Boolean)),
        physicalCourts: newCourts
      };
    });
  }

  function playQueue(slotId: string) {
    setState(prev => {
      const slot = prev.queueSlots.find(s => s.id === slotId);
      if (!slot) return prev;
      const idleCourt = prev.physicalCourts.find(c => c.status === 'idle');
      if (!idleCourt) return prev;
      return {
        ...prev,
        queueSlots: prev.queueSlots.filter(s => s.id !== slotId),
        physicalCourts: prev.physicalCourts.map(c =>
          c.id === idleCourt.id
            ? { ...c, status: 'playing' as const, players: [...slot.players], startedAt: Date.now() }
            : c
        )
      };
    });
  }

  // ── Court config ──────────────────────────────────────────────────

  function setCourtCount(n: number) {
    if (n < 1) return;
    setState(prev => {
      const current = prev.physicalCourts;
      if (n === current.length) return prev;
      if (n > current.length) {
        let counter = prev.courtCounter;
        const added = Array.from({ length: n - current.length }, () => {
          counter++;
          return {
            id: `phys-court-${counter}`,
            name: `Court ${counter}`,
            status: 'idle' as const,
            players: [null, null, null, null] as (QueuePlayer | null)[],
            startedAt: null
          };
        });
        return { ...prev, physicalCourts: [...current, ...added], courtCounter: counter };
      }
      // Decreasing: only remove idle courts with no players assigned
      const isRemovable = (c: PhysicalCourt) => c.status === 'idle' && c.players.every(p => p === null);
      const removableCount = current.filter(isRemovable).length;
      const target = Math.max(n, current.length - removableCount);
      if (target === current.length) return prev;
      let toRemove = current.length - target;
      const newCourts = [...current];
      for (let i = newCourts.length - 1; i >= 0 && toRemove > 0; i--) {
        if (isRemovable(newCourts[i])) {
          newCourts.splice(i, 1);
          toRemove--;
        }
      }
      return { ...prev, physicalCourts: newCourts };
    });
  }

  function renamePhysicalCourt(courtId: string, name: string) {
    setState(prev => ({
      ...prev,
      physicalCourts: prev.physicalCourts.map(c => (c.id === courtId ? { ...c, name } : c))
    }));
  }

  // ── Playing court actions ──────────────────────────────────────────

  function removeFromCourt(courtId: string, slotIndex: number) {
    setState(prev => ({
      ...prev,
      physicalCourts: prev.physicalCourts.map(c => {
        if (c.id !== courtId) return c;
        const players = [...c.players];
        players[slotIndex] = null;
        return { ...c, players };
      })
    }));
  }

  function swapInCourt(courtId: string, slotIndex: number, newPlayer: QueuePlayer) {
    setState(prev => {
      const newSlots = prev.queueSlots.map(s => ({ ...s, players: [...s.players] }));
      const newCourts = prev.physicalCourts.map(c => ({ ...c, players: [...c.players] }));
      const targetCourt = newCourts.find(c => c.id === courtId)!;
      const displaced = targetCourt.players[slotIndex];
      const loc = findPlayerAnywhere({ ...prev, queueSlots: newSlots, physicalCourts: newCourts }, newPlayer.id);
      if (loc) removePlacedPlayer(newSlots, newCourts, loc, displaced);
      targetCourt.players[slotIndex] = newPlayer;
      return {
        ...prev,
        queueSlots: newSlots.filter(s => s.players.some(Boolean)),
        physicalCourts: newCourts
      };
    });
  }

  function addToCourtSlot(courtId: string, slotIndex: number, player: QueuePlayer) {
    setState(prev => {
      const newSlots = prev.queueSlots.map(s => ({ ...s, players: [...s.players] }));
      const newCourts = prev.physicalCourts.map(c => ({ ...c, players: [...c.players] }));
      const loc = findPlayerAnywhere({ ...prev, queueSlots: newSlots, physicalCourts: newCourts }, player.id);
      if (loc) removePlacedPlayer(newSlots, newCourts, loc, null);
      newCourts.find(c => c.id === courtId)!.players[slotIndex] = player;
      return {
        ...prev,
        queueSlots: newSlots.filter(s => s.players.some(Boolean)),
        physicalCourts: newCourts
      };
    });
  }

  function finishCourt(courtId: string, winnerTeam: 1 | 2) {
    setState(prev => {
      const court = prev.physicalCourts.find(c => c.id === courtId);
      const updatedGames = { ...prev.gamesPlayed };
      const updatedWins = { ...prev.wins };
      const updatedLosses = { ...prev.losses };
      if (court) {
        const winners = [court.players[0], court.players[1]].filter(Boolean);
        const losers = [court.players[2], court.players[3]].filter(Boolean);
        const [teamWin, teamLose] = winnerTeam === 1 ? [winners, losers] : [losers, winners];
        for (const p of court.players) {
          if (p) updatedGames[p.id] = (updatedGames[p.id] ?? 0) + 1;
        }
        for (const p of teamWin) {
          if (p) updatedWins[p.id] = (updatedWins[p.id] ?? 0) + 1;
        }
        for (const p of teamLose) {
          if (p) updatedLosses[p.id] = (updatedLosses[p.id] ?? 0) + 1;
        }
      }
      return {
        ...prev,
        gamesPlayed: updatedGames,
        wins: updatedWins,
        losses: updatedLosses,
        physicalCourts: prev.physicalCourts.map(c =>
          c.id === courtId ? { ...c, status: 'idle' as const, players: [null, null, null, null], startedAt: null } : c
        )
      };
    });
  }

  function startCourt(courtId: string) {
    setState(prev => ({
      ...prev,
      physicalCourts: prev.physicalCourts.map(c =>
        c.id === courtId ? { ...c, status: 'playing' as const, startedAt: Date.now() } : c
      )
    }));
  }

  return (
    <QueuingContext.Provider
      value={{
        queueSlots: state.queueSlots,
        physicalCourts: state.physicalCourts,
        availablePlayers,
        queuedPlayers,
        playingPlayers,
        playingCourts,
        gamesPlayed,
        wins,
        losses,
        addToQueue,
        removeFromQueue,
        swapInQueue,
        addToQueueSlot,
        playQueue,
        setCourtCount,
        renamePhysicalCourt,
        removeFromCourt,
        swapInCourt,
        addToCourtSlot,
        startCourt,
        finishCourt
      }}>
      {children}
    </QueuingContext.Provider>
  );
}
