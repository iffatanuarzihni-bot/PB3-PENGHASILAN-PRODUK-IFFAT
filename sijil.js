/* =====================================================================
   MODUL SIJIL PENCAPAIAN MURID (sijil.js)
   Menjana sijil digital & muat turun PNG apabila semua level/soalan selesai.
   ===================================================================== */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const esc = (s) =>
    String(s || "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  function getTeacherName(student, dbObj) {
    if (!student || !dbObj || !Array.isArray(dbObj.teachers)) return "Guru Pembimbing";
    const t = dbObj.teachers.find((x) => x.id === student.t);
    return t ? t.n : "Guru Pembimbing";
  }

  function getNeed(L) {
    return Math.ceil(((L && (L.n || (L.q && L.q.length))) || 3) * 2 / 3);
  }

  function isAllCompleted(student, lessons) {
    if (!student || !student.p || !Array.isArray(lessons) || !lessons.length) return false;
    return lessons.every((L) => {
      const rec = student.p[L.id];
      return rec && typeof rec.s === "number" && rec.s >= getNeed(L);
    });
  }

  function buildAchievementSummary(student, lessons) {
    let totalScore = 0;
    let totalMax = 0;
    const badges = [];
    lessons.forEach((L) => {
      const rec = student.p && student.p[L.id];
      if (rec) {
        totalScore += rec.s || 0;
        totalMax += rec.t || L.n || 3;
      }
      if (L.badge) badges.push(L.badge);
    });
    const pct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 100;
    return {
      totalScore,
      totalMax,
      pct,
      completedCount: lessons.length,
      badges
    };
  }

  function renderBanner(student, lessons, dbObj) {
    const completed = isAllCompleted(student, lessons);
    const teacherName = getTeacherName(student, dbObj);
    const sum = buildAchievementSummary(student, lessons);

    if (!completed) {
      return `
        <div class="card" id="sijil-status-card" style="border-style:dashed;background:#f8faff">
          <div class="stage" style="gap:.8rem">
            <div style="font-size:2.4rem">📜</div>
            <div class="grow">
              <h2 style="margin:0">Sijil Tamat Semua Level &amp; Soalan</h2>
              <p class="mut" style="margin:.2rem 0 0">
                Lengkapkan semua ${lessons.length} level (${sum.completedCount}/${lessons.length} selesai) untuk membuka kunci dan memuat turun sijil rasmi atas nama <b>${esc(student.n)}</b> (${esc(student.c)} · Guru: <b>${esc(teacherName)}</b>).
              </p>
            </div>
            <span class="tag">Terkunci 🔒</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="card" id="sijil-unlocked-card" style="background:linear-gradient(135deg,#fffbe0 0%,#ffffff 65%,#e7f6ff 100%);border-width:4px">
        <div class="stage" style="gap:1rem">
          <div style="font-size:2.7rem">🏅</div>
          <div class="grow">
            <span class="tag ok">Semua Level &amp; Soalan Selesai!</span>
            <h2 style="margin:.35rem 0 .2rem">Tahniah! Sijil Pencapaian Anda Tersedia</h2>
            <p class="mut" style="margin:0">
              <b>${esc(student.n)}</b> (${esc(student.c)}) · Guru: <b>${esc(teacherName)}</b> · Pencapaian: <b>${sum.totalScore}/${sum.totalMax} (${sum.pct}%)</b>
            </p>
          </div>
          <div class="stage-actions">
            <button onclick="SijilModul.openModal()">📜 Lihat &amp; Muat Turun Sijil</button>
          </div>
        </div>
      </div>
    `;
  }

  function drawCertificateCanvas(canvas, student, teacherName, sum) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#fffdf4");
    grad.addColorStop(0.5, "#fff8d6");
    grad.addColorStop(1, "#eaf3ff");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#101c36";
    ctx.lineWidth = 14;
    ctx.strokeRect(24, 24, w - 48, h - 48);

    ctx.strokeStyle = "#e0a800";
    ctx.lineWidth = 5;
    ctx.strokeRect(42, 42, w - 84, h - 84);

    ctx.fillStyle = "#192b4d";
    ctx.textAlign = "center";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("POKÉMON ACADEMY · DUNIA PEMBELAJARAN BAHASA MELAYU", w / 2, 105);

    ctx.fillStyle = "#d93645";
    ctx.font = "bold 46px Georgia, serif";
    ctx.fillText("SIJIL PENCAPAIAN", w / 2, 168);

    ctx.fillStyle = "#5d6c89";
    ctx.font = "600 20px sans-serif";
    ctx.fillText("Dengan ini disahkan bahawa murid berikut telah menamatkan semua level & soalan:", w / 2, 215);

    ctx.fillStyle = "#101c36";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText(student.n || "Murid", w / 2, 278);

    ctx.strokeStyle = "#101c36";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.22, 296);
    ctx.lineTo(w * 0.78, 296);
    ctx.stroke();

    ctx.fillStyle = "#192b4d";
    ctx.font = "bold 23px sans-serif";
    ctx.fillText("Kelas: " + (student.c || "-"), w / 2, 342);
    ctx.fillText("Guru Pembimbing: " + (teacherName || "-"), w / 2, 378);

    ctx.fillStyle = "#11572b";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(
      "Pencapaian: Tamat Semua Level · Skor " + sum.totalScore + "/" + sum.totalMax + " (" + sum.pct + "%)",
      w / 2,
      428
    );

    if (sum.badges && sum.badges.length) {
      ctx.fillStyle = "#3c4f6e";
      ctx.font = "600 18px sans-serif";
      ctx.fillText("Lencana & Gelaran: " + sum.badges.join(" | "), w / 2, 466);
    }

    const today = new Date().toLocaleDateString("ms-MY", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    ctx.fillStyle = "#5d6c89";
    ctx.font = "600 17px sans-serif";
    ctx.fillText("Tarikh Pengesahan: " + today, w / 2, 525);
  }

  function openModal() {
    const dbObj = window.db;
    const sess = window.S;
    const lessonsList = window.LESSONS || [];
    if (!dbObj || !sess) return;
    const student = dbObj.students.find((s) => s.id === sess.id);
    if (!student) return;

    const teacherName = getTeacherName(student, dbObj);
    const sum = buildAchievementSummary(student, lessonsList);

    const existing = $("#sijilModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "sijilModal";
    modal.style.cssText =
      "position:fixed;inset:0;z-index:250;background:rgba(10,18,38,.75);display:flex;align-items:center;justify-content:center;padding:1rem;overflow-y:auto";

    modal.innerHTML = `
      <div class="card" style="max-width:780px;width:100%;margin:auto;text-align:center">
        <span class="tag ok">Sijil Rasmi Pencapaian</span>
        <h2 style="margin:.4rem 0 1rem">Sijil Tamat Semua Level &amp; Soalan</h2>

        <div style="border:4px solid var(--ink);border-radius:18px;padding:1.4rem;background:linear-gradient(135deg,#fffdf4,#fff7cf);margin-bottom:1rem;text-align:center">
          <p class="mut" style="margin:0;font-weight:800">POKÉMON ACADEMY · BAHASA MELAYU</p>
          <h2 style="font-size:1.7rem;color:#c92a37;margin:.3rem 0">SIJIL PENCAPAIAN</h2>
          <p style="margin:.4rem 0">Dianugerahkan kepada:</p>
          <div style="font-size:1.6rem;font-weight:800;color:var(--ink);border-bottom:2px solid var(--ink);display:inline-block;padding:0 1.2rem .2rem">${esc(student.n)}</div>
          <p style="margin:.75rem 0 .2rem"><b>Kelas:</b> ${esc(student.c)}</p>
          <p style="margin:.2rem 0"><b>Guru:</b> ${esc(teacherName)}</p>
          <p style="margin:.4rem 0"><b>Pencapaian:</b> Tamat Semua ${lessonsList.length} Level &amp; Soalan (${sum.totalScore}/${sum.totalMax} · ${sum.pct}%)</p>
          <p class="mut" style="margin:.3rem 0 0;font-size:.92rem">${esc(sum.badges.join(" · "))}</p>
        </div>

        <canvas id="sijilCanvas" width="1200" height="620" style="display:none"></canvas>

        <div style="display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap">
          <button id="btnDownloadSijil">⬇ Muat Turun Sijil (PNG)</button>
          <button class="ghost" id="btnCloseSijil">Tutup</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const canvas = $("#sijilCanvas");
    drawCertificateCanvas(canvas, student, teacherName, sum);

    $("#btnDownloadSijil").onclick = () => {
      const link = document.createElement("a");
      const safeName = String(student.n || "murid").toLowerCase().replace(/[^a-z0-9]+/g, "_");
      link.download = "sijil_pencapaian_" + safeName + ".png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    $("#btnCloseSijil").onclick = () => modal.remove();
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  window.SijilModul = {
    isAllCompleted,
    renderBanner,
    openModal
  };
})();SijilModul
