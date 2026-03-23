(() => {
  const LESSON_STORAGE_KEY = "node-course-completed-lessons";
  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get("lesson") || "";
  let completedLessons = new Set();

  function loadCompletedLessons() {
    try {
      const raw = localStorage.getItem(LESSON_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(parsed);
    } catch {
      return new Set();
    }
  }

  function saveCompletedLessons(set) {
    localStorage.setItem(LESSON_STORAGE_KEY, JSON.stringify(Array.from(set)));
  }

  function renderDoneButton(lesson) {
    const btn = document.getElementById("toggleLessonDoneBtn");
    if (!btn) return;
    const done = completedLessons.has(lesson.id);
    btn.textContent = done ? "Урок пройден ✓" : "Отметить урок пройденным";
    btn.className = done
      ? "rounded-lg border border-emerald-500/50 bg-emerald-500/25 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/35"
      : "rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20";
  }

  function esc(text) {
    return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  function flattenLessons(modules) {
    const list = [];
    modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        list.push({ ...lesson, moduleId: mod.id, moduleTitle: mod.title });
      });
    });
    return list;
  }

  function lessonKeywords(lessonTitle) {
    return lessonTitle
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s.-]/gu, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 5);
  }

  function buildTheory(lesson, prevLesson) {
    const prefix = prevLesson
      ? `Этот урок продолжает тему "${prevLesson.title}" и добавляет новый уровень понимания.`
      : "Это первый шаг в учебной цепочке, поэтому важно пройти его внимательно.";
    return `${prefix} В уроке "${lesson.title}" вы фокусируетесь на конкретном навыке и учитесь применять его сразу в коде и мини-практике.`;
  }

  function buildPractice(lesson) {
    return [
      `Прочитайте название урока и сформулируйте, какой результат хотите получить к концу: "${lesson.title}".`,
      "Запустите пример кода из блока ниже, не меняя его, и убедитесь, что понимаете исходное поведение.",
      "Сделайте 2 маленьких изменения в коде (имя переменной, условие, формат вывода) и сравните результат.",
      "Запишите короткий вывод: что было новым и где этот прием пригодится в реальном проекте."
    ];
  }

  function buildCodeBlocks(lesson) {
    const words = lessonKeywords(lesson.title);
    const topic = words.join(", ") || "nodejs";
    return [
      {
        title: "Шаг 1. Базовая подготовка",
        explanation: "Создаем стартовые данные и показываем тему урока в консоли.",
        code: `const lesson = "${lesson.id} ${lesson.title}";
const topic = "${topic}";
console.log({ lesson, topic });`
      },
      {
        title: "Шаг 2. Мини-логика урока",
        explanation: "Добавляем простую функцию, где тренируем основную идею урока.",
        code: `function runPractice(input) {
  if (!input) return "Нет входных данных";
  return \`Урок: ${lesson.id} -> \${input}\`;
}

console.log(runPractice("${words[0] || "practice"}"));`
      },
      {
        title: "Шаг 3. Проверка результата",
        explanation: "Фиксируем ожидаемый результат простым условием.",
        code: `const result = runPractice("${words[1] || "result"}");
const ok = typeof result === "string" && result.length > 0;
console.log("Проверка:", ok ? "успех" : "ошибка");`
      }
    ];
  }

  function buildQuestions(lesson) {
    return [
      {
        q: `Какова цель урока "${lesson.title}"?`,
        options: ["Освоить конкретный навык и применить его на практике", "Пропустить практику и сразу перейти дальше"],
        answer: 0
      },
      {
        q: "Зачем разбивать код на маленькие блоки?",
        options: ["Чтобы проще понимать и отлаживать каждый шаг", "Чтобы код выглядел длиннее"],
        answer: 0
      },
      {
        q: "Что сделать после изменений в примере?",
        options: ["Проверить, как изменилось поведение программы", "Удалить код без запуска"],
        answer: 0
      }
    ];
  }

  function renderTest(questions) {
    return questions
      .map(
        (item, index) => `
      <fieldset class="rounded-xl border border-slate-700 bg-slate-900/70 p-4" data-answer="${item.answer}">
        <legend class="mb-3 text-sm font-semibold text-cyan-200">${index + 1}. ${esc(item.q)}</legend>
        ${item.options
          .map(
            (opt, optIndex) => `
          <label class="mb-2 flex cursor-pointer items-center gap-2 text-sm text-slate-200">
            <input type="radio" name="q-${index}" value="${optIndex}" class="accent-cyan-400" />
            ${esc(opt)}
          </label>
        `
          )
          .join("")}
        <p class="mt-2 hidden text-xs result"></p>
      </fieldset>
    `
      )
      .join("");
  }

  function renderCodeSections(blocks) {
    return blocks
      .map(
        (section) => `
      <article class="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div class="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 class="text-sm font-semibold text-cyan-200">${esc(section.title)}</h3>
            <p class="mt-1 text-sm text-slate-300">${esc(section.explanation)}</p>
          </div>
          <button class="copy-section-btn rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800">
            Копировать блок
          </button>
        </div>
        <pre class="w-full max-w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4"><code class="language-javascript section-code">${esc(
          section.code
        )}</code></pre>
      </article>
    `
      )
      .join("");
  }

  async function init() {
    completedLessons = loadCompletedLessons();
    const modules = await window.CoursePlan.loadCoursePlan("../tasks/learn.plan.md");
    const allLessons = flattenLessons(modules);
    const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
    if (currentIndex === -1) throw new Error(`Урок ${lessonId} не найден`);

    const lesson = allLessons[currentIndex];
    const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    document.getElementById("breadcrumbs").innerHTML = `
      <a href="../index.html" class="text-cyan-300 hover:text-cyan-200">Главная</a>
      <span class="text-slate-500">/</span>
      <a href="../modules/module-${lesson.moduleId}.html" class="text-cyan-300 hover:text-cyan-200">Модуль ${lesson.moduleId}</a>
      <span class="text-slate-500">/</span>
      <span class="text-slate-100">Урок ${esc(lesson.id)}</span>
    `;

    document.getElementById("lessonTitle").textContent = `${lesson.id} ${lesson.title}`;
    document.getElementById("lessonMeta").textContent = `Модуль ${lesson.moduleId}: ${lesson.moduleTitle} • ${lesson.minutes} минут`;
    const positionText = `Урок ${currentIndex + 1} из ${allLessons.length}`;
    document.getElementById("lessonPosition").textContent = positionText;
    const percent = Math.round(((currentIndex + 1) / allLessons.length) * 100);
    const progressBar = document.getElementById("lessonProgressBar");
    if (progressBar) progressBar.style.width = `${percent}%`;
    renderDoneButton(lesson);
    document.getElementById("theoryText").textContent = buildTheory(lesson, prev);
    document.getElementById("practiceList").innerHTML = buildPractice(lesson)
      .map((p) => `<li>${esc(p)}</li>`)
      .join("");

    const questions = buildQuestions(lesson);
    document.getElementById("testForm").innerHTML = renderTest(questions);

    const codeBlocks = buildCodeBlocks(lesson);
    document.getElementById("codeSections").innerHTML = renderCodeSections(codeBlocks);

    document.getElementById("assignmentText").textContent = `Соберите мини-решение по теме "${lesson.title}" (1 файл + README): опишите цель, входные данные, логику, и добавьте 2 улучшения относительно базового примера.`;

    document.getElementById("lessonNav").innerHTML = `
      <a href="${prev ? `./lesson.html?lesson=${encodeURIComponent(prev.id)}` : `../modules/module-${lesson.moduleId}.html`}" class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
        ${prev ? `← Урок ${prev.id}` : "← К модулю"}
      </a>
      <a href="${next ? `./lesson.html?lesson=${encodeURIComponent(next.id)}` : "../index.html"}" class="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
        ${next ? `Урок ${next.id} →` : "К плану курса →"}
      </a>
    `;

    if (window.hljs) window.hljs.highlightAll();
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.id === "toggleLessonDoneBtn") {
      if (completedLessons.has(lessonId)) completedLessons.delete(lessonId);
      else completedLessons.add(lessonId);
      saveCompletedLessons(completedLessons);
      renderDoneButton({ id: lessonId });
    }

    if (target.classList.contains("copy-section-btn")) {
      const card = target.closest("article");
      const codeEl = card ? card.querySelector(".section-code") : null;
      const code = codeEl ? codeEl.textContent || "" : "";
      navigator.clipboard.writeText(code).then(() => {
        const initial = target.textContent;
        target.textContent = "Скопировано!";
        setTimeout(() => {
          target.textContent = initial || "Копировать блок";
        }, 1200);
      });
    }

    if (target.id === "checkTestBtn") {
      const groups = Array.from(document.querySelectorAll("#testForm fieldset"));
      let correct = 0;

      groups.forEach((group) => {
        const answer = Number(group.dataset.answer);
        const selected = group.querySelector("input[type='radio']:checked");
        const result = group.querySelector(".result");
        if (!result) return;
        result.classList.remove("hidden");
        if (selected && Number(selected.value) === answer) {
          correct += 1;
          result.textContent = "Верно";
          result.className = "mt-2 text-xs result text-emerald-300";
        } else {
          result.textContent = "Неверно";
          result.className = "mt-2 text-xs result text-rose-300";
        }
      });

      const summary = document.getElementById("testSummary");
      summary.textContent = `Результат: ${correct}/${groups.length}`;
      summary.classList.remove("hidden");
    }
  });

  init().catch((error) => {
    document.getElementById("app").innerHTML = `
      <div class="rounded-xl border border-rose-700 bg-rose-950/40 p-4 text-rose-200">
        Ошибка загрузки урока: ${esc(error.message)}
      </div>
    `;
  });
})();
