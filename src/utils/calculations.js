// ─── INDICES CALCULÉS ───────────────────────────────────────────────────────

export function computeIndices(values, chronoAge, mode, physiometrics) {
  const results = [];
  const g = parseFloat(values.glucose);
  const ins = parseFloat(values.insulin);
  const tg = parseFloat(values.triglycerides);
  const hdl = parseFloat(values.hdl);
  const ldl = parseFloat(values.ldl);
  const alt = parseFloat(values.alt);
  const ast = parseFloat(values.ast);
  const creat = parseFloat(values.creatinine);
  const cholTotal = parseFloat(values.cholTotal);

  // ── HOMA-IR ──
  if (!isNaN(g) && !isNaN(ins)) {
    const homa = (g * ins) / 405;
    const status = homa < 1.5 ? "optimal" : homa < 2.5 ? "normal" : "flag";
    results.push({
      label: "HOMA-IR", value: homa.toFixed(2), unit: "", status,
      explanation: ({
        optimal: {
          clinical: `HOMA-IR ${homa.toFixed(2)} — insulinosensibilité hépatique préservée (seuil < 1.5, Stern et al. 2005). Concordant avec RQ 0.71 en calorimétrie indirecte.`,
          informed: `Excellente sensibilité à l'insuline. Cohérent avec ton RQ de 0.71 et ton oxydation lipidique dominante (83% au repos).`,
          simple: `Ton corps gère très bien le sucre dans le sang. Excellent signe pour ta capacité à brûler les graisses.`,
        },
        normal: {
          clinical: `HOMA-IR ${homa.toFixed(2)} — sensibilité modérée (seuil < 2.5). Décalage possible avec RQ 0.71.`,
          informed: `Sensibilité correcte mais perfectible. À surveiller dans le contexte de ta recomposition corporelle.`,
          simple: `Ton corps gère le sucre de façon acceptable, mais il y a une marge de progression.`,
        },
        flag: {
          clinical: `HOMA-IR ${homa.toFixed(2)} — résistance à l'insuline probable (> 2.5). Discordant avec RQ 0.71. Investiguer : HGPO, peptide C, écho hépatique.`,
          informed: `Résistance à l'insuline probable. Décalage avec ton profil métabolique de repos — à investiguer.`,
          simple: `Ton corps a du mal à gérer le sucre correctement. Ça vaut le coup d'en parler avec ton médecin.`,
        },
      })[status][mode],
    });

    // ── QUICKI ──
    if (g > 0 && ins > 0) {
      const quicki = 1 / (Math.log10(ins) + Math.log10(g));
      const qStatus = quicki > 0.357 ? "optimal" : quicki >= 0.30 ? "normal" : "flag";
      results.push({
        label: "QUICKI", value: quicki.toFixed(3), unit: "", status: qStatus,
        explanation: ({
          optimal: {
            clinical: `QUICKI ${quicki.toFixed(3)} — sensibilité à l'insuline élevée (> 0.357, Katz et al. 2000). Plus robuste que HOMA-IR en zone basse d'insuline. Concordance HOMA-IR/QUICKI confirmée.`,
            informed: `QUICKI à ${quicki.toFixed(3)} — confirme l'excellente sensibilité à l'insuline détectée par le HOMA-IR. Cet indice est plus fiable quand l'insuline est basse.`,
            simple: `Un autre calcul confirme que ton corps gère très bien le sucre. Plus fiable que le précédent quand l'insuline est basse.`,
          },
          normal: {
            clinical: `QUICKI ${quicki.toFixed(3)} — sensibilité intermédiaire (0.30–0.357). Zone de transition, insulinorésistance non franche.`,
            informed: `QUICKI à ${quicki.toFixed(3)} — sensibilité intermédiaire. Cohérent avec le HOMA-IR, pas de discordance.`,
            simple: `La gestion du sucre est correcte mais pas optimale. Cohérent avec l'autre indicateur.`,
          },
          flag: {
            clinical: `QUICKI ${quicki.toFixed(3)} — insulinorésistance (< 0.30, Chen et al. 2003). Corrobore le HOMA-IR. Clamp euglycémique hyperinsulinémique seul gold standard restant.`,
            informed: `QUICKI à ${quicki.toFixed(3)} — confirme la résistance à l'insuline détectée par le HOMA-IR. Les deux indices convergent.`,
            simple: `Ce deuxième calcul confirme aussi que la gestion du sucre est mauvaise. Il faut agir.`,
          },
        })[qStatus][mode],
      });
    }
  }

  // ── Ratio TG/HDL ──
  if (!isNaN(tg) && !isNaN(hdl) && hdl > 0) {
    const ratio = tg / hdl;
    const status = ratio < 1.5 ? "optimal" : ratio < 2.5 ? "normal" : "flag";
    results.push({
      label: "Ratio TG/HDL", value: ratio.toFixed(2), unit: "", status,
      explanation: ({
        optimal: {
          clinical: `TG/HDL ${ratio.toFixed(2)} — proxy de la taille des LDL (pattern A, McLaughlin et al. 2005). Corrélé négativement avec l'insulinorésistance.`,
          informed: `Proxy fiable d'une bonne sensibilité à l'insuline. Confirme (ou non) le HOMA-IR.`,
          simple: `Le rapport entre tes graisses sanguines et ton bon cholestérol est excellent.`,
        },
        normal: {
          clinical: `TG/HDL ${ratio.toFixed(2)} — zone intermédiaire. Corrélation modérée avec LDL de taille mixte.`,
          informed: `Zone acceptable. Un ratio plus bas serait idéal pour ton profil d'oxydation lipidique.`,
          simple: `Ce rapport est correct, mais pourrait être meilleur.`,
        },
        flag: {
          clinical: `TG/HDL ${ratio.toFixed(2)} — évocateur de LDL petites et denses (pattern B). À corréler avec apoB.`,
          informed: `Risque de résistance à l'insuline et de particules LDL denses. À croiser avec HOMA-IR.`,
          simple: `Ce rapport est élevé. Les graisses dans ton sang ne sont pas du bon type.`,
        },
      })[status][mode],
    });
  }

  // ── Non-HDL Cholestérol ──
  if (!isNaN(cholTotal) && !isNaN(hdl)) {
    const nonHdl = cholTotal - hdl;
    const status = nonHdl < 130 ? "optimal" : nonHdl < 160 ? "normal" : "flag";
    results.push({
      label: "Non-HDL Cholestérol", value: Math.round(nonHdl).toString(), unit: "mg/dL", status,
      explanation: ({
        optimal: {
          clinical: `Non-HDL ${Math.round(nonHdl)} mg/dL — englobe VLDL + IDL + LDL + Lp(a). Meilleur prédicteur CV que LDL-C seul (Boekholdt et al. 2012). Cible < 130 mg/dL atteinte.`,
          informed: `Non-HDL à ${Math.round(nonHdl)} mg/dL — c'est tout le cholestérol "à risque". Meilleur indicateur que le LDL seul, et le tien est au bon niveau.`,
          simple: `Ton cholestérol "à risque" (tout sauf le bon) est à un bon niveau. Mieux que de regarder le LDL seul.`,
        },
        normal: {
          clinical: `Non-HDL ${Math.round(nonHdl)} mg/dL — intermédiaire (130–160). Risque CV modéré. Considérer apoB pour affiner la stratification.`,
          informed: `Non-HDL à ${Math.round(nonHdl)} mg/dL — dans la zone intermédiaire. C'est un indicateur plus complet que le LDL seul.`,
          simple: `Ton cholestérol "à risque" est acceptable mais pas optimal. L'alimentation et l'exercice peuvent l'améliorer.`,
        },
        flag: {
          clinical: `Non-HDL ${Math.round(nonHdl)} mg/dL — élevé (> 160). Risque CV augmenté. Bilan lipidique approfondi recommandé : apoB, Lp(a).`,
          informed: `Non-HDL à ${Math.round(nonHdl)} mg/dL — élevé. Ton risque cardiovasculaire est augmenté. À discuter avec ton médecin.`,
          simple: `Ton cholestérol "à risque" est trop élevé. Ton médecin peut t'aider à le faire baisser.`,
        },
      })[status][mode],
    });
  }

  // ── Indice de Castelli (CholTotal/HDL) ──
  if (!isNaN(cholTotal) && !isNaN(hdl) && hdl > 0) {
    const castelli = cholTotal / hdl;
    // Homme: <4.0 faible, 4.0-5.5 modéré, >5.5 élevé (Castelli et al. 1983, Framingham)
    const status = castelli < 4.0 ? "optimal" : castelli <= 5.5 ? "normal" : "flag";
    results.push({
      label: "Indice de Castelli", value: castelli.toFixed(2), unit: "", status,
      explanation: ({
        optimal: {
          clinical: `Castelli I ${castelli.toFixed(2)} — risque CV faible (< 4.0 homme, Castelli et al. 1983 – Framingham). Profil lipoprotéique protecteur.`,
          informed: `Indice de Castelli à ${castelli.toFixed(2)} — ton ratio cholestérol total / HDL est favorable. Risque cardiovasculaire faible.`,
          simple: `Le rapport entre ton cholestérol total et ton bon cholestérol est bon. Ton cœur est bien protégé.`,
        },
        normal: {
          clinical: `Castelli I ${castelli.toFixed(2)} — risque CV modéré (4.0–5.5 homme). Marge d'optimisation via augmentation HDL et/ou réduction LDL. Le HDL à ${hdl} mg/dL dilue partiellement l'impact du cholestérol total élevé.`,
          informed: `Indice à ${castelli.toFixed(2)} — zone de risque modéré pour un homme (seuil élevé > 5.5). Augmenter le HDL (Zone 2, oméga-3) et baisser le LDL sont les deux leviers.`,
          simple: `Ce rapport est dans la zone de risque modéré. C'est lié à ton cholestérol élevé. L'exercice d'endurance et l'alimentation peuvent l'améliorer.`,
        },
        flag: {
          clinical: `Castelli I ${castelli.toFixed(2)} — risque CV élevé (> 5.5 homme). Profil athérogène. Investiguer dyslipidémie secondaire, lifestyle, hérédité.`,
          informed: `Indice à ${castelli.toFixed(2)} — élevé (> 5.5). Risque cardiovasculaire augmenté. Bilan lipidique approfondi recommandé.`,
          simple: `Ce rapport est trop élevé. Ton risque pour le cœur est augmenté. Ton médecin peut t'aider.`,
        },
      })[status][mode],
    });
  }

  // ── LDL corrigé (Iranian formula) ──
  if (!isNaN(cholTotal) && !isNaN(hdl) && !isNaN(tg)) {
    const friedewald = cholTotal - hdl - tg / 5;
    const iranian = cholTotal / 1.19 + tg / 1.9 - hdl / 1.1 - 38;
    const delta = Math.round(iranian - friedewald);
    const enteredLdl = parseFloat(values.ldl);
    const status = Math.abs(delta) <= 5 ? "optimal" : Math.abs(delta) <= 15 ? "normal" : "flag";
    results.push({
      label: "LDL corrigé (Iranian)", value: Math.round(iranian).toString(), unit: "mg/dL", status,
      explanation: ({
        optimal: {
          clinical: `LDL Iranian ${Math.round(iranian)} vs Friedewald ${Math.round(friedewald)} mg/dL (Δ${delta > 0 ? "+" : ""}${delta}). Faible discordance — Friedewald fiable à ce niveau de TG (${Math.round(tg)} mg/dL).`,
          informed: `LDL corrigé à ${Math.round(iranian)} mg/dL — très proche du Friedewald (${Math.round(friedewald)}). Avec des TG à ${Math.round(tg)}, les deux formules sont fiables.`,
          simple: `Deux façons de calculer ton mauvais cholestérol donnent presque le même résultat. Le chiffre est fiable.`,
        },
        normal: {
          clinical: `LDL Iranian ${Math.round(iranian)} vs Friedewald ${Math.round(friedewald)} mg/dL (Δ${delta > 0 ? "+" : ""}${delta}). Discordance modérée. L'Iranian est plus fiable quand TG < 100 mg/dL (Ahmadi et al. 2008).`,
          informed: `LDL corrigé à ${Math.round(iranian)} vs ${Math.round(friedewald)} par Friedewald. Écart de ${Math.abs(delta)} mg/dL — l'Iranian est plus précis avec tes TG bas.`,
          simple: `Deux calculs donnent des résultats légèrement différents. Avec tes triglycérides bas, le chiffre corrigé est probablement plus juste.`,
        },
        flag: {
          clinical: `LDL Iranian ${Math.round(iranian)} vs Friedewald ${Math.round(friedewald)} mg/dL (Δ${delta > 0 ? "+" : ""}${delta}). Discordance significative. Friedewald surestime/sous-estime à TG < 70 ou > 400. Dosage direct LDL-C recommandé.`,
          informed: `Écart important entre les deux formules (${Math.abs(delta)} mg/dL). Un dosage direct du LDL serait plus fiable.`,
          simple: `Les deux façons de calculer ne sont pas d'accord. Demande un dosage direct du LDL à ton labo.`,
        },
      })[status][mode],
    });
  }

  // ── Ratio De Ritis ──
  if (!isNaN(alt) && !isNaN(ast) && alt > 0) {
    const deRitis = ast / alt;
    const status = deRitis >= 0.8 && deRitis <= 1.5 ? "optimal" : deRitis < 0.8 ? "normal" : "flag";
    results.push({
      label: "Ratio De Ritis (AST/ALT)", value: deRitis.toFixed(2), unit: "", status,
      explanation: ({
        optimal: {
          clinical: `De Ritis ${deRitis.toFixed(2)} — intervalle physiologique (0.8–1.5). Pas de cytolyse hépatique ou musculaire significative.`,
          informed: `Ratio normal. Pas de signe de souffrance hépatique.`,
          simple: `Ton foie fonctionne bien. Pas de souci détecté.`,
        },
        normal: {
          clinical: `De Ritis ${deRitis.toFixed(2)} — < 0.8, évocateur de stéatose hépatique non alcoolique (NAFLD). Corréler échographie et GGT.`,
          informed: `Ratio bas — souvent bénin, parfois stéatose hépatique non alcoolique.`,
          simple: `Ce ratio est un peu bas. Possible surcharge du foie en graisse. À surveiller.`,
        },
        flag: {
          clinical: `De Ritis ${deRitis.toFixed(2)} — > 1.5, évocateur d'atteinte musculaire ou hépatopathie avancée. Corréler CK, LDH.`,
          informed: `Ratio élevé — peut indiquer une atteinte musculaire ou hépatique avancée.`,
          simple: `Ce ratio est élevé. Ça peut venir de l'entraînement intense ou d'un problème de foie.`,
        },
      })[status][mode],
    });
  }

  // ── DFGe classique ──
  if (!isNaN(creat) && creat > 0) {
    const egfr = 142 * Math.pow(Math.min(creat / 0.9, 1), -0.302) * Math.pow(Math.max(creat / 0.9, 1), -1.2) * Math.pow(0.9938, chronoAge);
    const status = egfr >= 90 ? "optimal" : egfr >= 60 ? "normal" : "flag";
    results.push({
      label: "DFGe (CKD-EPI 2021)", value: Math.round(egfr).toString(), unit: "mL/min/1.73m²", status,
      explanation: ({
        optimal: {
          clinical: `DFGe ${Math.round(egfr)} mL/min/1.73m² (CKD-EPI 2021). Fonction rénale conservée. Compatible apport protéique > 1.6 g/kg/j.`,
          informed: `Fonction rénale normale. Important vu ta consommation protéique élevée (~160-170g/j).`,
          simple: `Tes reins fonctionnent parfaitement malgré ta consommation de protéines élevée.`,
        },
        normal: {
          clinical: `DFGe ${Math.round(egfr)} — stade G2. Adapter apport protéique, contrôle protéinurie recommandé.`,
          informed: `Fonction rénale à surveiller — pertinent vu ton apport protéique. Discuter avec ton médecin.`,
          simple: `Tes reins fonctionnent encore bien, mais la marge diminue.`,
        },
        flag: {
          clinical: `DFGe ${Math.round(egfr)} — stade ≥ G3. Réduire apport protéique, bilan néphrologique urgent.`,
          informed: `Fonction rénale significativement altérée. Consultation néphrologique recommandée.`,
          simple: `Tes reins montrent des signes de fatigue. Consulte un spécialiste rapidement.`,
        },
      })[status][mode],
    });

    // ── DFGe corrigé FFM ──
    if (physiometrics) {
      const ffm = physiometrics.fatFreeMass;
      const bsa = 0.007184 * Math.pow(physiometrics.height, 0.725) * Math.pow(physiometrics.weight, 0.425);
      const egfrAbs = egfr * bsa / 1.73;
      const egfrPerFFM = egfrAbs / ffm * 60;
      const ffmStatus = egfrPerFFM >= 1.5 ? "optimal" : egfrPerFFM >= 1.0 ? "normal" : "flag";
      results.push({
        label: "DFGe / FFM", value: egfrPerFFM.toFixed(1), unit: "mL/min/kg FFM", status: ffmStatus,
        explanation: ({
          optimal: {
            clinical: `DFGe normalisé par masse maigre (${ffm} kg) = ${egfrPerFFM.toFixed(1)} mL/min/kg FFM. La créatinine est produite par le muscle — ton DFGe classique sous-estime potentiellement ta fonction rénale réelle (SMM 41 kg, biais musculaire).`,
            informed: `DFGe ajusté à ta masse musculaire : ${egfrPerFFM.toFixed(1)} mL/min/kg FFM. Comme tu as beaucoup de muscle (41 kg), ta créatinine est naturellement plus haute, ce qui fausse le DFGe classique vers le bas. La version corrigée est rassurante.`,
            simple: `Quand on tient compte de ta masse musculaire, tes reins fonctionnent encore mieux que ce que le calcul standard dit. Bonne nouvelle.`,
          },
          normal: {
            clinical: `DFGe/FFM ${egfrPerFFM.toFixed(1)} — ajustement pour masse maigre de ${ffm} kg. La correction musculaire ne change pas significativement l'interprétation.`,
            informed: `DFGe ajusté à ${egfrPerFFM.toFixed(1)} mL/min/kg FFM. La correction par masse musculaire ne change pas beaucoup le tableau.`,
            simple: `Même en corrigeant pour ta masse musculaire, tes reins restent dans la même zone.`,
          },
          flag: {
            clinical: `DFGe/FFM ${egfrPerFFM.toFixed(1)} — même après correction musculaire, la filtration rénale est insuffisante. Le biais musculaire n'explique pas le DFGe bas.`,
            informed: `Même en corrigeant pour ta masse musculaire, la fonction rénale reste préoccupante.`,
            simple: `Le problème rénal n'est pas dû à ta masse musculaire. Consulte un spécialiste.`,
          },
        })[ffmStatus][mode],
      });
    }
  }

  return results;
}

// ─── CROSS-REFERENCES ───────────────────────────────────────────────────────

export function computeCrossRefs(values, mode, adjustedVo2max) {
  const refs = [];
  const testo = parseFloat(values.testosterone);
  const ins = parseFloat(values.insulin);
  const g = parseFloat(values.glucose);
  const tg = parseFloat(values.triglycerides);
  const hdl = parseFloat(values.hdl);
  const ferr = parseFloat(values.ferritin);
  const vitD = parseFloat(values.vitD);
  const ggt = parseFloat(values.ggt);
  const crp = parseFloat(values.crp);
  const tsh = parseFloat(values.tsh);
  const hba1c = parseFloat(values.hba1c);
  const alt = parseFloat(values.alt);

  // ── Testostérone × Masse maigre ──
  if (!isNaN(testo)) {
    const status = testo >= 500 ? "optimal" : testo >= 350 ? "normal" : "flag";
    const texts = {
      optimal: {
        clinical: `Testostérone totale ${Math.round(testo)} ng/dL — quartile supérieur fonctionnel. LMI 19.6 non limité par l'axe gonadotrope. Potentiel anabolique préservé.`,
        informed: `Testo à ${Math.round(testo)} ng/dL — favorable pour la recomp. Ton LMI de 19.6 kg/m² n'est pas limité par ta testostérone. Le levier reste l'entraînement et les protéines.`,
        simple: `Ta testostérone est à un bon niveau pour construire du muscle. C'est l'entraînement et l'alimentation qui feront la différence.`,
      },
      normal: {
        clinical: `Testostérone totale ${Math.round(testo)} ng/dL — tercile inférieur. Contribution possible au LMI 19.6. Investiguer SHBG, testo libre, LH/FSH.`,
        informed: `Testo à ${Math.round(testo)} ng/dL — fonctionnelle mais sous-optimale. Vitamine D, sommeil et stress sont les premiers leviers.`,
        simple: `Ta testostérone est dans la norme mais pourrait être plus haute. Le sommeil et le stress sont les premiers leviers.`,
      },
      flag: {
        clinical: `Testostérone totale ${Math.round(testo)} ng/dL — hypogonadisme biochimique. Frein direct synthèse protéique. Bilan : SHBG, testo libre, LH, FSH, prolactine, cortisol 8h.`,
        informed: `Testo à ${Math.round(testo)} ng/dL — significativement basse. Frein direct au gain musculaire. Consultation endocrinologique recommandée.`,
        simple: `Ta testostérone est trop basse. Ça freine ta capacité à gagner du muscle. Consulte un spécialiste.`,
      },
    };
    refs.push({ title: "Testostérone × Masse maigre", icon: "⚡", status, content: texts[status][mode] });
  }

  // ── Insuline × CPET ──
  if (!isNaN(ins) && !isNaN(g)) {
    const homa = (g * ins) / 405;
    const status = homa < 1.5 ? "optimal" : homa < 2.5 ? "normal" : "flag";
    const texts = {
      optimal: {
        clinical: `HOMA-IR ${homa.toFixed(2)} concordant avec RQ 0.71. Flexibilité métabolique confirmée : β-oxydation dominante 83%, insulinosensibilité hépatique préservée. FATmax @ 121 bpm calibré.`,
        informed: `HOMA-IR de ${homa.toFixed(2)} confirme ton RQ de 0.71 : excellente flexibilité métabolique. Lipides 83% au repos, insuline sanguine le confirme. Zone 2 @ 121 bpm bien calibrée.`,
        simple: `Ton corps brûle très efficacement les graisses au repos. Les analyses sanguines confirment le test d'effort.`,
      },
      normal: {
        clinical: `HOMA-IR ${homa.toFixed(2)} — discordance partielle avec RQ 0.71. Oxydation lipidique préservée mais insulinosensibilité intermédiaire. Piste : résistance hépatique isolée.`,
        informed: `HOMA-IR de ${homa.toFixed(2)} — décalage avec ton RQ de 0.71. Piste : augmenter Zone 2 et surveiller les pics glycémiques post-prandiaux.`,
        simple: `Ton métabolisme au repos est bon, mais ta gestion du sucre pourrait être meilleure. Plus d'endurance douce peut aider.`,
      },
      flag: {
        clinical: `HOMA-IR ${homa.toFixed(2)} — résistance franche, discordante avec RQ 0.71. Hypothèse : résistance hépatique avec flexibilité musculaire préservée. HGPO, peptide C, écho hépatique.`,
        informed: `HOMA-IR de ${homa.toFixed(2)} — résistance à l'insuline malgré bon profil d'oxydation lipidique. Contradiction à explorer.`,
        simple: `Ton corps a du mal à gérer le sucre, même s'il brûle bien les graisses. Signal important à explorer.`,
      },
    };
    refs.push({ title: "Insuline × Profil métabolique CPET", icon: "🔬", status, content: texts[status][mode] });
  }

  // ── GGT × Abstinence ──
  if (!isNaN(ggt)) {
    const status = ggt <= 20 ? "optimal" : ggt <= 40 ? "normal" : "flag";
    const texts = {
      optimal: {
        clinical: `GGT ${Math.round(ggt)} U/L — normalisation post-abstinence 12 sem. Pas de cholestase, stéatose improbable.`,
        informed: `GGT à ${Math.round(ggt)} U/L — nettoyage hépatique complet. 12 semaines sans alcool ont porté leurs fruits.`,
        simple: `Ton foie est en pleine forme. Les 12 semaines sans alcool ont bien fonctionné.`,
      },
      normal: {
        clinical: `GGT ${Math.round(ggt)} U/L — norme mais > seuil optimal (< 20). Considérer : stéatose infraclinique, inducteurs enzymatiques, graisse viscérale (244 cm³).`,
        informed: `GGT à ${Math.round(ggt)} U/L — dans la norme mais pas au plancher. D'autres facteurs (médicaments, graisses viscérales) peuvent maintenir les GGT.`,
        simple: `Ton foie va bien mais n'est pas encore au top. D'autres facteurs que l'alcool influencent ce marqueur.`,
      },
      flag: {
        clinical: `GGT ${Math.round(ggt)} U/L — persistance malgré abstinence. DDx : NAFLD/NASH, cholestase, hépatotoxiques. Écho hépatique recommandée.`,
        informed: `GGT à ${Math.round(ggt)} U/L — encore élevées malgré 12 semaines d'abstinence. Autres causes à explorer.`,
        simple: `Ton foie montre encore des signes de stress malgré l'arrêt de l'alcool. Ton médecin peut investiguer.`,
      },
    };
    refs.push({ title: "GGT × 12 semaines sans alcool", icon: "🫀", status, content: texts[status][mode] });
  }

  // ── Ferritine × Activité ──
  if (!isNaN(ferr)) {
    const status = ferr >= 50 && ferr <= 200 ? "optimal" : ferr >= 30 ? "normal" : "flag";
    const vo2L = adjustedVo2max ? adjustedVo2max.toFixed(1) : "40.5";
    const texts = {
      optimal: {
        clinical: `Ferritine ${Math.round(ferr)} ng/mL — réserves martiales adéquates. Transport O₂ non limitant pour VO₂max ${vo2L}.`,
        informed: `Ferritine à ${Math.round(ferr)} ng/mL — réserves adéquates pour ta double charge. VO₂max et oxydation lipidique non limités par le fer.`,
        simple: `Tes réserves de fer sont bonnes pour ton niveau d'activité.`,
      },
      normal: {
        clinical: `Ferritine ${Math.round(ferr)} ng/mL — zone grise fonctionnelle. Impact potentiel sur VO₂max ${vo2L} via transport O₂. Fer héminique à renforcer.`,
        informed: `Ferritine à ${Math.round(ferr)} ng/mL — sous-optimale pour ta dépense. Ton VO₂max de ${vo2L} pourrait être freiné. Fer alimentaire à renforcer.`,
        simple: `Tes réserves de fer sont un peu justes. Plus de viande rouge ou de légumineuses pourrait aider.`,
      },
      flag: {
        clinical: `Ferritine ${Math.round(ferr)} ng/mL — déplétion. Facteur limitant érythropoïèse et VO₂max. Bilan martial complet + supplémentation.`,
        informed: `Ferritine à ${Math.round(ferr)} ng/mL — déplétion significative. Facteur limitant direct. Supplémentation à discuter.`,
        simple: `Tes réserves de fer sont trop basses. Ça freine tes performances. Ton médecin peut te supplémenter.`,
      },
    };
    refs.push({ title: "Ferritine × Double charge physique", icon: "🏗️", status, content: texts[status][mode] });
  }

  // ── Ferritine × CRP (faux négatif) ──
  if (!isNaN(ferr) && !isNaN(crp)) {
    const masked = crp > 1.0 && ferr < 100 && ferr >= 30;
    const status = !masked && ferr >= 50 ? "optimal" : masked ? "flag" : "normal";
    const texts = {
      optimal: {
        clinical: `Ferritine ${Math.round(ferr)} ng/mL avec CRP ${crp.toFixed(1)} mg/L — pas de biais inflammatoire. La ferritine reflète fidèlement les réserves martiales. Pas de faux négatif.`,
        informed: `Ferritine à ${Math.round(ferr)} et CRP basse — ta ferritine est fiable, pas gonflée par l'inflammation.`,
        simple: `Tes réserves de fer sont fiables. L'inflammation ne fausse pas le résultat.`,
      },
      normal: {
        clinical: `Ferritine ${Math.round(ferr)} ng/mL, CRP ${crp.toFixed(1)} mg/L — interprétation standard sans biais majeur identifié.`,
        informed: `Ferritine et CRP sans interaction particulière à signaler.`,
        simple: `Rien de spécial à noter entre le fer et l'inflammation.`,
      },
      flag: {
        clinical: `⚠ Ferritine ${Math.round(ferr)} ng/mL possiblement gonflée par l'inflammation (CRP ${crp.toFixed(1)} mg/L). La ferritine est un réactif de phase aiguë — réserves réelles potentiellement < ${Math.round(ferr)} ng/mL. Demander récepteur soluble de la transferrine (sTfR) pour lever l'ambiguïté.`,
        informed: `⚠ Attention : ta ferritine à ${Math.round(ferr)} pourrait être artificiellement gonflée par l'inflammation (CRP à ${crp.toFixed(1)}). La ferritine monte quand le corps est inflammé, masquant une possible carence. Dosage du sTfR recommandé.`,
        simple: `⚠ Alerte : ton fer semble correct mais l'inflammation dans ton corps peut fausser ce résultat à la hausse. Tes vraies réserves pourraient être plus basses. Demande un test complémentaire.`,
      },
    };
    refs.push({ title: "Ferritine × CRP (biais inflammatoire)", icon: "🔎", status, content: texts[status][mode] });
  }

  // ── Vitamine D × Performance ──
  if (!isNaN(vitD)) {
    const status = vitD >= 40 ? "optimal" : vitD >= 30 ? "normal" : "flag";
    const texts = {
      optimal: {
        clinical: `25(OH)D ${Math.round(vitD)} ng/mL — suffisance (optimal 40-60). Pas de limitation neuromusculaire, immunité innée, ou axe gonadotrope.`,
        informed: `Vitamine D à ${Math.round(vitD)} ng/mL — suffisante. Pas de frein sur muscles, testostérone, ou immunité.`,
        simple: `Ta vitamine D est à un bon niveau pour muscles, os et défenses immunitaires.`,
      },
      normal: {
        clinical: `25(OH)D ${Math.round(vitD)} ng/mL — suffisance marginale. Sous-optimal pour fonction neuromusculaire. Supplémentation 2000-4000 UI/j.`,
        informed: `Vitamine D à ${Math.round(vitD)} ng/mL — juste suffisante. À Lisbonne, c'est surprenant. Monter vers 40-60 ng/mL serait bénéfique.`,
        simple: `Ta vitamine D est un peu juste. Un complément pourrait t'aider.`,
      },
      flag: {
        clinical: `25(OH)D ${Math.round(vitD)} ng/mL — insuffisance. Impact sur force musculaire, immunité, métabolisme phosphocalcique. 4000 UI/j.`,
        informed: `Vitamine D à ${Math.round(vitD)} ng/mL — insuffisance franche. Supplémentation recommandée (2000-4000 UI/jour).`,
        simple: `Ta vitamine D est trop basse. Un complément est recommandé.`,
      },
    };
    refs.push({ title: "Vitamine D × Performance & Hormones", icon: "☀️", status, content: texts[status][mode] });
  }

  // ── CRP × Entraînement ──
  if (!isNaN(crp)) {
    const status = crp < 1.0 ? "optimal" : crp < 3.0 ? "normal" : "flag";
    const texts = {
      optimal: {
        clinical: `CRP-us ${crp.toFixed(1)} mg/L — pas d'inflammation systémique. RMSSD 45 ms concordant. Charge bien tolérée.`,
        informed: `PCR à ${crp.toFixed(1)} mg/L — pas d'inflammation. Entraînement bien toléré. Cohérent avec ton RMSSD de 45 ms.`,
        simple: `Pas d'inflammation. Ton entraînement est bien dosé et ta récupération est bonne.`,
      },
      normal: {
        clinical: `CRP-us ${crp.toFixed(1)} mg/L — inflammation de bas grade. Étiologies : tissu adipeux viscéral (244 cm³), surentraînement, infection subclinique.`,
        informed: `PCR à ${crp.toFixed(1)} mg/L — légère élévation. Peut refléter charge physique ou graisse viscérale. À surveiller.`,
        simple: `Un peu d'inflammation. Ça peut venir de l'entraînement ou du gras abdominal. Rien d'alarmant.`,
      },
      flag: {
        clinical: `CRP-us ${crp.toFixed(1)} mg/L — inflammation significative. DDx : infection, auto-immunité, surentraînement, NAFLD.`,
        informed: `PCR à ${crp.toFixed(1)} mg/L — inflammation significative. Plusieurs hypothèses à investiguer.`,
        simple: `L'inflammation est élevée. Parle-en avec ton médecin pour trouver l'origine.`,
      },
    };
    refs.push({ title: "PCR × Entraînement & Récupération", icon: "🔥", status, content: texts[status][mode] });
  }

  // ── TSH × Métabolisme ──
  if (!isNaN(tsh)) {
    const status = tsh >= 0.5 && tsh <= 2.5 ? "optimal" : tsh >= 0.27 && tsh <= 4.2 ? "normal" : "flag";
    const texts = {
      optimal: {
        clinical: `TSH ${tsh.toFixed(2)} — euthyroïdie. REE -1% du prédit (2008 vs 2036 kcal/j) concordant. Pas de frein thyroïdien.`,
        informed: `TSH à ${tsh.toFixed(2)} — thyroïde optimale. Cohérent avec ton REE mesuré. Pas de frein sur ta perte de gras.`,
        simple: `Ta thyroïde fonctionne parfaitement. Ton métabolisme tourne à plein régime.`,
      },
      normal: {
        clinical: `TSH ${tsh.toFixed(2)} — zone haute. Hypothyroïdie subclinique possible. Contrôle T3L, T4L, anti-TPO si stagnation.`,
        informed: `TSH à ${tsh.toFixed(2)} — en zone haute. Pourrait contribuer à une difficulté à perdre du gras. À recontrôler si stagnation.`,
        simple: `Ta thyroïde fonctionne, mais pas de façon optimale. Possible facteur si tu as du mal à perdre du poids.`,
      },
      flag: {
        clinical: `TSH ${tsh.toFixed(2)} — hors norme. Bilan thyroïdien complet urgent.`,
        informed: `TSH hors norme — impact direct sur métabolisme, composition corporelle et énergie. Bilan recommandé.`,
        simple: `Ta thyroïde ne fonctionne pas normalement. Consulte rapidement.`,
      },
    };
    refs.push({ title: "TSH × Métabolisme de repos", icon: "⚙️", status, content: texts[status][mode] });
  }

  // ── HbA1c × Glycémie discordance ──
  if (!isNaN(hba1c) && !isNaN(g)) {
    const expectedHba1c = (g + 46.7) / 28.7;
    const delta = hba1c - expectedHba1c;
    const discordant = Math.abs(delta) > 0.3;
    const status = !discordant ? "optimal" : delta > 0 ? "flag" : "normal";
    const texts = {
      optimal: {
        clinical: `HbA1c ${hba1c}% concordante avec glycémie à jeun ${g} mg/dL (attendue ~${expectedHba1c.toFixed(1)}%, Δ${delta > 0 ? "+" : ""}${delta.toFixed(1)}%). Pas de pics glycémiques post-prandiaux masqués.`,
        informed: `HbA1c à ${hba1c}% et glycémie à ${g} mg/dL sont cohérentes. Pas de signal de pics de sucre cachés après les repas.`,
        simple: `Tes deux indicateurs de sucre concordent. Pas de pics cachés après les repas.`,
      },
      normal: {
        clinical: `HbA1c ${hba1c}% plus basse qu'attendue pour glycémie ${g} mg/dL (Δ${delta.toFixed(1)}%). Possible : turnover érythrocytaire accéléré, anémie ferriprive. Vérifier réticulocytes.`,
        informed: `HbA1c à ${hba1c}% plus basse que prévu pour ta glycémie de ${g}. Ça peut venir d'un renouvellement rapide des globules rouges (lié à l'activité physique).`,
        simple: `Ton HbA1c est un peu basse par rapport à ta glycémie. C'est probablement lié à ton activité physique intense.`,
      },
      flag: {
        clinical: `⚠ HbA1c ${hba1c}% plus haute qu'attendue pour glycémie ${g} mg/dL (Δ+${delta.toFixed(1)}%). Signal de variabilité glycémique : pics post-prandiaux probables malgré glycémie à jeun normale. Considérer CGM (Freestyle Libre) pour objectiver.`,
        informed: `⚠ HbA1c à ${hba1c}% plus haute qu'attendu pour ta glycémie de ${g}. Ça signifie probablement que ton sucre monte trop après les repas, même si le matin à jeun c'est bon. Un capteur de glycémie continu (Libre) pourrait objectiver ça.`,
        simple: `⚠ Alerte : ta glycémie du matin est bonne, mais ton HbA1c suggère que le sucre monte trop après les repas. Un capteur de glycémie pourrait te montrer quand ça se passe.`,
      },
    };
    refs.push({ title: "HbA1c × Glycémie (discordance)", icon: "📊", status, content: texts[status][mode] });
  }

  // ── Triplet stéatose (GGT × Ferritine × HOMA-IR) ──
  if (!isNaN(ggt) && !isNaN(ferr) && !isNaN(g) && !isNaN(ins)) {
    const homa = (g * ins) / 405;
    const ggtHigh = ggt > 30;
    const ferrHigh = ferr > 200;
    const homaHigh = homa > 2.0;
    const score = (ggtHigh ? 1 : 0) + (ferrHigh ? 1 : 0) + (homaHigh ? 1 : 0);
    const status = score === 0 ? "optimal" : score === 1 ? "normal" : "flag";
    const texts = {
      optimal: {
        clinical: `Triplet stéatose négatif : GGT ${Math.round(ggt)}, ferritine ${Math.round(ferr)}, HOMA-IR ${homa.toFixed(2)}. Aucun des trois marqueurs ne suggère une stéatose hépatique. FLI (Fatty Liver Index) estimé faible.`,
        informed: `Les trois marqueurs de la stéatose hépatique (GGT, ferritine, HOMA-IR) sont tous normaux. Pas de surcharge graisseuse du foie détectable.`,
        simple: `Les trois indicateurs de "foie gras" sont au vert. Ton foie n'est pas surchargé en graisse.`,
      },
      normal: {
        clinical: `Triplet stéatose : 1/3 marqueur positif (GGT ${Math.round(ggt)}, ferritine ${Math.round(ferr)}, HOMA-IR ${homa.toFixed(2)}). Stéatose infraclinique possible. Échographie hépatique si persistant au prochain bilan.`,
        informed: `Un des trois marqueurs de stéatose est légèrement élevé. Signal faible — à recontrôler au prochain bilan.`,
        simple: `Un indicateur sur trois est un peu élevé pour le foie. Pas inquiétant mais à surveiller.`,
      },
      flag: {
        clinical: `⚠ Triplet stéatose positif (${score}/3) : GGT ${Math.round(ggt)}, ferritine ${Math.round(ferr)}, HOMA-IR ${homa.toFixed(2)}. Forte suspicion de NAFLD. Échographie hépatique + FibroScan recommandés. Graisse viscérale 244 cm³ comme facteur contributif.`,
        informed: `⚠ Plusieurs marqueurs convergent vers une stéatose hépatique (foie gras) : GGT élevées, ferritine haute, et résistance à l'insuline. Échographie hépatique recommandée.`,
        simple: `⚠ Plusieurs indicateurs pointent vers un "foie gras". Une échographie du foie est recommandée pour confirmer.`,
      },
    };
    refs.push({ title: "Triplet stéatose (GGT × Ferritine × HOMA-IR)", icon: "🔺", status, content: texts[status][mode] });
  }

  // ── Concordance HOMA-IR / TG÷HDL ──
  if (!isNaN(tg) && !isNaN(hdl) && !isNaN(ins) && !isNaN(g)) {
    const homa = (g * ins) / 405;
    const tgHdl = tg / hdl;
    const bothGood = homa < 1.5 && tgHdl < 1.5;
    const discordant = (homa < 1.5) !== (tgHdl < 1.5);
    const status = bothGood ? "optimal" : discordant ? "normal" : (homa >= 2.5 || tgHdl >= 2.5) ? "flag" : "normal";
    const texts = {
      optimal: {
        clinical: `Concordance HOMA-IR (${homa.toFixed(2)}) / TG÷HDL (${tgHdl.toFixed(2)}) — insulinosensibilité confirmée. Corrélation avec RQ 0.71. Profil homogène.`,
        informed: `HOMA-IR ${homa.toFixed(2)} et TG/HDL ${tgHdl.toFixed(2)} concordent. Ta flexibilité métabolique est réelle et se traduit au niveau sanguin.`,
        simple: `Deux indicateurs différents confirment la même chose : ton corps gère très bien le sucre et les graisses.`,
      },
      normal: {
        clinical: `Discordance HOMA-IR (${homa.toFixed(2)}) / TG÷HDL (${tgHdl.toFixed(2)}). HOMA-IR = sensibilité hépatique, TG/HDL = profil lipoprotéique. Discordance fréquente en recomposition.`,
        informed: `Discordance HOMA-IR / TG÷HDL. Les deux ne mesurent pas la même chose. À interpréter en contexte.`,
        simple: `Les indicateurs ne sont pas tout à fait d'accord. C'est fréquent et pas forcément inquiétant.`,
      },
      flag: {
        clinical: `HOMA-IR (${homa.toFixed(2)}) et TG÷HDL (${tgHdl.toFixed(2)}) concordent vers insulinorésistance. Discordant avec RQ 0.71.`,
        informed: `Les deux proxies signalent un profil sous-optimal. Pistes : timing nutritionnel, qualité des glucides, volume de Zone 2.`,
        simple: `Les deux indicateurs pointent vers une mauvaise gestion du sucre. Signal à prendre au sérieux.`,
      },
    };
    refs.push({ title: "Concordance HOMA-IR / TG÷HDL", icon: "🎯", status, content: texts[status][mode] });
  }

  return refs;
}

// ─── SCORES COMPOSITES ──────────────────────────────────────────────────────

export function computeCompositeScores(values, mode, physiometrics) {
  const scores = [];
  const g = parseFloat(values.glucose);
  const ins = parseFloat(values.insulin);
  const tg = parseFloat(values.triglycerides);
  const hdl = parseFloat(values.hdl);
  const crp = parseFloat(values.crp);
  const ferr = parseFloat(values.ferritin);
  const cholTotal = parseFloat(values.cholTotal);

  // ── Score de Flexibilité Métabolique ──
  if (physiometrics && !isNaN(g) && !isNaN(ins) && !isNaN(tg) && !isNaN(hdl)) {
    const homa = (g * ins) / 405;
    const tgHdl = tg / hdl;
    const p = physiometrics;

    // Sub-scores 0-100
    const rqScore = p.rq <= 0.72 ? 100 : p.rq <= 0.78 ? 70 : p.rq <= 0.85 ? 40 : 15;
    const fatOxScore = p.fatOxPct >= 80 ? 100 : p.fatOxPct >= 60 ? 70 : p.fatOxPct >= 40 ? 40 : 15;
    const homaScore = homa < 1.0 ? 100 : homa < 1.5 ? 85 : homa < 2.5 ? 50 : 15;
    const tgHdlScore = tgHdl < 1.0 ? 100 : tgHdl < 1.5 ? 85 : tgHdl < 2.5 ? 50 : 15;
    const fatmaxScore = p.fatmax >= 40 ? 100 : p.fatmax >= 30 ? 75 : p.fatmax >= 20 ? 50 : 25;

    const composite = Math.round((rqScore * 0.25 + fatOxScore * 0.20 + homaScore * 0.25 + tgHdlScore * 0.15 + fatmaxScore * 0.15));
    const status = composite >= 80 ? "optimal" : composite >= 55 ? "normal" : "flag";

    scores.push({
      id: "metflex",
      label: "Flexibilité Métabolique",
      icon: "🔄",
      score: composite,
      status,
      subsScores: [
        { label: "RQ repos", value: rqScore, detail: `${p.rq} (${rqScore}/100)` },
        { label: "% Ox. lipidique", value: fatOxScore, detail: `${p.fatOxPct}% (${fatOxScore}/100)` },
        { label: "HOMA-IR", value: homaScore, detail: `${homa.toFixed(2)} (${homaScore}/100)` },
        { label: "TG/HDL", value: tgHdlScore, detail: `${tgHdl.toFixed(2)} (${tgHdlScore}/100)` },
        { label: "FATmax", value: fatmaxScore, detail: `${p.fatmax} g/h (${fatmaxScore}/100)` },
      ],
      explanation: ({
        optimal: {
          clinical: `Score ${composite}/100 — flexibilité métabolique élevée. Concordance CPET (RQ ${p.rq}, FATmax ${p.fatmax} g/h) et marqueurs sanguins (HOMA-IR ${homa.toFixed(2)}, TG/HDL ${tgHdl.toFixed(2)}). Capacité préservée de switch substrats lipides↔glucides.`,
          informed: `Score ${composite}/100 — ton corps passe facilement du mode "brûle-graisses" au mode "brûle-sucres" selon les besoins. Le test d'effort et les analyses sanguines le confirment.`,
          simple: `Ton corps est très flexible : il brûle les graisses au repos et utilise le sucre à l'effort. C'est un excellent signe global.`,
        },
        normal: {
          clinical: `Score ${composite}/100 — flexibilité intermédiaire. Certains piliers sont sous-optimaux. Augmenter le volume de Zone 2 et la qualité des glucides pour améliorer le score.`,
          informed: `Score ${composite}/100 — ta flexibilité métabolique est correcte mais a une marge de progression. Zone 2 et alimentation sont les leviers principaux.`,
          simple: `Ton corps gère assez bien le passage entre graisses et sucres. Il y a de la marge pour s'améliorer.`,
        },
        flag: {
          clinical: `Score ${composite}/100 — rigidité métabolique. Discordance probable entre les piliers. Investigation métabolique approfondie recommandée.`,
          informed: `Score ${composite}/100 — ta flexibilité métabolique est réduite. Plusieurs leviers à activer en priorité.`,
          simple: `Ton corps a du mal à alterner entre les sources d'énergie. C'est un signal important.`,
        },
      })[status][mode],
    });
  }

  // ── Score de Récupération ──
  if (physiometrics && !isNaN(crp) && !isNaN(ferr)) {
    const p = physiometrics;
    const rmssdScore = p.rmssd >= 50 ? 100 : p.rmssd >= 40 ? 75 : p.rmssd >= 30 ? 50 : 25;
    const hrr1Score = p.hrr1 >= 25 ? 100 : p.hrr1 >= 18 ? 75 : p.hrr1 >= 12 ? 50 : 25;
    const crpScore = crp < 0.5 ? 100 : crp < 1.0 ? 80 : crp < 3.0 ? 40 : 10;
    const ferrScore = ferr >= 80 ? 100 : ferr >= 50 ? 75 : ferr >= 30 ? 40 : 15;

    const composite = Math.round(rmssdScore * 0.30 + hrr1Score * 0.25 + crpScore * 0.25 + ferrScore * 0.20);
    const status = composite >= 75 ? "optimal" : composite >= 50 ? "normal" : "flag";

    scores.push({
      id: "recovery",
      label: "Capacité de Récupération",
      icon: "🛌",
      score: composite,
      status,
      subsScores: [
        { label: "RMSSD", value: rmssdScore, detail: `${p.rmssd} ms (${rmssdScore}/100)` },
        { label: "HRR₁", value: hrr1Score, detail: `${p.hrr1} bpm (${hrr1Score}/100)` },
        { label: "CRP", value: crpScore, detail: `${crp.toFixed(1)} mg/L (${crpScore}/100)` },
        { label: "Ferritine", value: ferrScore, detail: `${Math.round(ferr)} ng/mL (${ferrScore}/100)` },
      ],
      explanation: ({
        optimal: {
          clinical: `Score ${composite}/100 — capacité de récupération élevée. Tonus vagal adéquat (RMSSD ${p.rmssd}), réactivation parasympathique correcte (HRR₁ ${p.hrr1}), inflammation contrôlée, réserves martiales suffisantes.`,
          informed: `Score ${composite}/100 — ta récupération est bonne. Ton système nerveux parasympathique fonctionne bien (RMSSD, HRR₁), pas d'inflammation, fer suffisant.`,
          simple: `Ton corps récupère bien après l'effort. Le système nerveux, l'inflammation et le fer sont tous au vert.`,
        },
        normal: {
          clinical: `Score ${composite}/100 — récupération intermédiaire. Un ou plusieurs piliers sous-optimaux. Prioriser sommeil, gestion du stress, et/ou nutrition.`,
          informed: `Score ${composite}/100 — récupération correcte mais perfectible. Le sommeil et la gestion du stress sont les premiers leviers.`,
          simple: `Ta récupération est correcte mais pourrait être meilleure. Sommeil et stress sont les premiers leviers.`,
        },
        flag: {
          clinical: `Score ${composite}/100 — capacité de récupération réduite. Risque de surentraînement relatif. Réduire la charge et investiguer les piliers défaillants.`,
          informed: `Score ${composite}/100 — récupération insuffisante. Risque de surentraînement. Réduire la charge et corriger les piliers les plus faibles.`,
          simple: `Ton corps a du mal à récupérer. C'est un signal pour lever le pied ou corriger les facteurs limitants.`,
        },
      })[status][mode],
    });
  }

  // ── Score CV simplifié ──
  if (!isNaN(cholTotal) && !isNaN(hdl) && !isNaN(crp) && !isNaN(tg) && physiometrics) {
    const p = physiometrics;
    const nonHdl = cholTotal - hdl;
    const castelli = cholTotal / hdl;
    const vo2Score = p.vo2max >= 45 ? 100 : p.vo2max >= 40 ? 80 : p.vo2max >= 35 ? 55 : 25;
    const castelliScore = castelli < 3.5 ? 100 : castelli < 4.5 ? 70 : castelli < 5.5 ? 40 : 15;
    const nonHdlScore = nonHdl < 130 ? 100 : nonHdl < 160 ? 65 : nonHdl < 190 ? 35 : 10;
    const crpCvScore = crp < 1.0 ? 100 : crp < 3.0 ? 50 : 15;
    const tgScore = tg < 100 ? 100 : tg < 150 ? 70 : tg < 200 ? 40 : 15;
    const hrRestScore = p.hrRest <= 55 ? 100 : p.hrRest <= 65 ? 75 : p.hrRest <= 75 ? 50 : 25;

    const composite = Math.round(vo2Score * 0.20 + castelliScore * 0.20 + nonHdlScore * 0.20 + crpCvScore * 0.15 + tgScore * 0.10 + hrRestScore * 0.15);
    const status = composite >= 75 ? "optimal" : composite >= 50 ? "normal" : "flag";

    scores.push({
      id: "cardio",
      label: "Santé Cardiovasculaire",
      icon: "❤️",
      score: composite,
      status,
      subsScores: [
        { label: "VO₂max", value: vo2Score, detail: `${p.vo2max} (${vo2Score}/100)` },
        { label: "Castelli", value: castelliScore, detail: `${castelli.toFixed(1)} (${castelliScore}/100)` },
        { label: "Non-HDL", value: nonHdlScore, detail: `${Math.round(nonHdl)} mg/dL (${nonHdlScore}/100)` },
        { label: "CRP", value: crpCvScore, detail: `${crp.toFixed(1)} mg/L (${crpCvScore}/100)` },
        { label: "Triglycérides", value: tgScore, detail: `${Math.round(tg)} (${tgScore}/100)` },
        { label: "FC repos", value: hrRestScore, detail: `${p.hrRest} bpm (${hrRestScore}/100)` },
      ],
      explanation: ({
        optimal: {
          clinical: `Score ${composite}/100 — profil CV favorable. VO₂max au-dessus de la moyenne, profil lipidique protecteur, inflammation contrôlée, bradycardie relative.`,
          informed: `Score ${composite}/100 — ton profil cardiovasculaire est bon. Endurance, cholestérol, inflammation et fréquence cardiaque sont tous dans le vert.`,
          simple: `Ton cœur et tes vaisseaux sont en bonne santé. Tous les indicateurs sont favorables.`,
        },
        normal: {
          clinical: `Score ${composite}/100 — risque CV standard. Marge d'optimisation via exercice aérobie et profil lipidique.`,
          informed: `Score ${composite}/100 — santé cardiovasculaire correcte mais perfectible. L'exercice d'endurance et l'alimentation sont les premiers leviers.`,
          simple: `Ton cœur va bien mais il y a de la marge. Plus de cardio et une meilleure alimentation peuvent aider.`,
        },
        flag: {
          clinical: `Score ${composite}/100 — profil CV à risque. Plusieurs piliers défaillants. Bilan cardiologique recommandé.`,
          informed: `Score ${composite}/100 — risque cardiovasculaire augmenté. Consultation cardiologique recommandée.`,
          simple: `Ton profil cardiaque montre des signaux d'alerte. Consulte un cardiologue.`,
        },
      })[status][mode],
    });
  }

  // ── Âge biologique détaillé ──
  if (physiometrics && !isNaN(g) && !isNaN(cholTotal) && !isNaN(crp)) {
    const p = physiometrics;
    const chrono = p.chronoAge;

    const vo2Age = Math.round(chrono - (p.vo2max - 40) * 1.5);
    const bodyAge = Math.round(chrono + (p.bodyFatPct4C - 18) * 0.8);
    const insAge = !isNaN(parseFloat(values.insulin)) ? Math.round(chrono - (1.5 - Math.min((g * parseFloat(values.insulin)) / 405, 3)) * 4) : null;
    const cardioAge = Math.round(chrono - (65 - p.hrRest) * 0.5 + (cholTotal > 190 ? 1 : 0) + (crp > 1 ? 2 : 0));

    const ages = [vo2Age, bodyAge, cardioAge];
    if (insAge !== null) ages.push(insAge);
    const avgBioAge = Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);
    const delta = avgBioAge - chrono;
    const status = delta <= -2 ? "optimal" : delta <= 2 ? "normal" : "flag";

    scores.push({
      id: "bioage",
      label: "Âge Biologique Détaillé",
      icon: "🧬",
      score: Math.max(0, 100 - Math.max(0, avgBioAge - 20) * 2),
      status,
      subsScores: [
        { label: "Cardio-resp.", value: Math.max(0, 100 - (vo2Age - 20) * 2), detail: `${vo2Age} ans` },
        { label: "Composition", value: Math.max(0, 100 - (bodyAge - 20) * 2), detail: `${bodyAge} ans` },
        ...(insAge !== null ? [{ label: "Métabolique", value: Math.max(0, 100 - (insAge - 20) * 2), detail: `${insAge} ans` }] : []),
        { label: "Cardiovasc.", value: Math.max(0, 100 - (cardioAge - 20) * 2), detail: `${cardioAge} ans` },
      ],
      explanation: ({
        optimal: {
          clinical: `Âge bio estimé ${avgBioAge} ans (chrono ${chrono}, Δ${delta > 0 ? "+" : ""}${delta}). Breakdown : cardio-resp. ${vo2Age}, composition ${bodyAge}, ${insAge !== null ? `métabolique ${insAge}, ` : ""}cardiovasc. ${cardioAge}. MetaClinic : bio ${p.bioAge}, concordant.`,
          informed: `Âge biologique estimé à ${avgBioAge} ans (${delta > 0 ? "+" : ""}${delta} vs ${chrono} ans). Ton point fort est le cardio-respiratoire (${vo2Age} ans). La composition corporelle est le principal levier d'amélioration (${bodyAge} ans).`,
          simple: `Ton corps a l'équivalent de ${avgBioAge} ans, soit ${Math.abs(delta)} an${Math.abs(delta) > 1 ? "s" : ""} de ${delta <= 0 ? "moins" : "plus"} que ton âge réel. L'endurance te rajeunit, la composition corporelle peut encore s'améliorer.`,
        },
        normal: {
          clinical: `Âge bio ${avgBioAge} ans ≈ chrono ${chrono} (Δ${delta > 0 ? "+" : ""}${delta}). Pas de décrochage significatif. Marge d'optimisation sur la composition corporelle.`,
          informed: `Âge biologique à ${avgBioAge} ans — proche de ton âge réel. Pas de signal d'alarme, mais de la marge pour gagner des années.`,
          simple: `Ton corps est à peu près à ton âge réel. Il y a de la marge pour le rajeunir.`,
        },
        flag: {
          clinical: `Âge bio ${avgBioAge} ans > chrono ${chrono} (Δ+${delta}). Vieillissement accéléré, principalement porté par ${bodyAge > chrono + 2 ? "composition corporelle" : "facteurs cardiovasculaires"}. Action corrective prioritaire.`,
          informed: `Âge biologique à ${avgBioAge} ans — plus vieux que ton âge réel de ${delta} ans. Facteurs à corriger en priorité identifiés.`,
          simple: `Ton corps vieillit plus vite que la normale. C'est réversible en agissant sur les bons leviers.`,
        },
      })[status][mode],
    });
  }

  return scores;
}

// ─── PERCENTILES ────────────────────────────────────────────────────────────

const PERCENTILE_DATA = {
  glucose: { p10: 76, p25: 82, p50: 89, p75: 97, p90: 105 },
  hba1c: { p10: 4.7, p25: 4.9, p50: 5.2, p75: 5.5, p90: 5.8 },
  insulin: { p10: 2.5, p25: 4.0, p50: 6.5, p75: 10.0, p90: 15.0 },
  cholTotal: { p10: 145, p25: 165, p50: 190, p75: 215, p90: 240 },
  hdl: { p10: 35, p25: 42, p50: 50, p75: 60, p90: 72 },
  ldl: { p10: 70, p25: 90, p50: 115, p75: 140, p90: 165 },
  triglycerides: { p10: 50, p25: 70, p50: 100, p75: 145, p90: 200 },
  alt: { p10: 12, p25: 17, p50: 24, p75: 34, p90: 48 },
  ast: { p10: 14, p25: 18, p50: 23, p75: 30, p90: 38 },
  ggt: { p10: 12, p25: 18, p50: 28, p75: 45, p90: 72 },
  creatinine: { p10: 0.80, p25: 0.90, p50: 1.00, p75: 1.12, p90: 1.25 },
  testosterone: { p10: 280, p25: 370, p50: 500, p75: 650, p90: 800 },
  tsh: { p10: 0.60, p25: 1.00, p50: 1.60, p75: 2.30, p90: 3.20 },
  ferritin: { p10: 30, p25: 60, p50: 120, p75: 200, p90: 300 },
  vitD: { p10: 18, p25: 25, p50: 33, p75: 45, p90: 58 },
  crp: { p10: 0.2, p25: 0.5, p50: 1.2, p75: 2.8, p90: 5.5 },
  iron: { p10: 55, p25: 75, p50: 100, p75: 130, p90: 160 },
  uricAcid: { p10: 3.8, p25: 4.5, p50: 5.5, p75: 6.5, p90: 7.5 },
};

export function getPercentile(markerId, value) {
  const data = PERCENTILE_DATA[markerId];
  if (!data) return null;
  const v = parseFloat(value);
  if (isNaN(v)) return null;

  if (v <= data.p10) return { percentile: Math.round(10 * v / data.p10), label: "P<10" };
  if (v <= data.p25) return { percentile: Math.round(10 + 15 * (v - data.p10) / (data.p25 - data.p10)), label: `P${Math.round(10 + 15 * (v - data.p10) / (data.p25 - data.p10))}` };
  if (v <= data.p50) return { percentile: Math.round(25 + 25 * (v - data.p25) / (data.p50 - data.p25)), label: `P${Math.round(25 + 25 * (v - data.p25) / (data.p50 - data.p25))}` };
  if (v <= data.p75) return { percentile: Math.round(50 + 25 * (v - data.p50) / (data.p75 - data.p50)), label: `P${Math.round(50 + 25 * (v - data.p50) / (data.p75 - data.p50))}` };
  if (v <= data.p90) return { percentile: Math.round(75 + 15 * (v - data.p75) / (data.p90 - data.p75)), label: `P${Math.round(75 + 15 * (v - data.p75) / (data.p90 - data.p75))}` };
  return { percentile: Math.min(99, Math.round(90 + 10 * (v - data.p90) / (data.p90 * 0.3))), label: "P>90" };
}

// ─── PROJECTIONS ────────────────────────────────────────────────────────────

export function computeProjections(history, currentValues) {
  if (!history || history.length < 2) return [];

  const projections = [];
  const allPoints = [...history.map(h => ({ date: h.date, values: h.values }))].reverse();
  allPoints.push({ date: new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }), values: currentValues });

  const markers = Object.keys(currentValues).filter(k => currentValues[k] !== "" && currentValues[k] !== undefined);

  for (const markerId of markers) {
    const points = allPoints
      .map((p, i) => ({ x: i, y: parseFloat(p.values[markerId]) }))
      .filter(p => !isNaN(p.y));

    if (points.length < 2) continue;

    const n = points.length;
    const sumX = points.reduce((a, p) => a + p.x, 0);
    const sumY = points.reduce((a, p) => a + p.y, 0);
    const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
    const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    if (Math.abs(slope) < 0.001) continue;

    const nextValue = slope * (n) + intercept;
    const trend = slope > 0 ? "up" : "down";

    projections.push({
      markerId,
      currentValue: parseFloat(currentValues[markerId]),
      projectedValue: Math.round(nextValue * 100) / 100,
      trend,
      slope: Math.round(slope * 100) / 100,
      dataPoints: points.length,
    });
  }

  return projections.filter(p => Math.abs(p.slope) > 0.01).sort((a, b) => Math.abs(b.slope) - Math.abs(a.slope)).slice(0, 10);
}
