(() => {
  "use strict";

  const API_URL = "https://zwzgbfyjqmmxzsonpdfj.supabase.co/functions/v1/feedback-admin";
  const loginPanel = document.querySelector("#login-panel");
  const adminPanel = document.querySelector("#admin-panel");
  const loginForm = document.querySelector("#login-form");
  const passwordInput = document.querySelector("#admin-password");
  const status = document.querySelector("#status");
  const days = document.querySelector("#days");
  const deleteDialog = document.querySelector("#delete-dialog");
  const deleteCopy = document.querySelector("#delete-copy");
  const deleteConfirm = document.querySelector("#delete-confirm");
  let adminPassword = "";
  let rows = [];
  let pendingDelete = null;

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle("error", isError);
  };

  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  const isRequest = row => String(row.article_id).startsWith("request://");
  const formatDate = value => new Intl.DateTimeFormat("de-DE", {weekday: "long", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin"}).format(new Date(`${value}T12:00:00Z`));
  const formatTime = value => value ? new Intl.DateTimeFormat("de-DE", {day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin"}).format(new Date(value)) : "";
  const shortTitle = row => {
    if (isRequest(row)) return String(row.topic).replace(/^Redaktionswunsch\s*·\s*/i, "");
    return row.topic || "Artikelbewertung";
  };

  const entryTemplate = row => {
    const request = isRequest(row);
    const link = request ? escapeHtml(row.article_id) : `<a class="entry-link" href="${escapeHtml(row.article_id)}" target="_blank" rel="noopener">${escapeHtml(row.article_id)}</a>`;
    return `<article class="entry ${request ? "request" : ""}" data-id="${escapeHtml(row.id)}">
      <div class="entry-head"><b>${escapeHtml(shortTitle(row))}</b><time>${escapeHtml(formatTime(row.created_at))}</time></div>
      ${request ? `<span class="entry-link">${link}</span>` : link}
      <div class="entry-fields">
        <div class="field full"><label for="topic-${escapeHtml(row.id)}">Thema / Feedback</label><input id="topic-${escapeHtml(row.id)}" data-field="topic" maxlength="200" value="${escapeHtml(row.topic)}"></div>
        <div class="field"><label for="date-${escapeHtml(row.id)}">Ausgabetag</label><input id="date-${escapeHtml(row.id)}" data-field="edition_date" type="date" value="${escapeHtml(row.edition_date)}"></div>
        <div class="field"><label for="vote-${escapeHtml(row.id)}">Wertung</label><select id="vote-${escapeHtml(row.id)}" data-field="vote"><option value="1" ${Number(row.vote) === 1 ? "selected" : ""}>👍 Positiv</option><option value="-1" ${Number(row.vote) === -1 ? "selected" : ""}>👎 Negativ</option></select></div>
      </div>
      <div class="entry-actions"><button class="danger" type="button" data-action="delete">Löschen</button><button class="primary" type="button" data-action="save">Änderungen speichern</button></div>
    </article>`;
  };

  const render = () => {
    document.querySelector("#total-count").textContent = rows.length;
    document.querySelector("#rating-count").textContent = rows.filter(row => !isRequest(row)).length;
    document.querySelector("#request-count").textContent = rows.filter(isRequest).length;
    const grouped = Map.groupBy ? Map.groupBy(rows, row => row.edition_date) : rows.reduce((map, row) => map.set(row.edition_date, [...(map.get(row.edition_date) || []), row]), new Map());
    const dates = [...grouped.keys()].sort((a, b) => b.localeCompare(a));
    days.innerHTML = dates.length ? dates.map(date => {
      const dayRows = grouped.get(date);
      const ratings = dayRows.filter(row => !isRequest(row));
      const requests = dayRows.filter(isRequest);
      return `<section class="day"><div class="day-head"><h3>${escapeHtml(formatDate(date))}</h3><span>${dayRows.length} Einträge</span></div><div class="day-grid">
        <div class="column"><div class="column-title"><h4>Bewertungen</h4><span class="count">${ratings.length}</span></div><div class="entries">${ratings.length ? ratings.map(entryTemplate).join("") : '<div class="empty">Keine Bewertungen</div>'}</div></div>
        <div class="column"><div class="column-title"><h4>Feedback &amp; Themenwünsche</h4><span class="count">${requests.length}</span></div><div class="entries">${requests.length ? requests.map(entryTemplate).join("") : '<div class="empty">Kein Feedback</div>'}</div></div>
      </div></section>`;
    }).join("") : '<div class="empty">Keine Datenbankeinträge vorhanden.</div>';
  };

  const request = async (action, payload = {}) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json", "x-admin-password": adminPassword},
      body: JSON.stringify({action, ...payload})
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`${response.status} ${body || response.statusText}`);
    }
    if (response.status === 204) return null;
    return response.json();
  };

  const loadRows = async () => {
    setStatus("Lade Datenbank …");
    rows = await request("list");
    render();
    setStatus(`${rows.length} Einträge geladen · Stand ${new Intl.DateTimeFormat("de-DE", {hour: "2-digit", minute: "2-digit"}).format(new Date())} Uhr`);
  };

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const candidate = passwordInput.value;
    if (candidate.length < 12) {
      passwordInput.setCustomValidity("Das Admin-Passwort muss mindestens 12 Zeichen lang sein.");
      passwordInput.reportValidity();
      return;
    }
    passwordInput.setCustomValidity("");
    adminPassword = candidate;
    passwordInput.value = "";
    loginPanel.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    try {
      await loadRows();
    } catch (error) {
      adminPassword = "";
      adminPanel.classList.add("hidden");
      loginPanel.classList.remove("hidden");
      passwordInput.focus();
      alert(`Verbindung fehlgeschlagen: ${error.message}`);
    }
  });

  document.querySelector("#refresh").addEventListener("click", () => loadRows().catch(error => setStatus(`Aktualisieren fehlgeschlagen: ${error.message}`, true)));
  document.querySelector("#logout").addEventListener("click", () => {
    adminPassword = "";
    rows = [];
    days.replaceChildren();
    adminPanel.classList.add("hidden");
    loginPanel.classList.remove("hidden");
    passwordInput.focus();
  });

  days.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");
    const entry = button?.closest(".entry");
    if (!button || !entry) return;
    const row = rows.find(item => String(item.id) === entry.dataset.id);
    if (!row) return;

    if (button.dataset.action === "delete") {
      pendingDelete = row;
      deleteCopy.textContent = `„${shortTitle(row)}“ wird endgültig aus Supabase entfernt.`;
      deleteDialog.showModal();
      return;
    }

    button.disabled = true;
    setStatus("Speichere Änderung …");
    const topic = entry.querySelector('[data-field="topic"]').value.trim().replace(/\s+/g, " ").slice(0, 200);
    const editionDate = entry.querySelector('[data-field="edition_date"]').value;
    const vote = Number(entry.querySelector('[data-field="vote"]').value);
    try {
      await request("update", {id: row.id, topic, edition_date: editionDate, vote});
      await loadRows();
      setStatus("Änderung in Supabase gespeichert.");
    } catch (error) {
      setStatus(`Speichern fehlgeschlagen: ${error.message}`, true);
      button.disabled = false;
    }
  });

  document.querySelector("#delete-cancel").addEventListener("click", () => { pendingDelete = null; deleteDialog.close(); });
  deleteConfirm.addEventListener("click", async () => {
    if (!pendingDelete) return;
    deleteConfirm.disabled = true;
    try {
      await request("delete", {id: pendingDelete.id});
      pendingDelete = null;
      deleteDialog.close();
      await loadRows();
      setStatus("Eintrag endgültig aus Supabase gelöscht.");
    } catch (error) {
      setStatus(`Löschen fehlgeschlagen: ${error.message}`, true);
    } finally {
      deleteConfirm.disabled = false;
    }
  });
})();
