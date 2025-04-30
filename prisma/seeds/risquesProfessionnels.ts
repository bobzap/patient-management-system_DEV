// prisma/seeds/risquesProfessionnels.ts

export const initialRisquesProfessionnels = [
    {
      nom: "Bruit",
      lien: "https://www.inrs.fr/risques/bruit/ce-qu-il-faut-retenir.html",
      estFavori: false
    },
    {
      nom: "Chutes de hauteur",
      lien: "https://www.inrs.fr/risques/chutes-hauteur/ce-qu-il-faut-retenir.html",
      estFavori: false
    },
    {
      nom: "Risques chimiques",
      lien: "https://www.inrs.fr/risques/chimiques/ce-qu-il-faut-retenir.html",
      estFavori: false
    },
    {
      nom: "Risques psychosociaux",
      lien: "https://www.inrs.fr/risques/psychosociaux/ce-qu-il-faut-retenir.html",
      estFavori: true
    },
    {
      nom: "Troubles musculosquelettiques (TMS)",
      lien: "https://www.inrs.fr/risques/tms-troubles-musculosquelettiques/ce-qu-il-faut-retenir.html",
      estFavori: true
    }
  ];