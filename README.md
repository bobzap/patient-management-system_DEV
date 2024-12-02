This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



## Version : 

* Récapitulatif des modifications effectuées :

- Implémentation complète CRUD des patients

Création du hook usePatients
Mise en place des routes API (GET, PUT, DELETE)
Correction des problèmes de redirection et de gestion d'état


- Améliorations de l'interface utilisateur

Correction du PatientForm pour la gestion des étapes
Ajout des notifications avec style personnalisé
Amélioration de l'affichage des données patient
Formatage des dates dans le formulaire



* Points d'amélioration notés :

- Gestion des redirections

Retour à la page précédente après modification
Persistance des données actualisées
Éviter le retour systématique à l'accueil


- Système de notifications

Affichage au premier plan
Persistance pendant les changements de page
Durée d'affichage garantie


## NOTE IMPORTANTE : DEV ENTRETIEN ROAD MAP 

Par relations avec les autres modèles, je faisais référence à comment un entretien est lié à un patient dans la base de données (un patient peut avoir plusieurs entretiens, un entretien appartient à un patient, etc.).
Pour l'approche de développement, je suggère une stratégie progressive :
Phase 1 - Base solide :

Créer le modèle Entretien dans la BDD avec une structure flexible qui supportera le formbuilder plus tard
Implémenter le CRUD basique pour les entretiens
Mettre en place l'interface de base avec les sections fixes

Phase 2 - Préparation FormBuilder :

Utiliser les modèles FormConfiguration/FormSection/FormField existants
Structurer le code de manière modulaire pour faciliter l'ajout du formbuilder

Phase 3 - FormBuilder (plus tard) :

Ajouter l'option "Paramétrer"
Implémenter la personnalisation des champs
Ajouter la fonction de drag & drop

Commençons par créer le modèle Entretien. Je propose cette structure :
prisma
