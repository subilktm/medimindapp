import emmaPhoto from "@/assets/patient-emma-thompson.jpg";
import marcusPhoto from "@/assets/patient-marcus-vance.jpg";
import elenaPhoto from "@/assets/patient-elena-rodriguez.jpg";

export type PatientDiagnosis = {
  condition: string;
  code: string;
  status: "Active" | "Resolved";
  onset: string;
  clinician: string;
};

export type ClinicalEncounter = {
  id: string;
  number: string;
  occurredAt: string;
  type: "Inpatient" | "Outpatient" | "Emergency" | "Dental";
  department: string;
  clinician: string;
  status: "Active" | "Completed" | "Discharged";
  chiefComplaint: string;
  summary: string;
  diagnoses: string[];
  observations: string[];
  clinicalNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  orders: Array<{ name: string; status: "Completed" | "Pending" | "Ordered" }>;
  medications: string[];
  disposition: string;
  followUp: string;
};

export type PatientMedication = {
  id: string;
  name: string;
  strength: string;
  form: string;
  route: string;
  frequency: string;
  status: "Active" | "PRN" | "Held" | "Completed";
  indication: string;
  prescribedBy: string;
  startedAt: string;
  lastAdministered: string;
  nextDue: string;
  monitoring: string;
  holdCriteria: string;
  safetyNote: string;
};

export type ClinicalHistory = {
  pastMedical: Array<{ condition: string; since: string; status: "Ongoing" | "Controlled" | "Resolved"; notes: string }>;
  surgical: Array<{ procedure: string; date: string; facility: string; notes: string }>;
  family: Array<{ relation: string; condition: string; onset: string; significant: boolean }>;
  social: Array<{ label: string; value: string; flag?: boolean }>;
  immunizations: Array<{ vaccine: string; date: string; status: "Up to date" | "Due" | "Completed series" }>;
  allergyDetails: Array<{ allergen: string; reaction: string; severity: "Mild" | "Moderate" | "Severe" | "None"; recorded: string }>;
  screening: Array<{ name: string; result: string; date: string }>;
};

export type ClinicalPatient = {
  id: string;
  name: string;
  initials: string;
  photo: string;
  sex: "Female" | "Male";
  age: number;
  mrn: string;
  dob: string;
  bloodGroup: string;
  mobile: string;
  status: string;
  diagnosis: string;
  diagnoses: PatientDiagnosis[];
  nextAction: string;
  room: string;
  allergies: string[];
  risks: string[];
  encounter: {
    number: string;
    type: string;
    admitted: string;
    ward: string;
    consultant: string;
    complaint: string;
  };
  encounters: ClinicalEncounter[];
  medications: PatientMedication[];
  history: ClinicalHistory;
  vitals: Array<{ label: string; value: string; unit: string }>;
};

export const CLINICAL_PATIENTS: ClinicalPatient[] = [
  {
    id: "92031",
    name: "Emma Thompson",
    initials: "ET",
    photo: emmaPhoto,
    sex: "Female",
    age: 42,
    mrn: "MM-92031",
    dob: "14 May 1984",
    bloodGroup: "O+",
    mobile: "+971 50 234 8102",
    status: "Stable",
    diagnosis: "Post-op recovery",
    diagnoses: [
      { condition: "Post-operative pain", code: "G89.18", status: "Active", onset: "15 Sep 2026", clinician: "Dr. Lena Hart" },
      { condition: "Essential hypertension", code: "I10", status: "Active", onset: "03 Mar 2021", clinician: "Dr. Lena Hart" },
      { condition: "Dyslipidemia", code: "E78.5", status: "Active", onset: "12 Nov 2022", clinician: "Dr. Lena Hart" },
    ],
    nextAction: "Pain assessment",
    room: "C-214",
    allergies: ["Penicillin"],
    risks: ["Fall risk: moderate", "Hypertension"],
    encounter: {
      number: "IP-2026-0915-008",
      type: "Inpatient",
      admitted: "15 Sep 2026, 09:20 AM",
      ward: "Cardiology",
      consultant: "Dr. Lena Hart",
      complaint: "Chest discomfort and shortness of breath",
    },
    encounters: [
      {
        id: "enc-emma-0915",
        number: "IP-2026-0915-008",
        occurredAt: "15 Sep 2026, 09:20 AM",
        type: "Inpatient",
        department: "Cardiology",
        clinician: "Dr. Lena Hart",
        status: "Active",
        chiefComplaint: "Chest discomfort and shortness of breath",
        summary: "Admitted for monitored recovery after cardiac catheterisation. Pain is improving, observations are stable and the puncture site remains clean.",
        diagnoses: ["Post-operative pain (G89.18)", "Essential hypertension (I10)", "Dyslipidemia (E78.5)"],
        observations: ["BP 138/86 mmHg", "Pulse 88 bpm", "SpO₂ 97%", "Pain 4/10"],
        clinicalNote: {
          subjective: "Reports mild central discomfort on movement and no pain at rest. Denies dizziness, palpitations or worsening breathlessness.",
          objective: "Alert and comfortable at rest. Cardiovascular observations stable. Right radial access site clean, dry and neurovascularly intact.",
          assessment: "Expected post-procedural discomfort with no current evidence of access-site complication or acute cardiac instability.",
          plan: "Continue telemetry, reassess pain after analgesia, review pending troponin and encourage assisted mobilisation.",
        },
        orders: [{ name: "ECG 12 Lead", status: "Completed" }, { name: "Troponin I", status: "Pending" }, { name: "Lipid profile", status: "Ordered" }],
        medications: ["Aspirin 75 mg once daily", "Amlodipine 5 mg once daily", "Paracetamol 500 mg when required"],
        disposition: "Continue inpatient cardiology observation in room C-214.",
        followUp: "Cardiology review on 25 Sep 2026 at 10:00 AM.",
      },
      {
        id: "enc-emma-0827",
        number: "OP-2026-0827-116",
        occurredAt: "27 Aug 2026, 02:15 PM",
        type: "Outpatient",
        department: "Cardiology clinic",
        clinician: "Dr. Lena Hart",
        status: "Completed",
        chiefComplaint: "Intermittent exertional chest pressure",
        summary: "Reviewed recurrent exertional symptoms. ECG was unchanged; elective coronary angiography was planned after shared decision-making.",
        diagnoses: ["Chest pain, unspecified (R07.9)", "Essential hypertension (I10)"],
        observations: ["BP 146/88 mmHg", "Pulse 82 bpm", "SpO₂ 98%"],
        clinicalNote: {
          subjective: "Two weeks of chest pressure when climbing stairs, relieved within five minutes of rest. No syncope or rest pain.",
          objective: "Regular pulse, clear chest and no peripheral oedema. Resting ECG without acute ischaemic change.",
          assessment: "Stable exertional symptoms requiring anatomical assessment; blood pressure above target.",
          plan: "Arrange elective angiography, continue aspirin and amlodipine, and provide emergency symptom advice.",
        },
        orders: [{ name: "Coronary angiography", status: "Completed" }, { name: "Renal profile", status: "Completed" }],
        medications: ["Continue Aspirin 75 mg once daily", "Continue Amlodipine 5 mg once daily"],
        disposition: "Discharged home after consultation.",
        followUp: "Return for planned angiography on 15 Sep 2026.",
      },
      {
        id: "enc-emma-0512",
        number: "OP-2026-0512-064",
        occurredAt: "12 May 2026, 11:30 AM",
        type: "Outpatient",
        department: "Internal medicine",
        clinician: "Dr. Nabil Rahman",
        status: "Completed",
        chiefComplaint: "Routine hypertension review",
        summary: "Routine chronic-disease review found acceptable home readings and elevated LDL cholesterol without treatment complications.",
        diagnoses: ["Essential hypertension (I10)", "Dyslipidemia (E78.5)"],
        observations: ["BP 134/84 mmHg", "Pulse 78 bpm", "Weight 71 kg"],
        clinicalNote: {
          subjective: "Taking medication consistently. No headache, ankle swelling or postural symptoms.",
          objective: "Clinic blood pressure close to target; cardiovascular and respiratory examinations unremarkable.",
          assessment: "Hypertension controlled on current therapy. Dyslipidemia requires repeat assessment.",
          plan: "Continue current therapy, reinforce diet and activity advice, and repeat fasting lipid profile.",
        },
        orders: [{ name: "Fasting lipid profile", status: "Completed" }],
        medications: ["Amlodipine 5 mg once daily"],
        disposition: "Routine outpatient discharge.",
        followUp: "Review in three months with home blood-pressure log.",
      },
    ],
    medications: [
      {
        id: "med-emma-aspirin",
        name: "Aspirin",
        strength: "75 mg",
        form: "Tablet",
        route: "Oral",
        frequency: "Once daily at 08:00",
        status: "Active",
        indication: "Post-catheterisation antiplatelet therapy",
        prescribedBy: "Dr. Lena Hart",
        startedAt: "15 Sep 2026",
        lastAdministered: "21 Sep 2026, 08:05 AM",
        nextDue: "22 Sep 2026, 08:00 AM",
        monitoring: "Bleeding, bruising, dyspepsia and platelet count if clinically indicated.",
        holdCriteria: "Hold and escalate if active bleeding, suspected allergy or urgent procedure planned.",
        safetyNote: "No aspirin allergy recorded; confirm no additional over-the-counter NSAID use.",
      },
      {
        id: "med-emma-amlodipine",
        name: "Amlodipine",
        strength: "5 mg",
        form: "Tablet",
        route: "Oral",
        frequency: "Once daily at 20:00",
        status: "Active",
        indication: "Essential hypertension",
        prescribedBy: "Dr. Lena Hart",
        startedAt: "03 Mar 2021",
        lastAdministered: "20 Sep 2026, 08:02 PM",
        nextDue: "21 Sep 2026, 08:00 PM",
        monitoring: "Blood pressure trend, ankle swelling, dizziness and postural symptoms.",
        holdCriteria: "Hold if systolic BP is below 100 mmHg or symptomatic hypotension occurs.",
        safetyNote: "Current BP remains above target; continue daily trend review.",
      },
      {
        id: "med-emma-paracetamol",
        name: "Paracetamol",
        strength: "500 mg",
        form: "Tablet",
        route: "Oral",
        frequency: "Every 6 hours when required",
        status: "PRN",
        indication: "Post-operative pain",
        prescribedBy: "Dr. Lena Hart",
        startedAt: "15 Sep 2026",
        lastAdministered: "21 Sep 2026, 09:10 AM",
        nextDue: "Available after 03:10 PM if needed",
        monitoring: "Pain score, total daily dose and liver-risk history.",
        holdCriteria: "Do not exceed 4 g in 24 hours; hold if liver injury is suspected.",
        safetyNote: "Pain score is moderate; reassess 30–60 minutes after each dose.",
      },
    ],
    history: {
      pastMedical: [
        { condition: "Essential hypertension", since: "03 Mar 2021", status: "Controlled", notes: "Home readings mostly below 135/85 on amlodipine." },
        { condition: "Dyslipidemia", since: "12 Nov 2022", status: "Ongoing", notes: "LDL above target; diet and activity plan in place." },
        { condition: "Gestational diabetes", since: "Jun 2014", status: "Resolved", notes: "Diet-controlled; normal postpartum glucose tolerance test." },
      ],
      surgical: [
        { procedure: "Coronary angiography (right radial access)", date: "15 Sep 2026", facility: "MediMind Cardiology", notes: "No significant stenosis requiring intervention; access site healing well." },
        { procedure: "Laparoscopic appendicectomy", date: "Aug 2009", facility: "City General Hospital", notes: "Uncomplicated recovery." },
      ],
      family: [
        { relation: "Father", condition: "Myocardial infarction", onset: "Age 58", significant: true },
        { relation: "Mother", condition: "Type 2 diabetes", onset: "Age 61", significant: true },
        { relation: "Sister", condition: "No known conditions", onset: "—", significant: false },
      ],
      social: [
        { label: "Smoking", value: "Never smoked" },
        { label: "Alcohol", value: "Occasional, under 4 units per week" },
        { label: "Occupation", value: "Secondary school teacher" },
        { label: "Physical activity", value: "Walks 30 minutes, three times a week" },
        { label: "Diet", value: "Mixed diet; reducing salt and saturated fat" },
        { label: "Living situation", value: "Lives with husband and daughter" },
      ],
      immunizations: [
        { vaccine: "Influenza", date: "Oct 2025", status: "Up to date" },
        { vaccine: "COVID-19 booster", date: "Nov 2024", status: "Up to date" },
        { vaccine: "Tdap", date: "Feb 2019", status: "Up to date" },
        { vaccine: "Hepatitis B", date: "2005", status: "Completed series" },
      ],
      allergyDetails: [
        { allergen: "Penicillin", reaction: "Widespread itchy rash (urticaria)", severity: "Moderate", recorded: "2003" },
      ],
      screening: [
        { name: "Cervical screening", result: "Normal", date: "Mar 2024" },
        { name: "Mammogram", result: "Normal (BI-RADS 1)", date: "Jan 2026" },
        { name: "HbA1c", result: "5.6%", date: "May 2026" },
      ],
    },
    vitals: [
      { label: "Blood pressure", value: "138/86", unit: "mmHg" },
      { label: "Pulse", value: "88", unit: "bpm" },
      { label: "Temperature", value: "37.2", unit: "°C" },
      { label: "SpO₂", value: "97", unit: "%" },
      { label: "Respiratory rate", value: "18", unit: "/min" },
      { label: "Pain score", value: "4/10", unit: "moderate" },
    ],
  },
  {
    id: "92045",
    name: "Marcus Vance",
    initials: "MV",
    photo: marcusPhoto,
    sex: "Male",
    age: 68,
    mrn: "MM-92045",
    dob: "02 Feb 1958",
    bloodGroup: "A+",
    mobile: "+971 55 610 4420",
    status: "Monitoring",
    diagnosis: "AFib syncopation",
    diagnoses: [
      { condition: "Atrial fibrillation", code: "I48.91", status: "Active", onset: "19 Sep 2026", clinician: "Dr. Lena Hart" },
      { condition: "Syncope and collapse", code: "R55", status: "Active", onset: "19 Sep 2026", clinician: "Dr. Lena Hart" },
      { condition: "Essential hypertension", code: "I10", status: "Active", onset: "08 Jan 2018", clinician: "Dr. Lena Hart" },
    ],
    nextAction: "EKG at 14:00",
    room: "C-208",
    allergies: ["No known allergies"],
    risks: ["Cardiac observation"],
    encounter: {
      number: "IP-2026-0919-014",
      type: "Inpatient",
      admitted: "19 Sep 2026, 07:45 AM",
      ward: "Cardiology",
      consultant: "Dr. Lena Hart",
      complaint: "Syncope with irregular heartbeat",
    },
    encounters: [
      {
        id: "enc-marcus-0919",
        number: "IP-2026-0919-014",
        occurredAt: "19 Sep 2026, 07:45 AM",
        type: "Inpatient",
        department: "Cardiology",
        clinician: "Dr. Lena Hart",
        status: "Active",
        chiefComplaint: "Syncope with irregular heartbeat",
        summary: "Admitted after an unwitnessed syncopal episode with rapid atrial fibrillation. Rate is improving under telemetry; no recurrent loss of consciousness.",
        diagnoses: ["Atrial fibrillation (I48.91)", "Syncope and collapse (R55)", "Essential hypertension (I10)"],
        observations: ["BP 144/90 mmHg", "Pulse 104 bpm", "SpO₂ 95%", "Pain 1/10"],
        clinicalNote: {
          subjective: "Describes sudden light-headedness before briefly losing consciousness. No current chest pain or focal neurological symptoms.",
          objective: "Irregular tachycardia on examination. Neurological examination is non-focal and orthostatic observations are pending.",
          assessment: "Syncope likely related to uncontrolled atrial fibrillation; requires rhythm monitoring and stroke-risk assessment.",
          plan: "Continue telemetry, obtain repeat ECG and electrolytes, assess anticoagulation eligibility and institute falls precautions.",
        },
        orders: [{ name: "ECG 12 Lead", status: "Completed" }, { name: "Electrolytes", status: "Pending" }, { name: "Echocardiogram", status: "Ordered" }],
        medications: ["Rate-control therapy per cardiology plan", "Amlodipine 5 mg once daily"],
        disposition: "Continue monitored inpatient care in room C-208.",
        followUp: "Consultant review after echocardiogram and rhythm trend.",
      },
      {
        id: "enc-marcus-0606",
        number: "OP-2026-0606-081",
        occurredAt: "06 Jun 2026, 09:10 AM",
        type: "Outpatient",
        department: "Hypertension clinic",
        clinician: "Dr. Nabil Rahman",
        status: "Completed",
        chiefComplaint: "Blood-pressure medication review",
        summary: "Reviewed variable home blood-pressure readings. Medication adherence and measurement technique were reinforced.",
        diagnoses: ["Essential hypertension (I10)"],
        observations: ["BP 142/88 mmHg", "Pulse 80 bpm", "Weight 83 kg"],
        clinicalNote: {
          subjective: "Occasional missed evening doses; no chest pain, headache or exertional dyspnoea.",
          objective: "Mildly elevated clinic blood pressure with otherwise normal cardiovascular examination.",
          assessment: "Suboptimal blood-pressure control associated with inconsistent medication timing.",
          plan: "Use a daily medication reminder, record twice-daily readings for two weeks and review before dose escalation.",
        },
        orders: [{ name: "Renal profile", status: "Completed" }],
        medications: ["Continue prescribed antihypertensive therapy"],
        disposition: "Discharged home.",
        followUp: "Primary-care blood-pressure review in four weeks.",
      },
    ],
    medications: [
      {
        id: "med-marcus-rate-control",
        name: "Bisoprolol",
        strength: "2.5 mg",
        form: "Tablet",
        route: "Oral",
        frequency: "Once daily at 09:00",
        status: "Active",
        indication: "Rate control for atrial fibrillation",
        prescribedBy: "Dr. Lena Hart",
        startedAt: "19 Sep 2026",
        lastAdministered: "21 Sep 2026, 09:00 AM",
        nextDue: "22 Sep 2026, 09:00 AM",
        monitoring: "Heart rate, blood pressure, dizziness, bronchospasm and rhythm trend.",
        holdCriteria: "Hold if pulse is below 55 bpm, systolic BP below 100 mmHg or symptomatic bradycardia occurs.",
        safetyNote: "Pulse remains elevated; ECG review is scheduled today.",
      },
      {
        id: "med-marcus-amlodipine",
        name: "Amlodipine",
        strength: "5 mg",
        form: "Tablet",
        route: "Oral",
        frequency: "Once daily at 20:00",
        status: "Active",
        indication: "Essential hypertension",
        prescribedBy: "Dr. Nabil Rahman",
        startedAt: "08 Jan 2018",
        lastAdministered: "20 Sep 2026, 08:14 PM",
        nextDue: "21 Sep 2026, 08:00 PM",
        monitoring: "Blood pressure trend, oedema and postural symptoms.",
        holdCriteria: "Hold if systolic BP is below 100 mmHg or the patient is symptomatic.",
        safetyNote: "No recorded allergy conflict; reconcile home supply before discharge.",
      },
      {
        id: "med-marcus-paracetamol",
        name: "Paracetamol",
        strength: "500 mg",
        form: "Tablet",
        route: "Oral",
        frequency: "Every 6 hours when required",
        status: "PRN",
        indication: "Mild discomfort during admission",
        prescribedBy: "Dr. Lena Hart",
        startedAt: "19 Sep 2026",
        lastAdministered: "Not given this shift",
        nextDue: "Available if needed",
        monitoring: "Pain score and total daily dose.",
        holdCriteria: "Do not exceed 4 g in 24 hours; hold if liver injury is suspected.",
        safetyNote: "Pain score is mild; non-pharmacological comfort measures remain appropriate.",
      },
    ],
    history: {
      pastMedical: [
        { condition: "Essential hypertension", since: "08 Jan 2018", status: "Ongoing", notes: "Variable control linked to missed evening doses." },
        { condition: "Osteoarthritis, both knees", since: "2016", status: "Ongoing", notes: "Right knee replaced; left knee managed with physiotherapy." },
        { condition: "Benign prostatic hyperplasia", since: "2020", status: "Controlled", notes: "Mild symptoms; no current medication." },
      ],
      surgical: [
        { procedure: "Right total knee replacement", date: "Apr 2019", facility: "MediMind Orthopaedics", notes: "Good function; uses a cane on long walks." },
        { procedure: "Left inguinal hernia repair", date: "1998", facility: "City General Hospital", notes: "No recurrence." },
      ],
      family: [
        { relation: "Father", condition: "Stroke", onset: "Age 72", significant: true },
        { relation: "Brother", condition: "Atrial fibrillation", onset: "Age 65", significant: true },
        { relation: "Mother", condition: "Osteoporosis", onset: "Age 70", significant: false },
      ],
      social: [
        { label: "Smoking", value: "Ex-smoker, 20 pack-years, quit 2010", flag: true },
        { label: "Alcohol", value: "2–3 units per week" },
        { label: "Occupation", value: "Retired civil engineer" },
        { label: "Physical activity", value: "Light walking; limited by knee pain" },
        { label: "Mobility", value: "Independent; cane for longer distances", flag: true },
        { label: "Living situation", value: "Lives with wife in a ground-floor flat" },
      ],
      immunizations: [
        { vaccine: "Influenza", date: "Oct 2025", status: "Up to date" },
        { vaccine: "Pneumococcal (PCV20)", date: "Mar 2024", status: "Completed series" },
        { vaccine: "Shingles (recombinant)", date: "2023", status: "Completed series" },
        { vaccine: "COVID-19 booster", date: "Oct 2024", status: "Up to date" },
      ],
      allergyDetails: [
        { allergen: "No known allergies", reaction: "Confirmed with patient on admission", severity: "None", recorded: "19 Sep 2026" },
      ],
      screening: [
        { name: "Colonoscopy", result: "Two small polyps removed", date: "2022" },
        { name: "PSA", result: "2.1 ng/mL", date: "Jun 2026" },
        { name: "Stroke risk (CHA₂DS₂-VASc)", result: "Score 2 — review needed", date: "19 Sep 2026" },
      ],
    },
    vitals: [
      { label: "Blood pressure", value: "144/90", unit: "mmHg" },
      { label: "Pulse", value: "104", unit: "bpm" },
      { label: "Temperature", value: "36.8", unit: "°C" },
      { label: "SpO₂", value: "95", unit: "%" },
      { label: "Respiratory rate", value: "20", unit: "/min" },
      { label: "Pain score", value: "1/10", unit: "mild" },
    ],
  },
  {
    id: "92058",
    name: "Elena Rodriguez",
    initials: "ER",
    photo: elenaPhoto,
    sex: "Female",
    age: 29,
    mrn: "MM-92058",
    dob: "22 Nov 1996",
    bloodGroup: "B+",
    mobile: "+971 52 481 9033",
    status: "Admitted",
    diagnosis: "Acute bronchitis",
    diagnoses: [
      { condition: "Acute bronchitis", code: "J20.9", status: "Active", onset: "21 Sep 2026", clinician: "Dr. Lena Hart" },
      { condition: "Wheezing", code: "R06.2", status: "Active", onset: "20 Sep 2026", clinician: "Dr. Lena Hart" },
      { condition: "Seasonal allergic rhinitis", code: "J30.2", status: "Resolved", onset: "14 Apr 2024", clinician: "Dr. Lena Hart" },
    ],
    nextAction: "Vitals check",
    room: "R-116",
    allergies: ["Sulfonamides"],
    risks: ["Respiratory observation"],
    encounter: {
      number: "IP-2026-0921-003",
      type: "Inpatient",
      admitted: "21 Sep 2026, 06:30 AM",
      ward: "Respiratory",
      consultant: "Dr. Lena Hart",
      complaint: "Persistent cough, fever and wheezing",
    },
    encounters: [
      {
        id: "enc-elena-0921",
        number: "IP-2026-0921-003",
        occurredAt: "21 Sep 2026, 06:30 AM",
        type: "Inpatient",
        department: "Respiratory",
        clinician: "Dr. Lena Hart",
        status: "Active",
        chiefComplaint: "Persistent cough, fever and wheezing",
        summary: "Admitted with acute bronchitis and wheeze. Oxygen saturation is borderline but stable; treatment response is under review.",
        diagnoses: ["Acute bronchitis (J20.9)", "Wheezing (R06.2)"],
        observations: ["BP 118/76 mmHg", "Pulse 92 bpm", "Temperature 38.1°C", "SpO₂ 94%"],
        clinicalNote: {
          subjective: "Three days of productive cough, fever and chest tightness. Reports partial relief after inhaled bronchodilator.",
          objective: "Low-grade fever with scattered expiratory wheeze. Speaking full sentences with no accessory-muscle use.",
          assessment: "Acute bronchitis with bronchospasm and mild oxygen desaturation; no focal consolidation on initial imaging.",
          plan: "Continue bronchodilator, repeat oxygen saturation and temperature, maintain hydration and escalate if respiratory effort increases.",
        },
        orders: [{ name: "Chest X-Ray", status: "Completed" }, { name: "Full blood count", status: "Pending" }, { name: "Repeat SpO₂", status: "Ordered" }],
        medications: ["Inhaled bronchodilator as prescribed", "Paracetamol for fever"],
        disposition: "Continue respiratory observation in room R-116.",
        followUp: "Respiratory review later today and clinic follow-up on 25 Sep 2026.",
      },
      {
        id: "enc-elena-0414",
        number: "OP-2024-0414-129",
        occurredAt: "14 Apr 2024, 04:00 PM",
        type: "Outpatient",
        department: "Allergy clinic",
        clinician: "Dr. Lena Hart",
        status: "Completed",
        chiefComplaint: "Seasonal sneezing and nasal congestion",
        summary: "Seasonal allergic rhinitis diagnosed and treated conservatively, with good symptom control reported afterward.",
        diagnoses: ["Seasonal allergic rhinitis (J30.2)"],
        observations: ["Temperature 36.7°C", "SpO₂ 99%", "Respiratory rate 16/min"],
        clinicalNote: {
          subjective: "Recurrent sneezing, itchy eyes and clear nasal discharge during spring. No wheeze or nocturnal cough.",
          objective: "Pale nasal mucosa and clear secretions. Chest clear on auscultation.",
          assessment: "Seasonal allergic rhinitis without lower-airway involvement.",
          plan: "Start allergen avoidance measures and non-sedating antihistamine; return if wheeze develops.",
        },
        orders: [{ name: "Allergy review", status: "Completed" }],
        medications: ["Non-sedating antihistamine when required"],
        disposition: "Discharged from clinic.",
        followUp: "Review as needed during allergy season.",
      },
    ],
    medications: [
      {
        id: "med-elena-bronchodilator",
        name: "Salbutamol inhaler",
        strength: "100 micrograms per puff",
        form: "Metered-dose inhaler",
        route: "Inhaled",
        frequency: "2 puffs every 4–6 hours when required",
        status: "PRN",
        indication: "Wheeze and bronchospasm",
        prescribedBy: "Dr. Lena Hart",
        startedAt: "21 Sep 2026",
        lastAdministered: "21 Sep 2026, 10:40 AM",
        nextDue: "Available after 02:40 PM if wheeze recurs",
        monitoring: "Respiratory rate, SpO₂, tremor, tachycardia and response after administration.",
        holdCriteria: "Escalate before repeat dosing if worsening work of breathing or SpO₂ falls below target.",
        safetyNote: "Current SpO₂ is borderline; repeat saturation is ordered.",
      },
      {
        id: "med-elena-paracetamol",
        name: "Paracetamol",
        strength: "500 mg",
        form: "Tablet",
        route: "Oral",
        frequency: "Every 6 hours when required",
        status: "PRN",
        indication: "Fever and mild chest discomfort",
        prescribedBy: "Dr. Lena Hart",
        startedAt: "21 Sep 2026",
        lastAdministered: "21 Sep 2026, 08:30 AM",
        nextDue: "Available after 02:30 PM if febrile",
        monitoring: "Temperature trend, pain score and total daily dose.",
        holdCriteria: "Do not exceed 4 g in 24 hours; hold if liver injury is suspected.",
        safetyNote: "Sulfonamide allergy does not conflict with the current medication list.",
      },
      {
        id: "med-elena-antihistamine",
        name: "Loratadine",
        strength: "10 mg",
        form: "Tablet",
        route: "Oral",
        frequency: "Once daily when required",
        status: "Held",
        indication: "Seasonal allergic rhinitis",
        prescribedBy: "Dr. Lena Hart",
        startedAt: "14 Apr 2024",
        lastAdministered: "Home medication — not administered inpatient",
        nextDue: "Resume only if allergic rhinitis symptoms recur",
        monitoring: "Sedation, nasal symptoms and overlap with acute respiratory complaints.",
        holdCriteria: "Hold during acute assessment unless symptoms require treatment.",
        safetyNote: "Held during inpatient respiratory observation to keep symptom assessment clear.",
      },
    ],
    history: {
      pastMedical: [
        { condition: "Childhood asthma", since: "2001", status: "Resolved", notes: "No inhaler use since age 12 until current admission." },
        { condition: "Seasonal allergic rhinitis", since: "14 Apr 2024", status: "Controlled", notes: "Spring symptoms; antihistamine when needed." },
        { condition: "Iron deficiency anaemia", since: "2022", status: "Resolved", notes: "Treated with three months of oral iron." },
      ],
      surgical: [
        { procedure: "Tonsillectomy", date: "2004", facility: "Children's Hospital", notes: "Childhood procedure; no complications." },
      ],
      family: [
        { relation: "Mother", condition: "Asthma", onset: "Childhood", significant: true },
        { relation: "Father", condition: "Hypertension", onset: "Age 50", significant: false },
      ],
      social: [
        { label: "Smoking", value: "Never smoked" },
        { label: "Alcohol", value: "None" },
        { label: "Occupation", value: "Graphic designer, works from home" },
        { label: "Physical activity", value: "Yoga twice a week" },
        { label: "Environment", value: "Lives with a pet cat; possible allergen", flag: true },
        { label: "Living situation", value: "Lives alone; sister nearby" },
      ],
      immunizations: [
        { vaccine: "Influenza", date: "Not given in 2025", status: "Due" },
        { vaccine: "COVID-19", date: "Dec 2023", status: "Due" },
        { vaccine: "HPV", date: "2010", status: "Completed series" },
        { vaccine: "Tdap", date: "Jun 2021", status: "Up to date" },
      ],
      allergyDetails: [
        { allergen: "Sulfonamides", reaction: "Flat red rash across the trunk", severity: "Moderate", recorded: "2015" },
        { allergen: "Pollen (seasonal)", reaction: "Sneezing, itchy eyes", severity: "Mild", recorded: "14 Apr 2024" },
      ],
      screening: [
        { name: "Cervical screening", result: "Normal", date: "Aug 2025" },
        { name: "Haemoglobin", result: "12.9 g/dL", date: "2023" },
      ],
    },
    vitals: [
      { label: "Blood pressure", value: "118/76", unit: "mmHg" },
      { label: "Pulse", value: "92", unit: "bpm" },
      { label: "Temperature", value: "38.1", unit: "°C" },
      { label: "SpO₂", value: "94", unit: "%" },
      { label: "Respiratory rate", value: "22", unit: "/min" },
      { label: "Pain score", value: "2/10", unit: "mild" },
    ],
  },
];

export function getClinicalPatient(patientId: string) {
  return CLINICAL_PATIENTS.find((patient) => patient.id === patientId);
}