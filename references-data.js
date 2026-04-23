/**
 * references-data.js
 *
 * Sample approved references for display.
 * approved: true  → visible on site
 * approved: false → hidden (pending review)
 *
 * To connect a live data source later:
 *   - Replace this array with a fetch() call that returns the same shape
 *   - Call window.initReferences(data) after the fetch resolves
 *   - See the "Future upgrade path" note at the bottom of this file
 */

var REFERENCES_DATA = [
  {
    id: 1,
    fullName: "Ariana Rivera",
    referenceTitle: "Homecare Supervisor",
    organization: "European American Association",
    referenceType: "Professional",
    knownRole: "Operations & IT / EAA",
    relationshipDetails: "Primary point of contact representing a team of homecare supervisors. Collaborated closely on day-to-day operational needs, including workflow issues, onboarding and offboarding coordination, compliance processes, and technical support. She regularly consolidated requests from multiple supervisors and worked directly with Edwin to develop and implement solutions that improved efficiency and supported program-wide operations.",
    professionalFeedback: "",
    teamworkFeedback: "",
    email: "ar@eaachicago.org",
    phone: "(773) 398-9904",
    additionalComments: "European American Association, 2827 West Division Street, Chicago, IL 60622",
    approved: true,
    submittedAt: ""
  },
  {
    id: 2,
    fullName: "Margaret Jarmola",
    referenceTitle: "",
    organization: "European American Association",
    referenceType: "Professional",
    knownRole: "Operations & IT / EAA",
    relationshipDetails: "Co-worker and friend at EAA.",
    professionalFeedback: "",
    teamworkFeedback: "",
    email: "mj@eaachicago.org",
    phone: "(773) 251-4628",
    additionalComments: "European American Association, 2827 West Division Street, Chicago, IL 60622",
    approved: true,
    submittedAt: ""
  }
];

/*
 * ─── FUTURE UPGRADE PATH ──────────────────────────────────────────────────────
 *
 * Right now, this file is the data source. To connect real Microsoft Forms
 * submissions later, you have three practical options:
 *
 * Option 1 — Manual export (no automation needed):
 *   Microsoft Forms → Open in Excel Online → export filtered rows
 *   from the "Responses" sheet → save as JSON → replace this array.
 *   Good for occasional updates. Slow for frequent changes.
 *
 * Option 2 — Power Automate (semi-automated):
 *   Microsoft Forms → Power Automate trigger "When a new response is submitted"
 *   → approved field logic → write to a SharePoint list or Azure Blob as JSON
 *   → your site fetch()es that JSON URL at page load (replace the array with
 *   a fetch call to that URL).
 *   Suitable for ongoing, near-real-time updates without a custom backend.
 *
 * Option 3 — Backend sync (fully automated):
 *   Microsoft Forms → Excel/SharePoint → Azure Function or Node.js API
 *   → REST endpoint returning JSON filtered by approved === true
 *   → replace this array with: fetch('/api/references').then(r => r.json())
 *   .then(data => window.initReferences(data));
 *   Best for full control, moderation workflow, and scaling.
 *
 * In all cases, the UI in references.js does not need to change — only the
 * data source. The function window.initReferences(data) accepts the same
 * array shape defined above.
 * ─────────────────────────────────────────────────────────────────────────────
 */
