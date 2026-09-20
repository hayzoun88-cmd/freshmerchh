# FreshMerch — site vitrine

## Structure
- `index.html` : accueil
- `textile.html` : catalogue textile personnalisé (exemples, en attente d'intégration TopTex)
- `sport.html` : catalogue sport & sublimation, sélecteur visuel par discipline
- `studio.html` : configurateur 3D (maillot personnalisable, autonome, transmet sa config à `devis.html`)
- `devis.html` : formulaire de devis multi-étapes (envoi par mailto, sans backend)
- `a-propos.html` : histoire, valeurs, méthode
- `styles.css` : design system + responsive
- `script.js` : interactions du site (hors `studio.html`, autonome)
- `assets/` : logo, photo produit, photos sport (créditées en pied de page), icônes

## DA
- Navy profond : `#020711` — Navy secondaire : `#071225`
- Bleu : `#0d2a4e` — Bleu électrique : `#2f7cff`
- Jaune (accent CTA) : `#ffed00`
- Variables CSS centralisées dans `:root` en haut de `styles.css`

## Devis
Le site est 100% statique (pas de serveur). Le bouton d'envoi du formulaire ouvre le client mail du
visiteur avec un récapitulatif complet, adressé à `jules.frescaline@gmail.com`. Les fichiers joints ne
partent pas automatiquement (limite du lien `mailto:`) : ils sont rappelés dans le corps du message, à
joindre manuellement. Pour brancher un vrai envoi serveur plus tard, voir le commentaire au-dessus de
`initQuoteForm()` dans `script.js`.

## Studio 3D
`studio.html` est un fichier autonome (patron 3D embarqué en base64, Three.js chargé depuis un CDN).
En validant sa maquette, il redirige vers `devis.html?from=studio` avec un résumé de la configuration
(couleurs, logos, textes) transmis via `sessionStorage` et affiché en haut du formulaire.

## À savoir / limites connues
- Le catalogue TopTex n'est pas encore branché : le conteneur `.iframe-embed` sur `textile.html` est prêt
  à recevoir l'iframe dès réception du code d'intégration TopTex.

## Lancer en local
Ouvrir le dossier avec Live Server (VS Code) ou tout serveur statique, et lancer `index.html`.
