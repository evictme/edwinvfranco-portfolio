/**
 * references.js
 *
 * Renders the Professional References display section.
 * Data source: REFERENCES_DATA (defined in references-data.js)
 *
 * Public API:
 *   window.initReferences(dataArray) - call this with a fetched array to swap
 *   in a live data source without touching any UI code.
 */

(function () {
  'use strict';

  // Session unlock state - resets on page reload
  var _unlocked = false;

  // -- Code check - stored as char codes, not as a plaintext string
  function checkCode(input) {
    var k = [50, 48, 50, 54].map(function (c) { return String.fromCharCode(c); }).join('');
    return input.trim() === k;
  }

  // -- Escape a string for safe HTML insertion
  function esc(str) {
    if (str === null || str === undefined) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  // -- Group an array of refs by knownRole
  function groupByRole(refs) {
    var groups = {};
    refs.forEach(function (ref) {
      var role = ref.knownRole || 'Uncategorized';
      if (!groups[role]) groups[role] = [];
      groups[role].push(ref);
    });
    return groups;
  }

  // -- Build the inline gate prompt HTML
  function buildInlineGate() {
    return '<div class="ref-inline-gate">'
      + '<div class="ref-inline-gate-icon"><i class="fa-solid fa-lock" aria-hidden="true"></i></div>'
      + '<p class="ref-inline-gate-msg">Access code required</p>'
      + '<p class="ref-inline-gate-sub">Enter the access code to view contact details.</p>'
      + '<div class="ref-inline-gate-row">'
      + '<input class="ref-inline-gate-input" type="password" placeholder="Access code" autocomplete="off">'
      + '<button class="ref-inline-gate-btn" type="button">Unlock</button>'
      + '</div>'
      + '<p class="ref-inline-gate-error" hidden>Incorrect code - try again.</p>'
      + '</div>';
  }

  // -- Build the detail card markup for one reference
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

  // -- Unlock all currently-open group bodies
  function unlockAllBodies() {
    document.querySelectorAll('.ref-group-body').forEach(function (body) {
      var gate = body.querySelector('.ref-inline-gate');
      var list = body.querySelector('.ref-name-list');
      if (gate) gate.hidden = true;
      if (list) list.hidden = false;
    });
  }

  // -- Attach expand/collapse and inline gate listeners after a render
  function attachListeners() {
    // Group toggles - plain open/close, gate lives inside the body
    document.querySelectorAll('.ref-group-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        var body = document.getElementById(btn.getAttribute('aria-controls'));
        if (!body) return;
        var next = !expanded;
        btn.setAttribute('aria-expanded', String(next));
        body.hidden = !next;
        btn.classList.toggle('open', next);
        // Auto-focus the inline gate input when opening a locked group
        if (next && !_unlocked) {
          var gateInput = body.querySelector('.ref-inline-gate-input');
          if (gateInput) setTimeout(function () { gateInput.focus(); }, 30);
        }
      });
    });

    // Inline gate unlock handlers
    document.querySelectorAll('.ref-inline-gate').forEach(function (gate) {
      var input = gate.querySelector('.ref-inline-gate-input');
      var btn   = gate.querySelector('.ref-inline-gate-btn');
      var errEl = gate.querySelector('.ref-inline-gate-error');

      function tryUnlock() {
        if (checkCode(input.value)) {
          _unlocked = true;
          unlockAllBodies();
        } else {
          errEl.hidden = false;
          input.select();
        }
      }

      btn.addEventListener('click', tryUnlock);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') tryUnlock();
      });
      input.addEventListener('input', function () {
        errEl.hidden = true;
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

  // -- Main render function - builds the full list HTML
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

    var groups      = groupByRole(filtered);
    var sortedRoles = Object.keys(groups).sort(function (a, b) {
      return a.localeCompare(b);
    });

    var html = '';
    sortedRoles.forEach(function (role) {
      var members = groups[role].slice().sort(function (a, b) {
        return a.fullName.localeCompare(b.fullName);
      });

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

      // Inline gate (shown when locked, hidden after unlock)
      if (!_unlocked) {
        html += buildInlineGate();
      }

      // Name list (hidden behind gate until unlocked)
      html += '<ul class="ref-name-list"' + (_unlocked ? '' : ' hidden') + '>';

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

  // -- Public entry point
  window.initReferences = function (data) {
    var searchInput = document.getElementById('ref-search');
    var currentQuery = searchInput ? searchInput.value : '';
    render(data, currentQuery);

    if (searchInput) {
      var newInput = searchInput.cloneNode(true);
      searchInput.parentNode.replaceChild(newInput, searchInput);
      newInput.addEventListener('input', function () {
        render(data, newInput.value);
      });
    }
  };

  // -- Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function () {
    var data = (typeof REFERENCES_DATA !== 'undefined') ? REFERENCES_DATA : [];
    window.initReferences(data);
  });

}());