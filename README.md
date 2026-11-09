# YDM Coiffure — Plateforme de Reservation Haute Coiffure Afro

Application web complete, haut de gamme, responsive et minimaliste dediee a YDM Coiffure (@ydm_coiffure), coiffeuse afro independante basee a La Roche-sur-Yon.

Concue et developpee selon les standards modernes : **Next.js (App Router)**, **JavaScript exclusif** (aucun TypeScript), **Tailwind CSS v4**, **MongoDB Atlas avec Mongoose (ou fallback local)**, **Stripe Checkout pour les acomptes de 10 euros**, et **Resend pour les e-mails transactionnels**.

---

## Directives Artistiques & UI/UX

- **Design Minimaliste & Epure** : Palette elegante (anthracite pour les textes, fond blanc casse/gris tres clair, touches de nude/taupe chaud pour les boutons d'action), typographie serif raffinee et sans-serif moderne, aucun emoji, espaces aeres.
- **Parcours de Reservation** :
  1. Choix de la prestation parmi le catalogue officiel (sans rajouts, sans meches incluses, avec meches incluses).
  2. Personnalisation avec guide visuel des 4 longueurs (Court, Mi-long, Long, Extra-long) et reduction etudiante (-5 euros sur prestations avec meches incluses).
  3. Moteur de disponibilites (respect des horaires, pauses, battements et delais d'anticipation).
  4. Coordonnees de la cliente et acceptation du reglement interieur.
  5. Soumission de la demande : statut initial `PENDING_APPROVAL`.
- **Validation Manuelle & Acompte de 10 € sous 5h** :
  - La coiffeuse valide manuellement chaque demande.
  - La cliente dispose d'un **delai strict de 5 heures** pour regler l'acompte de 10 euros (non remboursable). Passe ce delai, le creneau est automatiquement libere.
- **Confidentialite & Adresse** :
  - L'adresse personnelle de la coiffeuse n'apparait jamais sur les pages publiques.
  - L'adresse a La Roche-sur-Yon et les consignes d'acces sont communiquees apres validation de l'acompte.

---

## Stack Technique

- **Framework** : Next.js 15 (App Router, Server Components par defaut, Client Components cibles).
- **Langage** : JavaScript (ES Modules) exclusivement.
- **Styles** : Tailwind CSS v4 avec theme personnalise.
- **Composants & Icones** : Lucide React (sans emoji).
- **Base de Donnees** : MongoDB Atlas avec Mongoose (avec fallback local automatique .data/db.json).
- **Authentification** : Sessions securisees par cookies HTTP-only chiffres JWT.
- **Paiements** : Stripe Checkout pour les acomptes de 10 euros + simulateur integre.
- **E-mails Transactionnels** : Resend avec templates HTML aux couleurs de la marque.

---

## Installation & Demarrage

### 1. Prerequis
- Node.js version 18+
- npm

### 2. Installer les dependances
```bash
cd "YDM coiffure"
npm install
```

### 3. Initialisation des donnees (Seeding)
```bash
npm run seed
```

### 4. Lancer l'environnement de developpement
```bash
npm run dev
```

### 5. Lancer les tests automatises
```bash
npm test
```

### 6. Compilation de production
```bash
npm run build
```

---

## Architecture du Projet

```text
├── app/
│   ├── page.jsx                    # Accueil epure (Hero, prestations populaires, guide longueurs, reglement)
│   ├── prestations/page.jsx        # Carte officielle des prestations (3 categories, options)
│   ├── galerie/page.jsx            # Galerie de realisations
│   ├── contact/page.jsx            # Contact, localisation La Roche-sur-Yon, modalites
│   ├── mentions-legales/page.jsx   # Mentions legales
│   ├── politique-confidentialite/page.jsx # RGPD & Donnees personnelles
│   ├── conditions-reservation/page.jsx   # Reglement interieur officiel
│   ├── reserver/
│   │   ├── page.jsx                # Parcours de reservation en 6 etapes
│   │   └── statut/[reference]/page.jsx # Suivi de demande & delai 5h
│   ├── paiement/
│   │   ├── simulation/page.jsx     # Simulateur d'acompte 10 euros
│   │   ├── succes/page.jsx         # Confirmation & adresse confidentielle
│   │   └── annule/page.jsx         # Annulation & reprise du paiement
│   ├── admin/                      # Espace d'administration prive
│   └── globals.css                 # Theme Tailwind CSS v4
├── components/                     # Composants UI epures sans emojis
├── lib/                            # Logique metier, regles 5h, acompte 10 euros, seedData
├── models/                         # Modeles Mongoose
└── tests/                          # Tests unitaires et d'integration
```

---

## Securite & Confidentialite

- Mots de passe chiffres par bcrypt.
- Protection des routes `/admin` par cookies HttpOnly.
- Prevention des doubles reservations (anti-collision).
- Adresse a La Roche-sur-Yon protegee et reservee aux rendez-vous confirmes.
