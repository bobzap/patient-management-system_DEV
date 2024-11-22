export const calculerAge = (dateNaissance: string): number => {
    const aujourdhui = new Date();
    const dateNaiss = new Date(dateNaissance);
    let age = aujourdhui.getFullYear() - dateNaiss.getFullYear();
    const mois = aujourdhui.getMonth() - dateNaiss.getMonth();
    if (mois < 0 || (mois === 0 && aujourdhui.getDate() < dateNaiss.getDate())) {
      age--;
    }
    return age;
  };
  
  export const calculerAnciennete = (dateEntree: string): string => {
    const aujourdhui = new Date();
    const dateE = new Date(dateEntree);
    const diffTime = Math.abs(aujourdhui.getTime() - dateE.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    return `${diffYears} ans et ${diffMonths} mois`;
  };
  
  export const calculerDuree = (heureDebut: string, heureFin: string): string => {
    if (!heureDebut || !heureFin) return '';
    
    try {
      const [heuresDebut, minutesDebut] = heureDebut.split(':').map(Number);
      const [heuresFin, minutesFin] = heureFin.split(':').map(Number);
      
      let totalMinutes = (heuresFin * 60 + minutesFin) - (heuresDebut * 60 + minutesDebut);
      if (totalMinutes < 0) totalMinutes += 24 * 60;
      
      const heures = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return `${heures.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (e) {
      console.error('Erreur dans le calcul de la durée:', e);
      return '';
    }
  };