# Update medical-speech response preview

## Changes
- Update the response definitions to accept the uploaded API shape, including string lists for differential diagnoses, investigations, medications, and alerts.
- Normalize both the earlier detailed response and the new compact response so either remains viewable.
- Adjust the preview cards and investigation list to display compact string values cleanly while retaining detailed evidence and reasons when supplied.
- Verify the uploaded chest-pain response renders all note and decision-support sections without errors.

## Scope
Frontend response parsing and presentation only. Recording and API submission remain unchanged.
