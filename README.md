# FreshMerch — refonte premium

## Structure
- `index.html` : site vitrine principal
- `styles.css` : design system + responsive
- `script.js` : interactions du site
- `studio.html` : configurateur 3D fourni, adapté à la DA FreshMerch
- `assets/sports-photos/` : photos locales des univers sportifs

## DA
- Navy : `#020711` / `#071225`
- Bleu : `#0d2a4e` / `#2f7cff`
- Jaune : `#ffed00` / `#ffd21a`

## Studio
Tous les boutons `Studio` du site ouvrent `studio.html`. Les cartes sport transmettent aussi `?sport=...` afin de préparer une future présélection.

## Lancer
Ouvrir le dossier dans VS Code / Live Studio et lancer `index.html` avec Live Server.
Le Studio utilise Three.js depuis CDN et conserve le patron 3D embarqué du configurateur fourni.

## Modification rapide
- Textes : `index.html`
- Couleurs / espacements : `styles.css`
- Interactions vitrine : `script.js`
- Visuels sports : `assets/sports-photos/*.jpg`
- Configurateur : `studio.html`
