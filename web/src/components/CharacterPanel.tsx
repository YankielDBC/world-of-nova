import { useGame } from '../store/gameStore';
import './CharacterPanel.css';

export default function CharacterPanel() {
  const { player } = useGame();

  if (!player) return <div className="cp-empty">Cargando...</div>;

  const cs = player.combatStats || {};
  const attrs = player.attrs || {};
  const hpPct = player.maxHp > 0 ? (player.hp / player.maxHp) * 100 : 100;
  const staPct = player.maxEnergy > 0 ? (player.energy / player.maxEnergy) * 100 : 100;

  return (
    <div className="cp-root">
      {/* Identity */}
      <div className="cp-section">
        <div className="cp-identity">
          <span className="cp-name">{player.nickname}</span>
          <span className="cp-level">Lv {player.level}</span>
        </div>
        <div className="cp-race-class">
          <span>{player.raceEmoji} {player.raceName}</span>
          <span>{player.classEmoji} {player.className}</span>
        </div>
        {player.title && <div className="cp-title">📜 {player.title}</div>}
      </div>

      {/* HP & STA */}
      <div className="cp-section">
        <div className="cp-bar-row">
          <span className="cp-bar-label">HP</span>
          <div className="cp-bar-bg">
            <div className="cp-bar-fill hp" style={{ width: `${hpPct}%` }} />
          </div>
          <span className="cp-bar-val">{player.hp}/{player.maxHp}</span>
        </div>
        <div className="cp-bar-row">
          <span className="cp-bar-label">STA</span>
          <div className="cp-bar-bg">
            <div className="cp-bar-fill sta" style={{ width: `${staPct}%` }} />
          </div>
          <span className="cp-bar-val">{player.energy}/{player.maxEnergy}</span>
        </div>
      </div>

      {/* Attributes */}
      <div className="cp-section">
        <div className="cp-section-title">Atributos</div>
        <div className="cp-attrs">
          <div className="cp-attr"><span>STR</span><span>{attrs.str}</span></div>
          <div className="cp-attr"><span>DEX</span><span>{attrs.dex}</span></div>
          <div className="cp-attr"><span>INT</span><span>{attrs.int}</span></div>
          <div className="cp-attr"><span>ENG</span><span>{attrs.eng}</span></div>
          <div className="cp-attr"><span>VIT</span><span>{attrs.vit}</span></div>
          <div className="cp-attr"><span>AGI</span><span>{attrs.agi}</span></div>
        </div>
      </div>

      {/* Combat Stats */}
      <div className="cp-section">
        <div className="cp-section-title">Combate</div>
        <div className="cp-stats">
          <div className="cp-stat"><span>ATK</span><span>{cs.attack}</span></div>
          <div className="cp-stat"><span>ARC</span><span>{cs.arcanePower}</span></div>
          <div className="cp-stat"><span>DEF</span><span>{cs.defense}</span></div>
          <div className="cp-stat"><span>CRIT</span><span>{cs.critChance}%</span></div>
          <div className="cp-stat"><span>EVA</span><span>{cs.evasion}%</span></div>
          <div className="cp-stat"><span>MOV</span><span>{cs.moveSpeed?.toFixed(3)}</span></div>
          <div className="cp-stat"><span>SPD</span><span>{cs.atkSpeed}</span></div>
          <div className="cp-stat"><span>B.DMG</span><span>{cs.B_Damage}</span></div>
        </div>
      </div>

      {/* Economy */}
      <div className="cp-section">
        <div className="cp-economy">
          <span>💰 {player.gold ?? 0}</span>
          <span>🪙 {player.silver ?? 0}</span>
        </div>
      </div>
    </div>
  );
}
