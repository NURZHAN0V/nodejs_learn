(() => {
  const MODULE_STORAGE_KEY = "node-course-completed-modules";
  const LESSON_STORAGE_KEY = "node-course-completed-lessons";
  const AUDIO_STORAGE_KEY = "node-course-audio-progress-seconds";

  const ui = {
    modules: document.getElementById("statModules"),
    lessons: document.getElementById("statLessons"),
    progress: document.getElementById("statProgress"),
    search: document.getElementById("searchInput"),
    plan: document.getElementById("coursePlan"),
    reset: document.getElementById("resetProgressBtn"),
    audio: document.getElementById("courseAudio"),
    audioPlayBtn: document.getElementById("audioPlayBtn"),
    audioPlayIcon: document.getElementById("audioPlayIcon"),
    audioSeek: document.getElementById("audioSeek"),
    audioTimeText: document.getElementById("audioTimeText"),
    audioVolume: document.getElementById("audioVolume")
  };

  function formatTime(totalSec) {
    const sec = Math.max(0, Math.floor(totalSec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function setupAudioProgress() {
    if (!(ui.audio instanceof HTMLAudioElement)) return;

    const audio = ui.audio;
    const savedSeconds = Number(localStorage.getItem(AUDIO_STORAGE_KEY) || 0);
    let isSeeking = false;

    function updatePlayButton() {
      if (!ui.audioPlayBtn) return;
      if (ui.audioPlayIcon) {
        ui.audioPlayIcon.innerHTML = audio.paused
          ? '<path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.3-6.86a1 1 0 0 0 0-1.66L9.53 4.29A1 1 0 0 0 8 5.14Z"></path>'
          : '<path d="M7 5a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Zm10 0a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Z"></path>';
      }
      ui.audioPlayBtn.setAttribute("aria-label", audio.paused ? "Воспроизвести аудио" : "Поставить на паузу");
    }

    function updateSeekVisual(percent) {
      if (!ui.audioSeek) return;
      const safePercent = Math.max(0, Math.min(100, percent));
      ui.audioSeek.style.background = `linear-gradient(90deg, rgba(34, 211, 238, 0.95) ${safePercent}%, rgba(51, 65, 85, 0.9) ${safePercent}%)`;
    }

    function updateVolumeVisual(volumeValue) {
      if (!ui.audioVolume) return;
      const safePercent = Math.max(0, Math.min(100, volumeValue * 100));
      ui.audioVolume.style.background = `linear-gradient(90deg, rgba(34, 211, 238, 0.95) ${safePercent}%, rgba(51, 65, 85, 0.9) ${safePercent}%)`;
    }

    function updateTimeAndSeek() {
      const current = formatTime(audio.currentTime || 0);
      const total = Number.isFinite(audio.duration) ? formatTime(audio.duration) : "--:--";
      if (ui.audioTimeText) ui.audioTimeText.textContent = `${current} / ${total}`;
      if (ui.audioSeek && !isSeeking && Number.isFinite(audio.duration) && audio.duration > 0) {
        const percent = (audio.currentTime / audio.duration) * 100;
        ui.audioSeek.value = String(percent);
        updateSeekVisual(percent);
      } else {
        updateSeekVisual(0);
      }
    }

    audio.addEventListener("loadedmetadata", () => {
      if (savedSeconds > 0 && savedSeconds < audio.duration) audio.currentTime = savedSeconds;
      updateTimeAndSeek();
      updatePlayButton();
    });

    audio.addEventListener("timeupdate", () => {
      localStorage.setItem(AUDIO_STORAGE_KEY, String(audio.currentTime));
      updateTimeAndSeek();
    });

    audio.addEventListener("ended", () => {
      localStorage.setItem(AUDIO_STORAGE_KEY, "0");
      if (ui.audioTimeText && Number.isFinite(audio.duration)) {
        ui.audioTimeText.textContent = `${formatTime(audio.duration)} / ${formatTime(audio.duration)}`;
      }
      if (ui.audioSeek) ui.audioSeek.value = "0";
      updateSeekVisual(0);
      updatePlayButton();
    });

    audio.addEventListener("play", updatePlayButton);
    audio.addEventListener("pause", updatePlayButton);

    ui.audioPlayBtn?.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();
        } catch {
          if (ui.audioTimeText) ui.audioTimeText.textContent = "Не удалось начать воспроизведение.";
        }
      } else {
        audio.pause();
      }
      updatePlayButton();
    });

    ui.audioSeek?.addEventListener("input", () => {
      isSeeking = true;
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const nextTime = (Number(ui.audioSeek.value) / 100) * audio.duration;
      updateSeekVisual(Number(ui.audioSeek.value));
      if (ui.audioTimeText) {
        ui.audioTimeText.textContent = `${formatTime(nextTime)} / ${formatTime(audio.duration)}`;
      }
    });

    ui.audioSeek?.addEventListener("change", () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        isSeeking = false;
        return;
      }
      const nextTime = (Number(ui.audioSeek.value) / 100) * audio.duration;
      audio.currentTime = nextTime;
      localStorage.setItem(AUDIO_STORAGE_KEY, String(nextTime));
      isSeeking = false;
      updateTimeAndSeek();
    });

    ui.audioVolume?.addEventListener("input", () => {
      audio.volume = Number(ui.audioVolume.value);
      updateVolumeVisual(Number(ui.audioVolume.value));
    });

    audio.addEventListener("error", () => {
      if (ui.audioTimeText) {
        ui.audioTimeText.textContent = "Не удалось загрузить аудио";
      }
    });

    updatePlayButton();
    updateSeekVisual(Number(ui.audioSeek?.value || 0));
    updateVolumeVisual(Number(ui.audioVolume?.value || 1));
    updateTimeAndSeek();
  }

  function getCompletedSet() {
    try {
      const raw = localStorage.getItem(MODULE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(parsed);
    } catch {
      return new Set();
    }
  }

  function saveCompletedSet(set) {
    localStorage.setItem(MODULE_STORAGE_KEY, JSON.stringify(Array.from(set)));
  }

  function getCompletedLessonsSet() {
    try {
      const raw = localStorage.getItem(LESSON_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(parsed);
    } catch {
      return new Set();
    }
  }

  function escapeHtml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function moduleCard(mod, completed, completedLessonsSet) {
    const totalMin = mod.lessons.reduce((sum, l) => sum + l.minutes, 0);
    const doneLessons = mod.lessons.filter((l) => completedLessonsSet.has(l.id)).length;
    const lessonProgress = mod.lessons.length ? Math.round((doneLessons / mod.lessons.length) * 100) : 0;
    return `
      <article class="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-white">${mod.id}. ${escapeHtml(mod.title)}</h2>
            <p class="mt-1 text-sm text-slate-300">
              ${mod.lessons.length} уроков • ${totalMin} минут
            </p>
            <p class="mt-1 text-xs text-cyan-200">
              Прогресс уроков: ${doneLessons}/${mod.lessons.length} (${lessonProgress}%)
            </p>
            <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                class="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                style="width: ${lessonProgress}%"
              ></div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <label class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200">
              <input type="checkbox" class="module-done accent-emerald-400" data-module-id="${mod.id}" ${completed ? "checked" : ""} />
              Пройдено
            </label>
            <a
              href="./modules/module-${mod.id}.html"
              class="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Открыть модуль
            </a>
          </div>
        </div>

        <details class="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <summary class="cursor-pointer text-sm text-cyan-200">Показать уроки</summary>
          <ul class="mt-3 space-y-2 text-sm text-slate-200">
            ${mod.lessons
              .map(
                (lesson) => `
              <li class="flex items-start justify-between gap-4 border-b border-slate-800/70 pb-2">
                <span>${escapeHtml(lesson.id)} ${escapeHtml(lesson.title)}</span>
                <span class="whitespace-nowrap text-slate-400">${lesson.minutes} мин</span>
              </li>
            `
              )
              .join("")}
          </ul>
        </details>
      </article>
    `;
  }

  function renderStats(modules, completedSet, completedLessonsSet) {
    const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const validLessonIds = new Set(modules.flatMap((m) => m.lessons.map((l) => l.id)));
    const completedLessons = Array.from(completedLessonsSet).filter((id) => validLessonIds.has(id)).length;
    const progress = lessonCount ? Math.round((completedLessons / lessonCount) * 100) : 0;

    ui.modules.textContent = String(modules.length);
    ui.lessons.textContent = `${completedLessons}/${lessonCount}`;
    ui.progress.textContent = `${progress}%`;
  }

  function renderPlan(modules, query, completedSet, completedLessonsSet) {
    const term = query.trim().toLowerCase();
    const filtered = !term
      ? modules
      : modules.filter((m) => {
          if (`${m.id}. ${m.title}`.toLowerCase().includes(term)) return true;
          return m.lessons.some((l) => `${l.id} ${l.title}`.toLowerCase().includes(term));
        });

    ui.plan.innerHTML = filtered.map((m) => moduleCard(m, completedSet.has(m.id), completedLessonsSet)).join("");
  }

  async function init() {
    const modules = await window.CoursePlan.loadCoursePlan("./tasks/learn.plan.md");
    const completedSet = getCompletedSet();
    const completedLessonsSet = getCompletedLessonsSet();

    renderStats(modules, completedSet, completedLessonsSet);
    renderPlan(modules, "", completedSet, completedLessonsSet);

    ui.search.addEventListener("input", () => {
      renderPlan(modules, ui.search.value, completedSet, completedLessonsSet);
    });

    ui.plan.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || !target.classList.contains("module-done")) return;
      const id = Number(target.dataset.moduleId);
      if (target.checked) completedSet.add(id);
      else completedSet.delete(id);
      saveCompletedSet(completedSet);
      renderStats(modules, completedSet, completedLessonsSet);
    });

    ui.reset.addEventListener("click", () => {
      completedSet.clear();
      saveCompletedSet(completedSet);
      localStorage.removeItem(LESSON_STORAGE_KEY);
      completedLessonsSet.clear();
      renderStats(modules, completedSet, completedLessonsSet);
      renderPlan(modules, ui.search.value, completedSet, completedLessonsSet);
    });

    setupAudioProgress();
  }

  init().catch((error) => {
    ui.plan.innerHTML = `
      <div class="rounded-xl border border-rose-700 bg-rose-950/40 p-4 text-rose-200">
        Ошибка загрузки плана курса: ${error.message}
      </div>
    `;
  });
})();
