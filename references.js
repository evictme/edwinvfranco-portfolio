/**
 * references.js
 *
 * Renders the Professional References display section.
 * Data source: REFERENCES_DATA (defined in references-data.js)
 *
 * Public API:
 *   window.initReferences(dataArray) — call this with a fetched array to swap
 *   in a live data source without touching any UI code.
 */

(function () {
  'use strict';

  // ── Escape a string for safe HTML insertion
  function esc(str) {
    if (str === null || str === undefined) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  // ── Group an array of refs by knownRole
  function groupByRole(refs) {
    var groups = {};
    refs.forEach(function (ref) {
      var role = ref.knownRole || 'Uncategorized';
      if (!groups[role]) groups[role] = [];
      groups[role].push(ref);
    });
    return groups;
  }

  // ── Build the detail card markup for one reference
  function buildDetailCard(ref) {
    var fields = [
      ['Title / Role',              ref.referenceTitle],
      ['Organization',              ref.organization],
      ['Reference Type',            ref.referenceType],
      ['Role Known From',           ref.knownRole],
      ['Relationship',              ref.relationshipDetails],
      ['Professional Feedback',     ref.professionalFeedback],
      ['Teamwork / Collaboration',  ref.teamworkFeedback],
      ['Email',                     ref.email],
      ['Phone',                     ref.phone],
      ['Additional Comments',       ref.additionalComments],
      ['Submitted',                 ref.submittedAt]
    ];

    var rows = '';
    fields.forEach(function (pair) {
      if (!pair[1]) return;
      rows += '<div class="ref-detail-row">'
        + '<span class="ref-detail-label">' + esc(pair[0]) + '</span>'
        + '<span class="ref-detail-value">' + esc(pair[1]) + '</span>'
        + '</div>';
    });

    return '<div class="ref-detail-card">' + rows + '</div>';
  }

  // ── Attach expand/collapse listeners after a render
  function attachListeners() {
    // Role group toggles
    document.querySelectorAll('.ref-group-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        var body = document.getElementById(btn.getAttribute('aria-controls'));
        if (!body) return;
        var next = !expanded;
        btn.setAttribute('aria-expanded', String(next));
        body.hidden = !next;
        btn.classList.toggle('open', next);
      });
    });

    // Individual reference name toggles
    document.querySelectorAll('.ref-name-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        var detail = document.getElementById(btn.getAttribute('aria-controls'));
        if (!detail) return;
        var next = !expanded;
        btn.setAttribute('aria-expanded', String(next));
        detail.hidden = !next;
        btn.classList.toggle('open', next);
      });
    });
  }

  // ── Main render function — builds the full list HTML
  function render(data, filter) {
    var container = document.getElementById('references-list');
    var countEl   = document.getElementById('ref-count');
    if (!container || !countEl) return;

    var approved = data.filter(function (r) { return r.approved === true; });
    var query    = (filter || '').trim().toLowerCase();

    var filtered = query
      ? approved.filter(function (r) {
          return (r.fullName       || '').toLowerCase().indexOf(query) !== -1
              || (r.knownRole      || '').toLowerCase().indexOf(query) !== -1
              || (r.organization   || '').toLowerCase().indexOf(query) !== -1
              || (r.referenceTitle || '').toLowerCase().indexOf(query) !== -1;
        })
      : approved;

    var total = filtered.length;
    countEl.textContent = total + ' approved reference' + (total !== 1 ? 's' : '');

    if (total === 0) {
      container.innerHTML = '<p class="ref-empty">'
        + (query ? 'No references match your search.' : 'No approved references yet. Be the first to submit one above.')
        + '</p>';
      return;
    }

    var groups     = groupByRole(filtered);
    var sortedRoles = Object.keys(groups).sort(function (a, b) {
      return a.localeCompare(b);
    });

    var html = '';
    sortedRoles.forEach(function (role) {
      var members = groups[role].slice().sort(function (a, b) {
        return a.fullName.localeCompare(b.fullName);
      });

      // Safe ID for aria-controls — strip non-alphanumeric chars
      var groupId = 'refgroup-' + role.replace(/[^a-z0-9]/gi, '-').toLowerCase();

      html += '<div class="ref-group">';

      // Group header button
      html += '<button class="ref-group-toggle"'
        + ' aria-expanded="false"'
        + ' aria-controls="' + esc(groupId) + '">';
      html += '<span class="ref-group-title">' + esc(role) + '</span>';
      html += '<span class="ref-group-count">' + members.length + '</span>';
      html += '<span class="ref-group-chevron" aria-hidden="true">'
        + '<i class="fa-solid fa-chevron-down"></i></span>';
      html += '</button>';

      // Group body
      html += '<div class="ref-group-body" id="' + esc(groupId) + '" hidden>';
      html += '<ul class="ref-name-list">';

      members.forEach(function (ref) {
        var detailId = 'ref-detail-' + ref.id;
        html += '<li class="ref-name-item">';
        html += '<button class="ref-name-btn"'
          + ' aria-expanded="false"'
          + ' aria-controls="' + esc(detailId) + '">';
        html += '<i class="fa-regular fa-user-circle" aria-hidden="true"></i>'
          + ' <span>' + esc(ref.fullName) + '</span>';
        html += '<span class="ref-name-type">' + esc(ref.referenceType) + '</span>';
        html += '</button>';
        html += '<div class="ref-detail-wrap" id="' + esc(detailId) + '" hidden>';
        html += buildDetailCard(ref);
        html += '</div>';
        html += '</li>';
      });

      html += '</ul></div></div>';
    });

    container.innerHTML = html;
    attachListeners();
  }

  // ── Public entry point — can be called with fetched data to swap source
  window.initReferences = function (data) {
    var searchInput = document.getElementById('ref-search');
    var currentQuery = searchInput ? searchInput.value : '';
    render(data, currentQuery);

    if (searchInput) {
      // Remove old listener before re-attaching to avoid duplicates
      var newInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newInput, searchInput);
      newInput.addEventListener('input', function () {
        render(data, newInput.value);
      });
    }
  };

  // ── Auto-init on DOMContentLoaded using REFERENCES_DATA
  document.addEventListener('DOMContentLoaded', function () {
    var data = (typeof REFERENCES_DATA !== 'undefined') ? REFERENCES_DATA : [];
    window.initReferences(data);
  });

}());
