import { getStatus } from "./statusHelpers";
import { BLOOD_CATEGORIES } from "../data/bloodCategories";

export function computeRecommendations(values, mode) {
  const flags = detectFlags(values);
  return {
    priorities: buildPriorities(flags, values, mode),
    nutrition: buildNutrition(flags, values, mode),
    training: buildTraining(flags, values, mode),
    lifestyle: buildLifestyle(flags, values, mode),
    followUp: buildFollowUp(flags, values, mode),
    strengths: buildStrengths(values, mode),
  };
}

function detectFlags(values) {
  const flags = {};
  const allMarkers = BLOOD_CATEGORIES.flatMap((c) => c.markers);
  for (const marker of allMarkers) {
    const status = getStatus(values[marker.id], marker);
    if (status === "flag") flags[marker.id] = { marker, value: parseFloat(values[marker.id]), status };
    if (status === "normal") flags[marker.id + "_normal"] = { marker, value: parseFloat(values[marker.id]), status: "normal" };
  }

  // Derived flags
  const ldl = parseFloat(values.ldl);
  const cholTotal = parseFloat(values.cholTotal);
  const hdl = parseFloat(values.hdl);
  const alt = parseFloat(values.alt);
  const ast = parseFloat(values.ast);
  const iron = parseFloat(values.iron);
  const calcium = parseFloat(values.calcium);
  const ins = parseFloat(values.insulin);
  const tg = parseFloat(values.triglycerides);

  if (!isNaN(ldl) && ldl > 130) flags.dyslipidemia = true;
  if (!isNaN(cholTotal) && !isNaN(hdl) && (cholTotal - hdl) > 160) flags.nonHdlHigh = true;
  if (!isNaN(alt) && !isNaN(ast) && alt > 0 && ast / alt < 0.8) flags.steatosisPattern = true;
  if (!isNaN(iron) && iron > 175) flags.ironOverload = true;
  if (!isNaN(calcium) && calcium > 10.2) flags.calciumHigh = true;
  if (!isNaN(ins) && ins < 3.0 && ins >= 0) flags.insulinLow = true;
  if (!isNaN(tg) && tg > 100 && tg <= 150) flags.tgBorderline = true;

  return flags;
}

function buildPriorities(flags, values, mode) {
  const priorities = [];

  if (flags.dyslipidemia || flags.ldl) {
    const ldl = parseFloat(values.ldl);
    const chol = parseFloat(values.cholTotal);
    const tg = parseFloat(values.triglycerides);
    const ins = parseFloat(values.insulin);
    const g = parseFloat(values.glucose);
    const homa = (!isNaN(g) && !isNaN(ins)) ? (g * ins) / 405 : null;
    const metabolicallyHealthy = homa !== null && homa < 1.5 && !isNaN(tg) && tg < 150;

    priorities.push({
      severity: "critical",
      title: "Dyslipidémie — LDL & Cholestérol",
      icon: "🔴",
      content: {
        clinical: `LDL-C ${ldl} mg/dL et cholestérol total ${chol} mg/dL — dyslipidémie franche. Non-HDL ${chol - parseFloat(values.hdl)} mg/dL. ${metabolicallyHealthy ? `Contexte métabolique paradoxal : HOMA-IR ${homa.toFixed(2)}, TG ${Math.round(tg)} — profil insulinosensible. LDL élevé en l'absence de syndrome métabolique = forte suspicion d'hypercholestérolémie familiale hétérozygote (HeFH, prévalence 1/250). Critères Dutch Lipid Clinic à évaluer. ` : ""}Selon ESC 2019, cible LDL < 116 mg/dL (risque bas), < 100 mg/dL (risque modéré). Doser apoB et Lp(a) — le Lp(a) est génétique, non modifiable, un seul dosage suffit à vie. Si Lp(a) élevé → risque CV significativement majoré indépendamment du LDL. Discuter statine si lifestyle insuffisant à 3 mois.`,
        informed: `Ton LDL à ${ldl} et cholestérol total à ${chol} sont nettement au-dessus des seuils. ${metabolicallyHealthy ? `Point important : ton profil métabolique est excellent (HOMA-IR ${homa.toFixed(2)}, triglycérides normaux). Un LDL aussi élevé avec un métabolisme aussi bon à 34 ans pointe fortement vers une composante génétique — probablement une hypercholestérolémie familiale (touche ~1 personne sur 250). Ce n'est pas ta faute, c'est génétique. ` : ""}Le plan : alimentation anti-inflammatoire + Zone 2 intensive + recontrôle à 3 mois. Si insuffisant, discuter un traitement (statine ou alternatives). Demande un dosage d'apoB et surtout de Lp(a) — c'est génétique, un seul test dans ta vie suffit, et ça change complètement l'évaluation du risque.`,
        simple: `Ton mauvais cholestérol est trop élevé. ${metabolicallyHealthy ? `Mais ton corps gère très bien le sucre et les graisses par ailleurs — c'est un signe que le problème est probablement génétique (héréditaire), pas lié à ton mode de vie. Ça touche environ 1 personne sur 250. ` : ""}L'alimentation et l'exercice d'endurance sont les premiers leviers, mais si ça ne suffit pas dans 3 mois, ton médecin pourra proposer un traitement. Demande aussi un test de Lp(a) — c'est un marqueur génétique qu'on ne dose qu'une fois dans sa vie et qui est très important pour ton risque cardiaque.`,
      }[mode],
    });
  }

  if (flags.alt || (parseFloat(values.alt) > 41)) {
    const alt = parseFloat(values.alt);
    const ast = parseFloat(values.ast);
    const deRitis = ast / alt;
    priorities.push({
      severity: "high",
      title: "Cytolyse hépatique — ALT élevée",
      icon: "🟠",
      content: {
        clinical: `ALT ${alt} UI/L (> 41), AST ${ast}, ratio De Ritis ${deRitis.toFixed(2)} (< 0.8 → pattern stéatosique). GGT ${values.ggt} UI/L normal — pas de cholestase. Hypothèses : NAFLD (graisse viscérale 244 cm³), hépatotoxicité médicamenteuse, entraînement intense (rhabdomyolyse a minima). Échographie hépatique + FibroScan recommandés.`,
        informed: `Ton ALT à ${alt} est élevée avec un pattern typique de stéatose hépatique (ratio AST/ALT < 0.8). Bonne nouvelle : tes GGT sont normales, donc pas de problème biliaire. L'échographie hépatique est recommandée pour confirmer. En attendant : zéro alcool, réduire fructose et graisses saturées.`,
        simple: `Ton foie montre des signes de stress. Le pattern pointe vers du gras accumulé dans le foie. Une échographie est recommandée. Côté alimentation : évite l'alcool, le sucre et les aliments ultra-transformés.`,
      }[mode],
    });
  }

  if (flags.ironOverload) {
    priorities.push({
      severity: "moderate",
      title: "Fer sérique élevé",
      icon: "🟡",
      content: {
        clinical: `Fer sérique ${values.iron} µg/dL (> 175) avec ferritine ${values.ferritin} ng/mL (normale). Discordance fer/ferritine : surcharge aiguë transitoire probable (apport alimentaire récent, hémolyse post-exercice). Moins inquiétant qu'une ferritine élevée. Recontrôler à jeun strict, compléter avec CST (coefficient de saturation de la transferrine).`,
        informed: `Ton fer sérique à ${values.iron} est au-dessus de la norme, mais ta ferritine (réserves) est normale à ${values.ferritin}. Ça peut être transitoire (repas riche en fer la veille, exercice intense). À recontrôler à jeun strict. Si le fer reste élevé, demander la saturation de la transferrine.`,
        simple: `Ton fer dans le sang est un peu élevé, mais tes réserves sont normales. C'est probablement lié à un repas récent ou à l'exercice. À revérifier au prochain bilan. En attendant, évite les compléments de fer.`,
      }[mode],
    });
  }

  if (flags.calciumHigh) {
    priorities.push({
      severity: "moderate",
      title: "Calcium légèrement élevé",
      icon: "🟡",
      content: {
        clinical: `Calcium ${values.calcium} mg/dL (> 10.2). Phosphore ${values.phosphorus} mg/dL normal. Hypothèses : hyperparathyroïdie primaire (doser PTH), déshydratation, excès de supplémentation, artefact (garrot prolongé). Vitamine D ${values.vitD} ng/mL dans la cible — peu probable qu'elle soit la cause.`,
        informed: `Ton calcium à ${values.calcium} est légèrement au-dessus de la norme. Ça peut être bénin (déshydratation, garrot pendant la prise de sang) ou signaler un problème de parathyroïde. Demande un dosage de PTH au prochain bilan. Vérifie aussi si tu prends des suppléments de calcium.`,
        simple: `Ton calcium est un peu élevé. Ça peut être rien (déshydratation) ou quelque chose à vérifier. Ton médecin peut demander un test complémentaire (PTH). En attendant, bois suffisamment d'eau et arrête le calcium en supplément si tu en prends.`,
      }[mode],
    });
  }

  return priorities;
}

function buildNutrition(flags, values, mode) {
  const sections = { favor: [], reduce: [], avoid: [] };

  // Always present
  sections.favor.push(
    { item: "Poissons gras (saumon, sardines, maquereau)", reason: "Oméga-3 EPA/DHA → réduction LDL, anti-inflammatoire", tags: ["ldl", "inflammation"] },
    { item: "Légumes crucifères (brocoli, chou, chou-fleur)", reason: "Fibres, sulforaphane → soutien hépatique + lipides", tags: ["foie", "ldl"] },
    { item: "Avoine, psyllium, graines de lin", reason: "Bêta-glucanes et fibres solubles → piègent le cholestérol", tags: ["ldl"] },
    { item: "Huile d'olive extra-vierge (cru)", reason: "Polyphénols + acide oléique → anti-inflammatoire, profil lipidique", tags: ["ldl", "inflammation"] },
    { item: "Légumineuses (lentilles, pois chiches)", reason: "Fibres solubles, protéines végétales → remplacement protéique partiel", tags: ["ldl", "fer"] },
    { item: "Noix, amandes (non salées, 30g/j)", reason: "Phytostérols + graisses insaturées → réduction LDL démontrée", tags: ["ldl"] },
    { item: "Œufs (source de choline)", reason: "La choline soutient le métabolisme hépatique des graisses", tags: ["foie"] },
    { item: "Thé vert / café noir (avec repas riches en fer)", reason: "Les tanins réduisent l'absorption du fer héminique", tags: ["fer"] },
  );

  sections.reduce.push(
    { item: "Viande rouge (max 2×/sem)", reason: "Graisses saturées → LDL + fer héminique élevé → surcharge", tags: ["ldl", "fer"] },
    { item: "Fromages gras, beurre, crème", reason: "Graisses saturées directement corrélées au LDL-C", tags: ["ldl"] },
    { item: "Fructose et sucres ajoutés", reason: "Lipogenèse hépatique → stéatose + triglycérides", tags: ["foie", "tg"] },
    { item: "Glucides raffinés (pain blanc, pâtes blanches)", reason: "Index glycémique élevé → pics insuline → lipogenèse", tags: ["foie", "tg"] },
    { item: "Suppléments de fer", reason: "Fer sérique déjà à 200 µg/dL — pas de supplémentation", tags: ["fer"] },
    { item: "Suppléments de calcium (si tu en prends)", reason: "Calcium à 10.7 — arrêter toute supplémentation calcique", tags: ["calcium"] },
  );

  sections.avoid.push(
    { item: "Alcool (0 tolérance)", reason: "ALT élevée + LDL élevé → hépatotoxicité directe", tags: ["foie", "ldl"] },
    { item: "Aliments ultra-transformés", reason: "Huiles industrielles, sucres cachés, additifs → inflammation + foie", tags: ["foie", "ldl", "inflammation"] },
    { item: "Charcuterie, viandes transformées", reason: "Fer héminique + nitrites + graisses saturées → triple impact", tags: ["fer", "ldl"] },
    { item: "Sodas et jus de fruits", reason: "Fructose concentré → lipogenèse hépatique directe", tags: ["foie"] },
    { item: "Vitamine C en supplément avec repas riches en fer", reason: "La vit C augmente l'absorption du fer — à séparer", tags: ["fer"] },
  );

  return sections;
}

function buildTraining(flags, values, mode) {
  const recs = [];

  recs.push({
    priority: "critical",
    category: "Zone 2 — Priorité #1",
    icon: "🏃",
    items: [
      { action: "do", text: "150-200 min/semaine de Zone 2 (FC 121-125 bpm)" },
      { action: "do", text: "Sessions de 45-60 min minimum pour maximiser l'oxydation lipidique" },
      { action: "do", text: "Marche rapide, vélo, natation, rameur — au choix" },
      { action: "do", text: "Zone 2 est le levier #1 prouvé pour réduire le LDL-C et améliorer la sensibilité à l'insuline" },
    ],
    explanation: {
      clinical: "L'exercice aérobie d'intensité modérée (40-60% VO₂max) active la lipoprotéine lipase musculaire, augmente le catabolisme des VLDL, et stimule la reverse cholesterol transport via ABCA1. Effet dose-dépendant sur LDL-C : -5 à -10% à 150 min/sem (Mann et al. 2014).",
      informed: "La Zone 2 est le meilleur outil non-médicamenteux pour faire baisser le LDL. Ton corps apprend à brûler les graisses plus efficacement, et le cholestérol baisse mécaniquement. L'effet est proportionnel au volume — plus tu en fais, plus ça baisse.",
      simple: "L'endurance douce est ta meilleure arme contre le cholestérol élevé. 3 à 4 séances de 45-60 minutes par semaine, à une intensité où tu peux encore parler.",
    }[mode],
  });

  recs.push({
    priority: "high",
    category: "Résistance — Maintenir",
    icon: "🏋️",
    items: [
      { action: "do", text: "3-4 sessions/semaine de musculation (maintenir pour la testo à 751)" },
      { action: "do", text: "Charges progressives — ton potentiel anabolique est excellent" },
      { action: "caution", text: "Surveiller les transaminases post-entraînement — ton ALT peut être partiellement liée à l'exercice excentrique" },
      { action: "dont", text: "Ne pas augmenter brutalement le volume — risque d'amplifier la cytolyse musculaire (ALT/AST)" },
    ],
    explanation: {
      clinical: "La testostérone à 751 ng/dL confirme un axe gonadotrope fonctionnel. L'entraînement en résistance doit être maintenu pour préserver le LMI (19.6 kg/m²) et potentialiser l'effet de la testo. Attention : l'exercice excentrique peut élever les transaminases (AST > ALT dans ce cas, ici AST/ALT = 0.67 donc pattern hépatique, pas musculaire).",
      informed: "Ta testostérone à 751 est excellente pour la recomp. Continue la musculation pour en tirer le maximum. L'ALT élevée est probablement d'origine hépatique (pas musculaire), mais ne surcharge pas le volume pour ne pas brouiller les pistes.",
      simple: "Continue la musculation — ta testostérone est au top pour construire du muscle. Ne force pas trop pour ne pas ajouter du stress à ton foie.",
    }[mode],
  });

  recs.push({
    priority: "moderate",
    category: "Récupération",
    icon: "🛌",
    items: [
      { action: "do", text: "1-2 jours de repos actif par semaine (marche, yoga, mobilité)" },
      { action: "do", text: "HRV matinale pour ajuster la charge (ton RMSSD de 45 ms est correct mais optimisable)" },
      { action: "caution", text: "CRP à 1.4 mg/L — légère inflammation. Ne pas ignorer les signes de surentraînement" },
    ],
    explanation: {
      clinical: "RMSSD 45 ms et HRR₁ 16 bpm — tonus vagal fonctionnel mais sous-optimal. CRP-us 1.4 mg/L compatible avec inflammation de bas grade. Prioriser la récupération parasympathique (respirations, sommeil, cold exposure).",
      informed: "Ta récupération est correcte mais pas optimale. Le HRV et la CRP suggèrent qu'il y a de la marge pour mieux récupérer. Le sommeil et la gestion du stress sont les leviers les plus puissants.",
      simple: "Accorde-toi des jours de repos. Ton corps récupère, mais il pourrait faire mieux avec plus de sommeil et moins de stress.",
    }[mode],
  });

  return recs;
}

function buildLifestyle(flags, values, mode) {
  const recs = [];

  recs.push({
    category: "Sommeil",
    icon: "😴",
    items: [
      { action: "do", text: "7-9h de sommeil par nuit — non négociable pour la testostérone et la récupération" },
      { action: "do", text: "Routine fixe : même heure de coucher/lever (±30 min), y compris le week-end" },
      { action: "do", text: "Chambre fraîche (18-20°C), obscurité totale" },
      { action: "dont", text: "Pas d'écrans 1h avant le coucher" },
      { action: "dont", text: "Pas de caféine après 14h" },
    ],
  });

  recs.push({
    category: "Hydratation",
    icon: "💧",
    items: [
      { action: "do", text: "2.5-3L d'eau/jour (poids 90.8 kg + double charge physique)" },
      { action: "do", text: "Eau riche en magnésium (le magnésium aide au métabolisme du calcium)" },
      { action: "caution", text: "Calcium à 10.7 — une bonne hydratation aide à réguler le calcium sérique" },
    ],
  });

  recs.push({
    category: "Supplémentation",
    icon: "💊",
    items: [
      { action: "do", text: "Vitamine D : maintenir 2000 UI/jour (45.6 ng/mL — dans la cible, ne pas arrêter)" },
      { action: "do", text: "Oméga-3 : 2-3g EPA+DHA/jour (impact direct LDL et inflammation)" },
      { action: "do", text: "Magnésium glycinate : 400mg/soir (sommeil, récupération, métabolisme calcium)" },
      { action: "dont", text: "STOP fer en supplément (fer sérique à 200, au-dessus de la norme)" },
      { action: "dont", text: "STOP calcium en supplément si tu en prends (calcium à 10.7)" },
      { action: "caution", text: "Envisager berbérine ou levure de riz rouge (discuter avec médecin — alternatives naturelles aux statines)" },
    ],
  });

  recs.push({
    category: "Gestion du stress",
    icon: "🧘",
    items: [
      { action: "do", text: "5-10 min de respiration nasale ou cohérence cardiaque/jour (impact HRV direct)" },
      { action: "do", text: "Exposition au froid : douche froide 2-3 min (activation parasympathique + anti-inflammatoire)" },
      { action: "do", text: "Exposition solaire 15-20 min/jour (maintien vitamine D + rythme circadien)" },
    ],
  });

  return recs;
}

function buildFollowUp(flags, values, mode) {
  const recs = [];

  recs.push({
    urgency: "3 mois",
    title: "Recontrôle lipidique + hépatique",
    tests: ["Cholestérol total", "HDL", "LDL (direct)", "Triglycérides", "apoB", "ALT", "AST", "GGT"],
    reason: {
      clinical: "Évaluation de l'efficacité des mesures hygiéno-diététiques sur la dyslipidémie et la cytolyse. Si LDL reste > 160 mg/dL malgré lifestyle optimisé, discuter statine. Le dosage d'apoB est plus informatif que le LDL-C pour la décision thérapeutique.",
      informed: "Dans 3 mois, on vérifie si l'alimentation et l'entraînement ont fait bouger le cholestérol et le foie. Si le LDL ne baisse pas assez, ton médecin pourra proposer un traitement. L'apoB est le vrai indicateur de risque.",
      simple: "Refais un bilan dans 3 mois pour voir si les changements d'alimentation et de sport ont marché. Si le cholestérol n'a pas baissé, ton médecin proposera d'autres solutions.",
    }[mode],
  });

  recs.push({
    urgency: "Dès que possible",
    title: "Bilan génétique lipidique",
    tests: ["Lp(a)", "apoB", "Score Dutch Lipid Clinic (critères HeFH)"],
    reason: {
      clinical: `LDL ${values.ldl} mg/dL dans un contexte métaboliquement sain (HOMA-IR bas, TG normaux) chez un homme de 34 ans actif — forte suspicion d'hypercholestérolémie familiale hétérozygote (HeFH, prévalence 1/250). Le dosage de Lp(a) est critique : marqueur génétique indépendant, non modifiable, un seul dosage à vie suffit. Si Lp(a) > 50 mg/dL (> 125 nmol/L), le risque CV est significativement majoré et la stratégie thérapeutique change (statine + éventuellement anti-PCSK9). L'apoB confirme le nombre de particules athérogènes. Évaluer les critères Dutch Lipid Clinic Network pour HeFH (score ≥ 6 = probable, ≥ 8 = certain). Enquête familiale recommandée (parents, fratrie).`,
      informed: `Ton LDL à ${values.ldl} avec un métabolisme par ailleurs excellent pointe vers une composante génétique — l'hypercholestérolémie familiale (1 personne sur 250). Le test le plus important est le Lp(a) : c'est un marqueur 100% génétique qu'on ne dose qu'une seule fois dans sa vie. Si il est élevé, ça change complètement la stratégie. Demande aussi l'apoB et parle du score Dutch Lipid Clinic à ton médecin. Renseigne-toi aussi sur l'historique familial : est-ce que tes parents ou grands-parents ont eu du cholestérol élevé ou des événements cardiaques ?`,
      simple: `Ton cholestérol élevé est probablement héréditaire (génétique) — ça s'appelle l'hypercholestérolémie familiale et ça touche 1 personne sur 250. Demande à ton médecin le test Lp(a) — c'est un test qu'on ne fait qu'une fois dans sa vie et qui est très important pour savoir quel traitement sera efficace. Demande aussi à ta famille si quelqu'un a du cholestérol élevé ou des problèmes cardiaques.`,
    }[mode],
  });

  recs.push({
    urgency: "Prochain bilan",
    title: "Tests complémentaires recommandés",
    tests: ["PTH (parathormone)", "Coefficient de saturation de la transferrine", "Échographie hépatique"],
    reason: {
      clinical: "La PTH lèvera l'ambiguïté sur le calcium à 10.7 (hyperparathyroïdie primaire ?). Le CST confirmera ou infirmera la surcharge en fer. L'échographie hépatique est indiquée vu le pattern stéatosique (ALT élevée, De Ritis < 0.8).",
      informed: "Ces tests complémentaires permettront de comprendre les zones d'ombre restantes : la cause du calcium élevé (PTH), la réalité de la surcharge en fer (saturation transferrine), et l'état du foie (échographie).",
      simple: "Demande ces tests supplémentaires pour lever les doutes sur le calcium, le fer et le foie.",
    }[mode],
  });

  recs.push({
    urgency: "6 mois",
    title: "Bilan complet de suivi",
    tests: ["Bilan sanguin complet", "Fer sérique + Ferritine + CST", "Calcium + PTH si pas fait avant"],
    reason: {
      clinical: "Réévaluation globale post-intervention lifestyle. Objectifs : LDL < 130 mg/dL, ALT < 40 UI/L, fer sérique < 175 µg/dL, calcium normalisé.",
      informed: "Bilan complet pour mesurer les progrès et ajuster la stratégie. Les objectifs : cholestérol en baisse, foie normalisé, fer et calcium corrigés.",
      simple: "Un bilan complet dans 6 mois pour voir où tu en es et ajuster le cap.",
    }[mode],
  });

  return recs;
}

function buildStrengths(values, mode) {
  const strengths = [];

  const testo = parseFloat(values.testosterone);
  if (!isNaN(testo) && testo >= 500) {
    strengths.push({
      title: "Testostérone exceptionnelle",
      icon: "⚡",
      detail: {
        clinical: `Testostérone ${testo} ng/dL — quartile supérieur. Potentiel anabolique maximal pour la recomposition. Maintenir via sommeil, entraînement en résistance, vitamine D (déjà optimale à ${values.vitD}).`,
        informed: `Ta testo à ${testo} ng/dL est excellente. C'est un atout majeur pour ta recomp. Continue ce qui fonctionne : musculation, sommeil, vitamine D.`,
        simple: `Ta testostérone est au top. Continue de bien dormir, de t'entraîner et de maintenir ta vitamine D.`,
      }[mode],
    });
  }

  const vitD = parseFloat(values.vitD);
  if (!isNaN(vitD) && vitD >= 40) {
    strengths.push({
      title: "Vitamine D optimale",
      icon: "☀️",
      detail: `Vitamine D à ${vitD} ng/mL — dans la zone optimale (40-70). Maintenir la supplémentation actuelle.`,
    });
  }

  const glucose = parseFloat(values.glucose);
  const hba1c = parseFloat(values.hba1c);
  if (!isNaN(glucose) && glucose <= 90 && !isNaN(hba1c) && hba1c <= 5.3) {
    strengths.push({
      title: "Contrôle glycémique parfait",
      icon: "🎯",
      detail: `Glycémie ${glucose} mg/dL, HbA1c ${hba1c}% — excellente régulation du sucre. HOMA-IR très bas.`,
    });
  }

  const creat = parseFloat(values.creatinine);
  if (!isNaN(creat) && creat >= 0.8 && creat <= 1.2) {
    strengths.push({
      title: "Fonction rénale préservée",
      icon: "✅",
      detail: `Créatinine ${creat} mg/dL — reins en parfait état malgré l'apport protéique élevé.`,
    });
  }

  const vs = parseFloat(values.vs);
  const ggt = parseFloat(values.ggt);
  if (!isNaN(vs) && vs <= 5 && !isNaN(ggt) && ggt <= 25) {
    strengths.push({
      title: "VS + GGT au plancher",
      icon: "🛡️",
      detail: `VS ${vs} mm/h, GGT ${ggt} U/L — pas d'inflammation systémique ni de cholestase. Le foie n'est pas inflammé malgré l'ALT élevée.`,
    });
  }

  return strengths;
}
