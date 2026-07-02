# World of Nova — Inspiración: Mazmorras e instancias de WoW

> Distribución y diseño de instancias de World of Warcraft (Retail) como referencia para World of Nova.

## Fuentes

- Instances — WoWpedia (en): `https://wow.gamepedia.com/Category:Instances`
- Mazmorra — Wow Archive Fandom (es): `https://wow-archive.fandom.com/es/wiki/Mazmorra`

---

## Visión general

Las instancias son zonas cerradas para grupos de jugadores. Se dividen en:

- **Mazmorras (dungeons)**: 5 jugadores, contenido corto/medio.
- **Bandas (raids)**: 10–40 jugadores, contenido élite.
- **Escenarios**: pequeñas instancias narrativas.

## Elementos comunes de diseño

| Aspecto | Patrón típico |
|---------|---------------|
| **Tamaño** | 1–5 jefes principales por mazmorra; raids de 4–14 jefes |
| **Jugadores** | Mazmorras 5; raids 10/25/20/40 según expansión |
| **Dificultad** | Normal → Heroico → Mítico → Mítico+ (Retail) |
| **Cooldown** | Mazmorras: ninguno (farming). Raids: semanal por dificultad. |
| **Requisitos** | Nivel mínimo, item level, cadena de misiones o llave (antiguo sistema) |
| **Loot** | Cada jefe tiene tabla propia; jefe final mejores recompensas. |
| **Límite** | Mítico+ tiene temporizador y afijos semanales. |

## Distribución de contenido

Una mazmorra típica contiene:

1. **Trash mobs**: oleadas entre jefes, dropean monedas y materiales.
2. **Mini-jefes**: enemigos élite opcionales o obligatorios.
3. **Jefes principales**: 1–5 por instancia, cada uno con mecánicas únicas.
4. **Cofres/secretos**: objetos ocultos, llaves, atajos.
5. **Objetivos de misión**: NPCs o items que avanzan quests.

## Lista de instancias encontradas (muestra)

1. Instance\n2. Instances by continent\n3. Aberrus, the Shadowed Crucible\n4. Ahn'kahet: The Old Kingdom\n5. Algeth'ar Academy (instance)\n6. Amirdrassil, the Dream's Hope\n7. Antorus, the Burning Throne\n8. Arcatraz\n9. Assault on Violet Hold\n10. Atal'Dazar (instance)\n11. Auchenai Crypts\n12. Auchindoun\n13. Auchindoun (alternate universe)\n14. Azjol-Nerub (instance)\n15. Azure Vault\n16. Battle for Mount Hyjal (instance)\n17. Battle of Dazar'alor\n18. Black Morass\n19. Black Rook Hold\n20. Black Temple\n21. Blackfathom Deeps\n22. Blackfathom Deeps (Classic)\n23. Blackrock Caverns\n24. Blackrock Depths\n25. Blackrock Spire\n26. Blackwing Descent\n27. Blackwing Lair\n28. Blood Furnace\n29. Bloodmaul Slag Mines\n30. Botanica\n31. Brackenhide Hollow\n32. Cathedral of Eternal Night\n33. Chamber of Aspects\n34. Culling of Stratholme (instance)\n35. Darkheart Thicket\n36. Darkmaul Citadel (instance)\n37. Dawn of the Infinite\n38. Deadmines\n39. Deadmines (Classic)\n40. Dire Maul\n41. Drak'Tharon Keep\n42. Emerald Nightmare (instance)\n43. End Time\n44. Escape from Durnholde Keep\n45. Eternal Palace\n46. Everbloom\n47. Eye (Tempest Keep)\n48. Eye of Azshara (instance)\n49. Eye of Eternity\n50. Firelands (instance)\n51. Forge of Souls\n52. Freehold (instance)\n53. Gate of the Setting Sun\n54. Gnomeregan (instance)\n55. Grimrail Depot\n56. Gruul's Lair\n57. Gundrak\n58. Halls of Atonement (instance)\n59. Halls of Infusion\n60. Halls of Lightning\n61. Halls of Reflection\n62. Halls of Stone\n63. Halls of Valor\n64. Heart of Fear\n65. Hellfire Ramparts\n66. Hour of Twilight (instance)\n67. Icecrown Citadel (instance)\n68. Instance attunement\n69. Instance attunement (Burning Crusade)\n70. Instance attunement (Classic)\n71. Iron Docks\n72. Karazhan (raid)\n73. Kings' Rest\n74. Lower Blackrock Spire\n75. Magisters' Terrace\n76. Magtheridon's Lair\n77. Mana-Tombs\n78. Maraudon\n79. Mechanar\n80. Memories of Azeroth\n81. Mists of Tirna Scithe\n82. Mogu'shan Palace\n83. Mogu'shan Vaults\n84. Molten Core\n85. MOTHERLODE!!\n86. Naxxramas\n87. Necrotic Wake\n88. Neltharus\n89. Nexus (instance)\n90. Nokhud Offensive\n91. Ny'alotha, the Waking City\n92. Obsidian Sanctum\n93. Oculus\n94. Old Hillsbrad Foothills\n95. Opening the Dark Portal\n96. Operation: Mechagon\n97. Other Side\n98. Pit of Saron\n99. Plaguefall\n100. Programmer Isle\n

**Total de instancias indexadas:** 179

---

## Algoritmo conceptual de una mazmorra

```
entradaInstancia(player, group) ->
  validar requisitos(nivel, ilevel, llave si aplica)
  crear copia privada de la instancia
  generar trash y jefes según dificultad
  iniciar temporizador si es Mítico+

alMorirJefe(jefe) ->
  cada jugador con derecho a loot -> roll sobre tablaDeLoot(jefe, dificultad)
  actualizar progreso de instancia
  desbloquear siguiente área

alCompletarInstancia ->
  recompensas de jefe final
  actualizar lockout semanal si aplica
```

## Lecciones de diseño para World of Nova

1. **Escalado por dificultad**: mismo contenido, mejores recompensas y mecánicas adicionales.
2. **Lockouts semanales para raids**: evita el farming infinito de contenido élite.
3. **Loot por jefe**: cada jefe tiene una tabla temática; el jefe final tiene el mejor loot.
4. **Requisitos de entrada**: nivel, gear o progresión de historia dan peso a las instancias.
5. **Mítico+ como endgame**: temporizador + afijos rotativos = alta rejugabilidad.
6. **Instancias privadas**: cada grupo obtiene su propia copia del mundo, evitando competencia por mobs.

---

*Última actualización: 2026-07-02*
