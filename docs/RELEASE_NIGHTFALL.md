# Release: Nightfall

Nightfall is the first World of Nova release connected to ClickForge.

## Acceptance

- ClickForge account creation uses Firebase Auth.
- `POST /api/auth/firebase` returns a WoN/ClickForge session JWT.
- `GET /api/clickforge/profile` returns account data, characters, and `gameProfiles`.
- New users reach character creation.
- Returning users reach character selection.
- Character creation initializes stats, bags, progression, and a `GameProfile`.
- ClickForge Play opens WoN web with `?token=<jwt>`.
