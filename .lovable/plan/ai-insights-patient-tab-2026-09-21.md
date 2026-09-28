# AI Insights patient tab

## Scope
- Add **AI Insights** immediately after **Overview** in the patient dashboard tabs.
- Build a patient-specific clinical decision-support view using the patient’s diagnoses, allergies, risks, vitals, encounter, and approved pediatric dental summary.
- Present prioritized alerts, clinical considerations, monitoring signals, treatment guidance, and confidence/provenance with clear clinician-review language.
- Keep the existing Overview and Pedodontics chart views unchanged.

## Technical details
- Add a focused `PatientAiInsights` component and render it from the existing patient tab state.
- Reuse the existing dental overview query so approved AI summaries and pending-review status remain synchronized.
- Use deterministic patient-record rules for immediate safety signals; label recommendations as decision support, not autonomous medical advice.
- Verify the desktop and current compact viewport, interactions, console, and build status.
