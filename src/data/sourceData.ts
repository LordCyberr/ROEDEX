import { getItemInfo } from './rarity';

export interface SourceInfo {
  hp: number | string;
  respawn: string;
}

export const getSourceInfo = (source: string): SourceInfo => {
  const info = getItemInfo(source);
  if (info) {
    return {
      hp: info.hp,
      respawn: `${Math.round(info.cooldown / 60)}m`
    };
  }
  return { hp: 100, respawn: '30m' };
};
