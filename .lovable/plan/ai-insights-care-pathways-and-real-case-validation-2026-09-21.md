# AI Insights care pathways and real-case validation

## What will change
- Add a care pathway section to AI Insights, organized by the patient's active conditions.
- Show each condition's next clinical step, status, linked follow-up date, and linked lab or imaging order.
- Derive dental pathway steps from the clinician-approved pediatric summary so Insights stays aligned with the patient record.
- Keep links actionable: follow-up and order actions open the relevant patient sections when available, with clear pending states otherwise.

## Real case import and verification
- Import the clinician's supplied JSON or CSV case file into the existing private case library and confirm those cases are active.
- Open a patient with charted dental findings, generate a fresh summary grounded only in the active clinic cases, then approve that version.
- Open AI Insights and verify the approved plan and dental care pathway show the same findings and next steps.

## Safety and records
- Keep generated summaries in draft status until clinician approval.
- Preserve the existing model, audit history, version history, and approved-summary record.
- Do not claim model retraining; uploaded cases provide private case-grounded retrieval for each generation, which is the supported practice-matching approach.

## Current blocker
- No pediatric case file is attached yet. The care-pathway work can proceed, but real-case import and end-to-end validation require the file.

## Technical details
- Extend the existing AI Insights view and approved-summary data flow; no new patient data tables are required unless scheduled follow-ups or orders need persistence beyond the existing record.
- Validate the updated screen at desktop and compact widths, then check the generated/approved summary flow in the live preview.
