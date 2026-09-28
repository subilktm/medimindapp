/**
 * Reference library of real pediatric dental case patterns with the evidence-based
 * management used in practice (aligned with AAPD / EAPD clinical guidance).
 *
 * The AI summary retrieves the cases that match the charted findings and grounds its
 * treatment plan on them, so recommendations follow documented pediatric practice
 * instead of free-form generation.
 */

export type ToothGroup = "primary" | "permanent" | "any";

export type PedoCase = {
  id: string;
  title: string;
  presentation: string;
  management: string;
  evidence: string;
  match: {
    states?: string[];
    surfaces?: string[];
    group?: ToothGroup;
    minSurfacesOnTooth?: number;
    toothPrefixes?: string[];
  };
};

export const PEDO_CASE_LIBRARY: PedoCase[] = [
  {
    id: "ecc-anterior",
    title: "Early childhood caries of maxillary primary incisors",
    presentation:
      "Child under 6 with cavitated lesions on labial/palatal surfaces of teeth 51-53 / 61-63, usually with night-time bottle or on-demand feeding.",
    management:
      "Diet and feeding counselling for the guardian, 5% sodium fluoride varnish every 3 months, composite strip crowns or glass-ionomer restorations on cavitated incisors, pulpectomy with resorbable paste when the pulp is involved, extraction only when non-restorable.",
    evidence: "AAPD Policy on Early Childhood Caries; Cochrane review of fluoride varnish in primary dentition.",
    match: { states: ["Caries"], group: "primary", toothPrefixes: ["51", "52", "53", "61", "62", "63", "71", "72", "73", "81", "82", "83"] },
  },
  {
    id: "occlusal-caries-primary-molar",
    title: "Occlusal caries in a primary molar (54 / 64 / 74 / 84 pattern)",
    presentation:
      "Single or two-surface cavitated occlusal or occluso-proximal lesion in a primary molar, vital pulp, no swelling or mobility.",
    management:
      "Local anaesthesia with weight-checked articaine/lidocaine, rubber-dam isolation, selective caries removal, composite or glass-ionomer for single-surface lesions; Hall technique or preformed stainless-steel crown for two or more surfaces or undermined cusps.",
    evidence: "FiCTION trial; AAPD Guideline on Restorative Dentistry; Innes Hall technique 5-year outcomes.",
    match: { states: ["Caries"], surfaces: ["Caries"], group: "primary" },
  },
  {
    id: "multi-surface-ssc",
    title: "Multi-surface primary molar caries requiring a stainless-steel crown",
    presentation:
      "Two or more carious surfaces on the same primary molar (e.g. occlusal plus mesial/distal), or caries following pulp therapy.",
    management:
      "Stainless-steel crown after caries removal; if pulp therapy is needed, pulpotomy with ferric sulphate/MTA for reversible pulpitis, pulpectomy for irreversible pulpitis, then SSC in the same visit where cooperation allows.",
    evidence: "AAPD Guideline on Pulp Therapy for Primary and Immature Permanent Teeth.",
    match: { states: ["Caries", "Pulp", "Crown"], group: "primary", minSurfacesOnTooth: 2 },
  },
  {
    id: "pulpitis-primary",
    title: "Irreversible pulpitis / pulp exposure in a primary molar",
    presentation:
      "Spontaneous or night pain, pain score typically 5-9, deep lesion reaching pulp, possibly sinus or increased mobility.",
    management:
      "Same-visit pain control (weight-based paracetamol/ibuprofen), pulpotomy for reversible cases, pulpectomy with resorbable filling for irreversible pulpitis, extraction plus space maintainer if non-restorable; antibiotics only with systemic signs.",
    evidence: "AAPD Pulp Therapy Guideline; AAPD Use of Antibiotic Therapy for Pediatric Dental Patients.",
    match: { states: ["Pulp"], group: "primary" },
  },
  {
    id: "first-permanent-molar-sealant",
    title: "Newly erupted first permanent molar at caries risk (16 / 26 / 36 / 46)",
    presentation: "Deep, stained but non-cavitated pits and fissures in a recently erupted permanent molar of a high-risk child.",
    management:
      "Resin-based fissure sealant after cleaning and isolation, or resin-infiltration/preventive resin restoration for early enamel lesions; 6-monthly sealant review and re-sealing of losses; fluoride varnish at each recall.",
    evidence: "AAPD/ADA Evidence-Based Guideline on Pit-and-Fissure Sealants (2016).",
    match: { states: ["Sealant", "Erupting"], surfaces: ["Sealant"], group: "permanent" },
  },
  {
    id: "erupting-tooth-monitor",
    title: "Erupting or partially erupted tooth",
    presentation: "Tooth marked erupting, gingival cuff over the occlusal table, plaque stagnation and localised gingivitis.",
    management:
      "Oral hygiene coaching with parental brushing until 8 years, chlorhexidine-free plaque control, delay definitive sealant until the fissures are fully accessible, review in 6-8 weeks and seal when erupted; check eruption sequence against chronological age.",
    evidence: "EAPD Guideline on Prevention of Early Childhood Caries; AAPD Periodicity of Examination.",
    match: { states: ["Erupting"] },
  },
  {
    id: "anterior-trauma-fracture",
    title: "Crown fracture / trauma of an anterior tooth",
    presentation: "Buccal or incisal fracture on tooth 11/21 or a primary incisor after a fall, with or without pulp exposure.",
    management:
      "Trauma history including tetanus status, pulp sensibility and percussion tests, periapical radiograph; enamel-dentine fracture restored with composite, exposed pulp managed with partial pulpotomy (Cvek) in immature permanent teeth; splint luxation injuries and review at 2, 4, 8 weeks, 6 months and 1 year.",
    evidence: "International Association of Dental Traumatology (IADT) guidelines for fractured and luxated teeth.",
    match: { states: ["Trauma"], surfaces: ["Fracture"] },
  },
  {
    id: "missing-tooth-space",
    title: "Missing or extracted primary tooth and space management",
    presentation: "Primary molar or incisor absent from the arch before the normal exfoliation age.",
    management:
      "Assess space loss and successor development radiographically; band-and-loop for a single lost primary molar, lingual arch or distal shoe as indicated; no space maintainer for incisors purely aesthetic; review every 6 months until successor eruption.",
    evidence: "AAPD Guideline on Management of the Developing Dentition.",
    match: { states: ["Missing"], surfaces: ["Missing"] },
  },
  {
    id: "restored-recall",
    title: "Previously restored tooth under review",
    presentation: "Existing composite, glass-ionomer or crown restoration with intact or questionable margins.",
    management:
      "Check margins, proximal contacts and radiographic secondary caries; repair rather than replace where possible; reinforce fluoride toothpaste 1000-1450 ppm twice daily and reduce between-meal sugar frequency.",
    evidence: "AAPD Restorative Dentistry Guideline; minimally invasive dentistry consensus.",
    match: { states: ["Restored", "Crown"], surfaces: ["Restoration"] },
  },
  {
    id: "high-risk-prevention",
    title: "High caries-risk child preventive protocol",
    presentation: "Caries-risk score in the high band, visible plaque, frequent sugar exposure, previous restorations or active lesions.",
    management:
      "3-monthly recall, 22,600 ppm fluoride varnish at each visit, 1450 ppm toothpaste with parental supervised brushing twice daily, sealants on all permanent molars, diet diary review, consider silver diamine fluoride for non-cooperative or arrest-only cases.",
    evidence: "AAPD Caries-Risk Assessment Tool (CAT); AAPD Chairside Guide on Silver Diamine Fluoride.",
    match: { states: ["Caries", "Pulp"], surfaces: ["Caries"] },
  },
];

function group(tooth: string): ToothGroup {
  const value = Number(tooth);
  if (!Number.isFinite(value)) return "any";
  return value >= 51 ? "primary" : "permanent";
}

export type RetrievalFinding = { tooth: string; toothState: string; surfaces: Record<string, string> };

/** Returns the case references that match the charted findings, most specific first. */
export function retrievePedoCases(findings: RetrievalFinding[], limit = 6): PedoCase[] {
  return matchPedoCases(PEDO_CASE_LIBRARY, findings, limit);
}

/**
 * Scores any case collection (built-in library or clinician-uploaded cases) against
 * the charted findings and returns the closest matches first.
 */
export function matchPedoCases(library: PedoCase[], findings: RetrievalFinding[], limit = 6): PedoCase[] {
  const scored = library.map((entry) => {
    let score = 0;
    for (const finding of findings) {
      const surfaceValues = Object.values(finding.surfaces);
      const toothGroup = group(finding.tooth);
      if (entry.match.group && entry.match.group !== "any" && entry.match.group !== toothGroup) continue;
      if (entry.match.toothPrefixes && !entry.match.toothPrefixes.includes(finding.tooth)) continue;
      if (entry.match.minSurfacesOnTooth && surfaceValues.length < entry.match.minSurfacesOnTooth) continue;
      if (entry.match.states?.includes(finding.toothState)) score += 2;
      if (entry.match.surfaces?.some((value) => surfaceValues.includes(value))) score += 2;
      if (entry.match.minSurfacesOnTooth && surfaceValues.length >= entry.match.minSurfacesOnTooth) score += 1;
    }
    return { entry, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((row) => row.entry);
}

export function formatPedoCases(cases: PedoCase[]): string {
  return cases
    .map(
      (entry, index) =>
        `Case ${index + 1}: ${entry.title}\n  Typical presentation: ${entry.presentation}\n  Evidence-based management: ${entry.management}\n  Source: ${entry.evidence}`,
    )
    .join("\n");
}
