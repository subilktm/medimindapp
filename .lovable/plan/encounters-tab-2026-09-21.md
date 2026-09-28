# Encounters tab

## Goal
Turn the existing Encounters submenu into a patient-specific visit history where clinicians can scan every encounter and open its complete summary.

## What will change
- Add structured encounter history to each demo patient, including status, date, setting, clinician, complaint, diagnoses, observations, notes, orders, medications, disposition, and follow-up.
- Make **Encounters** a functional patient-dashboard tab instead of showing a placeholder message.
- Show a chronological encounter timeline with concise summary cards and clear current/completed status.
- Let clinicians expand an encounter to review its full clinical detail without leaving the patient record.
- Connect the Overview “Open encounter” action to the Encounters tab and focus the current encounter.
- Keep the layout usable on phone and desktop sizes and match the existing Precision Frost clinical design.

## Technical details
- Extend the patient data types in the existing clinical patient data module.
- Add a focused reusable encounter-history component.
- Update the patient dashboard tab switching and action handling only; no authentication or backend policy changes.
- Verify the page builds and test encounter opening in the live preview.
