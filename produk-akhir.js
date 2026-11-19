/* =====================================================================
   MODUL PRODUK AKHIR: RAKAMAN VIDEO MURID & SEMAKAN GURU
   Akademi Bahasa Pokemon · Bahasa Melayu Tahun 4
   ===================================================================== */
(function () {
  "use strict";

  const DB_NAME = "AkademiPokemon_ProdukAkhir_DB";
  const STORE_NAME = "video_submissions";
  const DB_VERSION = 1;

  let mediaStream = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let recordedBlob = null;
  let recordedUrl = null;
  let isRecording = false;
  let timerInterval = null;
  let secondsElapsed = 0;
  let activeStudentId = null;

  /* ---------- INJEK GAYA CSS KHUSUS PRODUK AKHIR ---------- */
  function injectStyles() {
    if (document.getElementById("pa-styles")) return;
    const style = document.createElement("style");
    style.id = "pa-styles";
    style.textContent = `
      .pa-overlay {
        position: fixed;
        inset: 0;
        z-index: 90;
        background: linear-gradient(180deg, #101b38 0%, #1c3566 55%, #24578a 100%);
        overflow-y: auto;
        padding: 1rem 1rem 3rem;
        animation: pop .25s ease-out;
      }
      .pa-container {
        max-width: 1060px;
        margin: 0 auto;
      }
      .pa-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: .8rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .pa-badge-pill {
        display: inline-block;
        padding: .2rem .75rem;
        border: 2px solid var(--ink);
        border-radius: 99px;
        background: var(--gold);
        color: var(--ink);
        font-size: .8rem;
        font-weight: 800;
      }

      /* SUSUN ATUR NORMAL VS SEDANG MERAKAM (ARAHAN MENGECIL DI SISI) */
      .pa-workspace {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.1rem;
        transition: all .25s ease;
      }
      .pa-workspace.recording-mode {
        grid-template-columns: minmax(0, 1.65fr) minmax(260px, 0.85fr);
        align-items: start;
      }

      .pa-guide-card {
        background: #fffdf4;
        border: 4px solid var(--ink);
        border-radius: 20px;
        padding: 1.1rem 1.2rem;
        box-shadow: 0 7px 0 rgba(10,18,38,.4);
        transition: all .25s ease;
      }
      .pa-workspace.recording-mode .pa-guide-card {
        position: sticky;
        top: 12px;
        padding: .85rem .95rem;
        font-size: .86rem;
        background: #fff9db;
      }
      .pa-workspace.recording-mode .pa-guide-card h2 {
        font-size: 1rem;
      }
      .pa-task-list {
        margin: .5rem 0 0;
        padding-left: 1.25rem;
      }
      .pa-task-list li {
        margin-bottom: .4rem;
      }
      .pa-rubric-note {
        margin-top: .65rem;
        padding: .55rem .75rem;
        background: #e8f1ff;
        border: 2px dashed var(--pri);
        border-radius: 12px;
        font-size: .85rem;
      }
      .pa-workspace.recording-mode .pa-rubric-note {
        font-size: .78rem;
        padding: .45rem .6rem;
      }

      .pa-studio-card {
        background: var(--paper);
        border: 4px solid var(--ink);
        border-radius: 20px;
        padding: 1.15rem;
        box-shadow: 0 7px 0 rgba(10,18,38,.4);
      }
      .pa-video-stage {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        background: #0b1326;
        border: 4px solid var(--ink);
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .pa-video-stage video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #000;
      }
      .pa-video-stage video.mirror {
        transform: scaleX(-1);
      }
      .pa-rec-indicator {
        position: absolute;
        top: 12px;
        left: 12px;
        display: none;
        align-items: center;
        gap: .45rem;
        padding: .3rem .75rem;
        background: rgba(16, 28, 54, .88);
        color: #fff;
        border: 2px solid #ef3e4a;
        border-radius: 99px;
        font: 400 .65rem "Press Start 2P", monospace;
        z-index: 5;
      }
      .pa-rec-indicator.active {
        display: inline-flex;
      }
      .pa-rec-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ef3e4a;
        animation: blinkDot 1s infinite;
      }
      @keyframes blinkDot { 50% { opacity: .2; } }

      .pa-controls {
        display: flex;
        flex-wrap: wrap;
        gap: .65rem;
        margin-top: .95rem;
        align-items: center;
      }
      .pa-btn-rec {
        background: linear-gradient(180deg, #ff6b76, #ef3e4a);
        color: #fff;
      }
      .pa-btn-send {
        background: linear-gradient(180deg, #5cf297, #28b862);
        color: #fff;
      }
      .pa-status {
        margin-top: .75rem;
        padding: .6rem .85rem;
        border-radius: 12px;
        background: #eef4ff;
        border: 2px solid var(--ink);
        font-size: .92rem;
      }

      /* KAD HANTARAN TERDAHULU MURID & PAPARAN GURU */
      .pa-saved-box {
        margin-top: 1.1rem;
        padding: 1rem;
        background: #f0fff5;
        border: 3px solid var(--ink);
        border-radius: 16px;
      }
      .pa-saved-video {
        width: 100%;
        max-width: 560px;
        border: 3px solid var(--ink);
        border-radius: 14px;
        margin-top: .6rem;
        background: #000;
      }
      .pa-teacher-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: .8rem;
      }
      .pa-teacher-item {
        background: #f4f8ff;
        border: 3px solid var(--ink);
        border-radius: 16px;
        padding: .9rem;
      }
      .pa-teacher-item video {
        width: 100%;
        border: 3px solid var(--ink);
        border-radius: 12px;
        margin-top: .55rem;
        background: #000;
      }

      @media (max-width: 780px) {
        .pa-workspace.recording-mode {
          grid-template-columns: 1fr;
        }
        .pa-workspace.recording-mode .pa-guide-card {
          position: static;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /* ---------- INDEXEDDB UNTUK MENYIMPAN FAIL VIDEO ---------- */
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: "studentId" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function saveSubmission(record) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getSubmission(studentId) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(studentId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function getAllSubmissions() {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /* ---------- KAWALAN KAMERA & RAKAMAN ---------- */
  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function stopCameraStream() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }
    isRecording = false;
  }

  async function initCamera() {
    const previewEl = document.getElementById("pa-preview");
    const statusEl = document.getElementById("pa-status");
    const recBtn = document.getElementById("pa-btn-rec");
    if (!previewEl) return;

    try {
      stopCameraStream();
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      previewEl.srcObject = mediaStream;
      previewEl.muted = true;
      previewEl.controls = false;
      previewEl.classList.add("mirror");
      await previewEl.play();

      if (recBtn) recBtn.disabled = false;
      if (statusEl) {
        statusEl.innerHTML = "✅ <b>Kamera & mikrofon bersedia.</b> Baca arahan tugasan, kemudian tekan <b>🔴 Mula Rakam</b>.";
      }
    } catch (err) {
      if (recBtn) recBtn.disabled = true;
      if (statusEl) {
        statusEl.innerHTML = "⚠️ <b>Kamera tidak dapat diakses.</b> Sila benarkan kebenaran Kamera & Mikrofon pada pelayar anda dan muat semula paparan ini.";
      }
    }
  }

  function startRecording() {
    if (!mediaStream || isRecording) return;

    recordedChunks = [];
    recordedBlob = null;
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      recordedUrl = null;
    }

    const mimeOptions = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4"
    ];
    const supportedMime = mimeOptions.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || "";

    try {
      mediaRecorder = supportedMime
        ? new MediaRecorder(mediaStream, { mimeType: supportedMime })
        : new MediaRecorder(mediaStream);
    } catch (e) {
      mediaRecorder = new MediaRecorder(mediaStream);
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const type = mediaRecorder.mimeType || "video/webm";
      recordedBlob = new Blob(recordedChunks, { type });
      recordedUrl = URL.createObjectURL(recordedBlob);

      const previewEl = document.getElementById("pa-preview");
      if (previewEl) {
        stopCameraStream();
        previewEl.srcObject = null;
        previewEl.src = recordedUrl;
        previewEl.muted = false;
        previewEl.controls = true;
        previewEl.classList.remove("mirror");
      }

      const workspace = document.getElementById("pa-workspace");
      if (workspace) workspace.classList.remove("recording-mode");

      const recBadge = document.getElementById("pa-rec-indicator");
      if (recBadge) recBadge.classList.remove("active");

      updateButtonsAfterStop();
    };

    mediaRecorder.start(250);
    isRecording = true;
    secondsElapsed = 0;

    // Kecilkan panel arahan ke sisi secara automatik semasa merakam
    const workspace = document.getElementById("pa-workspace");
    if (workspace) workspace.classList.add("recording-mode");

    const recBadge = document.getElementById("pa-rec-indicator");
    const timerText = document.getElementById("pa-timer");
    if (recBadge) recBadge.classList.add("active");
    if (timerText) timerText.textContent = "00:00";

    timerInterval = setInterval(() => {
      secondsElapsed++;
      if (timerText) timerText.textContent = formatTime(secondsElapsed);
    }, 1000);

    document.getElementById("pa-btn-rec").style.display = "none";
    document.getElementById("pa-btn-stop").style.display = "inline-block";
    document.getElementById("pa-btn-retake").style.display = "none";
    document.getElementById("pa-btn-download").style.display = "none";
    document.getElementById("pa-btn-send").style.display = "none";

    const statusEl = document.getElementById("pa-status");
    if (statusEl) {
      statusEl.innerHTML = "🎬 <b>Sedang merakam...</b> Rujuk panel arahan di sisi. Tekan <b>⏹️ Henti Rakam</b> apabila selesai.";
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
    }
  }

  function updateButtonsAfterStop() {
    document.getElementById("pa-btn-rec").style.display = "none";
    document.getElementById("pa-btn-stop").style.display = "none";
    document.getElementById("pa-btn-retake").style.display = "inline-block";
    document.getElementById("pa-btn-download").style.display = "inline-block";
    document.getElementById("pa-btn-send").style.display = "inline-block";

    const statusEl = document.getElementById("pa-status");
    if (statusEl) {
      statusEl.innerHTML = "🎉 <b>Rakaman selesai!</b> Semak video anda di atas. Anda boleh <b>⬇️ Muat Turun</b> atau terus klik <b>📤 Hantar kepada Guru</b>.";
    }
  }

  async function retakeVideo() {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      recordedUrl = null;
    }
    recordedBlob = null;

    document.getElementById("pa-btn-rec").style.display = "inline-block";
    document.getElementById("pa-btn-stop").style.display = "none";
    document.getElementById("pa-btn-retake").style.display = "none";
    document.getElementById("pa-btn-download").style.display = "none";
    document.getElementById("pa-btn-send").style.display = "none";

    await initCamera();
  }

  function downloadVideo() {
    if (!recordedBlob || !recordedUrl) return;
    const me = window.db && window.db.students.find((s) => s.id === activeStudentId);
    const safeName = (me ? me.n : "Murid").replace(/[^a-zA-Z0-9_-]/g, "_");
    const ext = recordedBlob.type.includes("mp4") ? "mp4" : "webm";

    const a = document.createElement("a");
    a.href = recordedUrl;
    a.download = `Produk_Akhir_${safeName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function submitToTeacher() {
    if (!recordedBlob || !activeStudentId) return;
    const me = window.db && window.db.students.find((s) => s.id === activeStudentId);
    if (!me) return;

    const sendBtn = document.getElementById("pa-btn-send");
    if (sendBtn) sendBtn.disabled = true;

    try {
      await saveSubmission({
        studentId: me.id,
        teacherId: me.t,
        studentName: me.n,
        studentClass: me.c,
        blob: recordedBlob,
        mimeType: recordedBlob.type || "video/webm",
        durationSec: secondsElapsed,
        submittedAt: new Date().toLocaleString("ms-MY")
      });

      const statusEl = document.getElementById("pa-status");
      if (statusEl) {
        statusEl.innerHTML = "✅ <b>Berjaya dihantar kepada guru!</b> Guru anda boleh menonton video ini apabila log masuk ke akaun guru.";
      }
      await renderExistingSubmission();
    } catch (err) {
      alert("Gagal menyimpan video. Pastikan ruang storan pelayar mencukupi.");
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  async function renderExistingSubmission() {
    const holder = document.getElementById("pa-existing-holder");
    if (!holder || !activeStudentId) return;

    const existing = await getSubmission(activeStudentId);
    if (!existing || !existing.blob) {
      holder.innerHTML = "";
      return;
    }

    const oldUrl = URL.createObjectURL(existing.blob);
    holder.innerHTML = `
      <div class="pa-saved-box">
        <span class="pa-badge-pill">✅ Produk Akhir Telah Dihantar</span>
        <h3 style="margin:.4rem 0 .2rem">Video Anda yang Telah Dihantar kepada Guru</h3>
        <small class="mut">Dihantar pada: ${existing.submittedAt} · Tempoh: ${formatTime(existing.durationSec || 0)}</small><br>
        <video class="pa-saved-video" src="${oldUrl}" controls></video>
        <div style="margin-top:.6rem">
          <a href="${oldUrl}" download="Hantaran_Produk_Akhir.webm"><button type="button" class="ghost">⬇️ Muat Turun Video Dihantar</button></a>
        </div>
      </div>
    `;
  }

  /* ---------- BUKA PAPARAN PRODUK AKHIR MURID ---------- */
  async function open() {
    injectStyles();
    if (!window.S || window.S.role !== "murid") return;
    activeStudentId = window.S.id;
    const me = window.db && window.db.students.find((s) => s.id === activeStudentId);

    let overlay = document.getElementById("pa-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "pa-overlay";
      overlay.className = "pa-overlay";
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="pa-container">
        <div class="pa-topbar">
          <div>
            <span class="pa-badge-pill">🎥 TUGASAN PRODUK AKHIR</span>
            <h1 style="font-size:1.35rem;margin-top:.3rem">Studio Rakaman Akademi Bahasa Pokémon</h1>
          </div>
          <button type="button" class="ghost" id="pa-btn-close">⬅ Kembali ke Peta Misi</button>
        </div>

        <div class="pa-workspace" id="pa-workspace">
          <!-- STUDIO KAMERA & RAKAMAN -->
          <div class="pa-studio-card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.6rem;flex-wrap:wrap;gap:.5rem">
              <b>📹 Kamera Rakaman (${me ? me.n : "Murid"})</b>
              <span class="tag">DSKP BM Tahun 4 · SK 5.2</span>
            </div>

            <div class="pa-video-stage">
              <div class="pa-rec-indicator" id="pa-rec-indicator">
                <span class="pa-rec-dot"></span>
                <span>REC <span id="pa-timer">00:00</span></span>
              </div>
              <video id="pa-preview" playsinline></video>
            </div>

            <div class="pa-controls">
              <button type="button" class="pa-btn-rec" id="pa-btn-rec" disabled>🔴 Mula Rakam</button>
              <button type="button" class="danger" id="pa-btn-stop" style="display:none">⏹️ Henti Rakam</button>
              <button type="button" class="ghost" id="pa-btn-retake" style="display:none">🔄 Rakam Semula</button>
              <button type="button" class="ghost" id="pa-btn-download" style="display:none">⬇️ Muat Turun Video</button>
              <button type="button" class="pa-btn-send" id="pa-btn-send" style="display:none">📤 Hantar kepada Guru</button>
            </div>

            <div class="pa-status" id="pa-status">⏳ Sedang menyambung ke kamera dan mikrofon...</div>
            <div id="pa-existing-holder"></div>
          </div>

          <!-- ARAHAN TUGASAN (SENTIASA TERBUKA & MENGECIL DI SISI BILA RAKAM) -->
          <aside class="pa-guide-card" id="pa-guide-card">
            <span class="tag ok">📌 Arahan Tugasan Murid</span>
            <h2 style="margin:.4rem 0 .3rem">Soalan &amp; Panduan Video Penerangan</h2>
            <p style="margin:0 0 .4rem">Sila rakam video penerangan ringkas anda berdasarkan dua objektif berikut:</p>
            <ol class="pa-task-list">
              <li><b>Nyatakan jenis-jenis kata berimbuhan</b> (awalan, akhiran, apitan) serta <b>jenis kata majmuk</b> (kata majmuk bebas dan kata majmuk mantap) dengan betul.</li>
              <li><b>Bina beberapa ayat lengkap</b> secara lisan menggunakan contoh <b>kata berimbuhan</b> dan <b>kata majmuk</b> tersebut.</li>
            </ol>
            <div class="pa-rubric-note">
              💡 <b>Tip Jurulatih:</b> Mulakan dengan ucapan salam dan nama anda. Bercakap dengan jelas menghadap kamera. Panel arahan ini akan kekal terbuka di sisi semasa anda merakam!
            </div>
          </aside>
        </div>
      </div>
    `;

    document.getElementById("pa-btn-close").onclick = close;
    document.getElementById("pa-btn-rec").onclick = startRecording;
    document.getElementById("pa-btn-stop").onclick = stopRecording;
    document.getElementById("pa-btn-retake").onclick = retakeVideo;
    document.getElementById("pa-btn-download").onclick = downloadVideo;
    document.getElementById("pa-btn-send").onclick = submitToTeacher;

    await renderExistingSubmission();
    await initCamera();
  }

  function close() {
    stopCameraStream();
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      recordedUrl = null;
    }
    const overlay = document.getElementById("pa-overlay");
    if (overlay) overlay.remove();
  }

  /* ---------- PAPARAN VIDEO HANTARAN MURID DALAM HALAMAN GURU ---------- */
  async function renderTeacherSection(teacherId) {
    injectStyles();
    const container = document.getElementById("teacher-video-submissions");
    if (!container) return;

    const all = await getAllSubmissions();
    const mine = all.filter((item) => item.teacherId === teacherId);

    if (!mine.length) {
      container.innerHTML = `
        <div class="card">
          <h2>🎥 Hasil Produk Akhir Murid (Video)</h2>
          <p class="mut">Belum ada murid yang menghantar video rakaman produk akhir setakat ini.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="card">
        <h2>🎥 Hasil Produk Akhir Murid <span class="tag ok">${mine.length} video dihantar</span></h2>
        <p class="mut">Tonton pembentangan video kata berimbuhan dan kata majmuk yang dihantar oleh murid anda.</p>
        <div class="pa-teacher-grid">
          ${mine.map((item) => {
            const vidUrl = URL.createObjectURL(item.blob);
            return `
              <div class="pa-teacher-item">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;flex-wrap:wrap">
                  <b>🎒 ${item.studentName}</b>
                  <span class="tag">${item.studentClass}</span>
                </div>
                <small class="mut">Dihantar: ${item.submittedAt} · Tempoh: ${formatTime(item.durationSec || 0)}</small>
                <video src="${vidUrl}" controls></video>
                <div style="margin-top:.55rem">
                  <a href="${vidUrl}" download="Produk_Akhir_${item.studentName.replace(/\s+/g, "_")}.webm">
                    <button type="button" class="ghost">⬇️ Muat Turun Video Murid</button>
                  </a>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  window.ProdukAkhir = {
    open,
    close,
    renderTeacherSection
  };
})();
