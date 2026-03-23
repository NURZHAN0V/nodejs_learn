(() => {
  const MODULE_STORAGE_KEY = "node-course-completed-modules";
  const LESSON_STORAGE_KEY = "node-course-completed-lessons";

  const ui = {
    modules: document.getElementById("statModules"),
    lessons: document.getElementById("statLessons"),
    progress: document.getElementById("statProgress"),
    search: document.getElementById("searchInput"),
    plan: document.getElementById("coursePlan"),
    reset: document.getElementById("resetProgressBtn")
  };

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
  }

  init().catch((error) => {
    ui.plan.innerHTML = `
      <div class="rounded-xl border border-rose-700 bg-rose-950/40 p-4 text-rose-200">
        Ошибка загрузки плана курса: ${error.message}
      </div>
    `;
  });
})();
