(() => {
  "use strict";

  const SUPABASE_URL = "https://zwzgbfyjqmmxzsonpdfj.supabase.co";
  const SUPABASE_KEY = "sb_publishable_x2Nv1tiZg2k8A0nwNC7qhA_K2QwWpAM";
  const editionDate = document.body.dataset.editionDate;
  const storagePrefix = "koepfer_feedback_v1";
  const encoder = new TextEncoder();

  const hash = async (value) => {
    const bytes = await crypto.subtle.digest("SHA-256", encoder.encode(value));
    return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
  };

  let sessionId = localStorage.getItem(`${storagePrefix}:session`);
  if (!sessionId) {
    sessionId = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(`${storagePrefix}:session`, sessionId);
  }

  const createFeedback = async (story) => {
    const source = story.querySelector(".source[href]");
    if (!source || !editionDate) return;

    const headline = story.querySelector("h3")?.textContent?.trim() || "Artikel";
    const meta = story.querySelector(".meta span")?.textContent || "";
    const topic = (meta.split("·").slice(1).join("·").trim() || "Sonstiges").slice(0, 80);
    const articleId = source.href;
    const articleHash = await hash(`${editionDate}|${articleId}`);
    const voteKey = `${storagePrefix}:vote:${articleHash}`;

    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.innerHTML = `
      <div class="feedback-copy">
        <b>War diese Meldung relevant?</b>
        <small>Anonym · eine Bewertung je Browser</small>
      </div>
      <div class="feedback-actions">
        <button class="feedback-button" type="button" data-vote="1" aria-pressed="false">👍</button>
        <button class="feedback-button" type="button" data-vote="-1" aria-pressed="false">👎</button>
        <span class="feedback-status" role="status" aria-live="polite"></span>
      </div>`;
    source.insertAdjacentElement("afterend", feedback);

    const buttons = [...feedback.querySelectorAll(".feedback-button")];
    const status = feedback.querySelector(".feedback-status");
    const savedVote = localStorage.getItem(voteKey);
    buttons[0].setAttribute("aria-label", `Meldung relevant: ${headline}`);
    buttons[1].setAttribute("aria-label", `Meldung weniger relevant: ${headline}`);

    const showSaved = (vote) => {
      buttons.forEach((button) => {
        const selected = button.dataset.vote === String(vote);
        button.disabled = true;
        button.setAttribute("aria-pressed", selected ? "true" : "false");
        if (selected) button.classList.add(vote === 1 ? "selected-up" : "selected-down");
      });
      status.textContent = "Gespeichert";
    };

    if (savedVote) {
      showSaved(Number(savedVote));
      return;
    }

    buttons.forEach((button) => button.addEventListener("click", async () => {
      const vote = Number(button.dataset.vote);
      buttons.forEach((item) => item.disabled = true);
      status.textContent = "Speichert …";

      try {
        const sessionHash = await hash(sessionId);
        const response = await fetch(`${SUPABASE_URL}/rest/v1/article_feedback`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({
            article_id: articleId,
            edition_date: editionDate,
            topic,
            vote,
            session_hash: sessionHash
          })
        });

        if (!response.ok) throw new Error(`Feedback request failed: ${response.status}`);
        localStorage.setItem(voteKey, String(vote));
        showSaved(vote);
      } catch (error) {
        buttons.forEach((item) => item.disabled = false);
        status.textContent = "Nicht gespeichert";
        console.warn("KOEPFER feedback:", error);
      }
    }));
  };

  document.querySelectorAll(".story").forEach((story) => createFeedback(story));

  const wishDialog = document.querySelector(".wish-dialog");
  const wishForm = document.querySelector(".wish-form");
  const wishMessage = document.querySelector(".wish-message");
  document.querySelector(".wish-launch")?.addEventListener("click", () => wishDialog?.showModal());
  document.querySelector(".wish-close")?.addEventListener("click", () => wishDialog?.close());

  wishForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = wishForm.querySelector(".wish-submit");
    const direction = document.querySelector("#wish-direction").value;
    const kind = document.querySelector("#wish-kind").value;
    const target = document.querySelector("#wish-target").value.trim().replace(/\s+/g, " ").slice(0, 120);
    if (target.length < 2) return;
    submit.disabled = true;
    wishMessage.textContent = "Speichert …";
    try {
      const sessionHash = await hash(sessionId);
      const requestId = `request://${direction}/${kind}/${encodeURIComponent(target.toLocaleLowerCase("de-DE"))}`;
      const response = await fetch(`${SUPABASE_URL}/rest/v1/article_feedback`, {
        method: "POST",
        headers: {"apikey": SUPABASE_KEY,"Content-Type": "application/json","Prefer": "return=minimal"},
        body: JSON.stringify({article_id:requestId,edition_date:editionDate,topic:`Redaktionswunsch · ${direction} · ${kind} · ${target}`.slice(0, 200),vote:direction === "less" ? -1 : 1,session_hash:sessionHash})
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      wishMessage.textContent = "Gespeichert – wird in der nächsten Ausgabe berücksichtigt.";
      wishForm.reset();
      setTimeout(() => wishDialog.close(), 1600);
    } catch (error) {
      wishMessage.textContent = "Nicht gespeichert – bitte erneut versuchen.";
      console.warn("KOEPFER editorial request:", error);
    } finally {
      submit.disabled = false;
    }
  });
})();
