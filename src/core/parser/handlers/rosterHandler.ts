/**
 * rosterHandler.ts — handles town roster, online players, quests
 * Extracted from playerHandler.ts (v0.0.5 refactor)
 */
import { useTrackerStore } from '../../../store/trackerStore';
import { AICompanion } from '../../companion/AICompanion';
import { useAnalyticsStore } from '../../../store/analyticsStore';

export function handleUserOnline(payload: any, parserState: any) {
  if (!payload?.username) return;
  const state = useTrackerStore.getState();

  if (!state.sessionPlayerName) {
    if (!parserState.pendingUsername) {
      parserState.pendingUsername = payload.username;
    }
  }

  if (payload.userId) {
    state.setOnlinePlayer(payload.userId, {
      username: payload.username,
      lastSeen: Date.now()
    });
  }
}

export function handleUserOffline(payload: any) {
  if (payload?.userId) {
    useTrackerStore.getState().removeOnlinePlayer(payload.userId);
  }
}

export function handleTownRoster(payload: any) {
  if (!payload?.players || !Array.isArray(payload.players)) return;
  const state = useTrackerStore.getState();
  payload.players.forEach((p: any) => {
    if (p.userId) {
      state.setOnlinePlayer(p.userId, {
        username: p.username || 'Unknown',
        position: p.position || p.pos,
        lastSeen: Date.now()
      });
    }
  });
}

export function handleTownJoined(payload: any) {
  if (!payload?.userId) return;
  useTrackerStore.getState().setOnlinePlayer(payload.userId, {
    username: payload.username || payload.displayName || 'Unknown',
    position: payload.position || payload.pos,
    lastSeen: Date.now()
  });
}

export function handleTownLeft(payload: any) {
  const id = payload?.userId || payload?.id;
  if (id) {
    useTrackerStore.getState().removeOnlinePlayer(id);
  }
}

export function handleQuestAll(payload: any) {
  try {
    const npcs = payload?.npcs || [];
    const activeQuests: any[] = [];

    for (const npc of npcs) {
      if (npc.quests && Array.isArray(npc.quests)) {
        for (const q of npc.quests) {
          if (q.status === 'accepted') {
            q.currentAmount = q.result?.currentAmount || 0;
            activeQuests.push(q);
          }
        }
      }
    }

    useTrackerStore.getState().setQuests(activeQuests);
  } catch (err) {
    console.error('Error parsing quests:', err);
  }
}

export function handleTutorialQuests(payload: any) {
  try {
    if (payload?.activeQuests && Array.isArray(payload.activeQuests)) {
      const formattedQuests = payload.activeQuests.map((q: any) => ({
        ...q,
        status: 'accepted'
      }));
      useTrackerStore.getState().setQuests(formattedQuests);
    }
  } catch (err) {
    console.error('Error parsing tutorial quests:', err);
  }
}

export function handleLevelUpOrAchievement() {
  AICompanion.onLevelUp();
  useAnalyticsStore.getState().recordLevelUp();
}
