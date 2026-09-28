# Patient dashboard navigation

## What will change
- Make each patient row in the clinician home screen clickable and keyboard-accessible.
- Replace the placeholder Patient List with a usable patient table whose rows open the same patient dashboard.
- Add a patient dashboard at `/clinician/patients/$patientId` for every listed patient.

## Patient dashboard
- Preserve MediMind’s Arctic Frost theme while following the uploaded reference’s dense clinical layout.
- Show a patient identity header with demographics, MRN, status, allergies, risk flags, and key actions.
- Add section tabs for overview, encounters, clinical history, medications, results, documents, insurance, billing, and audit trail.
- Build the overview with compact panels for current encounter, upcoming appointment, clinical snapshot, diagnoses and allergies, care team, insurance, medications, orders/results, documents, and recent activity.
- Keep controls visibly actionable; unavailable workflows will show clear in-app feedback rather than dead buttons.

## Data and navigation
- Use stable patient IDs in typed local clinical demo data so the list and dashboard stay consistent.
- Unknown patient IDs will show a safe “patient not found” state with a return link.
- Keep clinician access protection, the API-driven clinician menu, authentication, and roles unchanged.

## Verification
- Confirm all current patient rows navigate to their matching dashboards.
- Check desktop and narrow-screen layouts for readable, non-overlapping clinical information.
- Verify route metadata, browser console, and project build health.
