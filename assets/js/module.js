(() => {
  const params = new URLSearchParams(window.location.search);
  const moduleId = Number(params.get("id")) || Number(document.body.dataset.moduleId);

  const topicMap = {
    1: "основы Node.js и роль backend",
    2: "настройка окружения разработки",
    3: "базовый runtime Node.js и модули",
    4: "внутреннее устройство Node.js и event loop",
    5: "параллелизм и worker threads",
    6: "движок V8 и память",
    7: "npm и управление пакетами",
    8: "CLI приложение и интеграции",
    9: "REST API на ExpressJS",
    10: "TypeScript в Node.js проектах",
    11: "первые архитектурные решения",
    12: "dependency injection и IoC",
    13: "отладка и автоматизация разработки",
    14: "улучшение архитектуры приложения",
    15: "работа с базой данных и Prisma",
    16: "JWT авторизация и middleware",
    17: "unit и e2e тестирование",
    18: "закрепление и финальная оценка",
    19: "командная разработка и Scrum"
  };

  function esc(text) {
    return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  function codeBlocks(mod) {
    const commonTheory = `// Модуль ${mod.id}: ${mod.title}`;
    const blocksByModule = {
      1: [
        { title: "Шаг 1. Проверка версии Node.js", explanation: "Сначала убеждаемся, что среда готова.", code: `${commonTheory}\nconsole.log(process.version);` },
        { title: "Шаг 2. Первый скрипт", explanation: "Знакомимся с запуском обычного файла.", code: `const name = "Node.js";\nconsole.log(\`Привет, \${name}!\`);` },
        { title: "Шаг 3. Аргументы запуска", explanation: "Понимаем, как передавать данные в программу.", code: `const user = process.argv[2] || "гость";\nconsole.log(\`Пользователь: \${user}\`);` }
      ],
      2: [
        { title: "Шаг 1. Конфиг окружения", explanation: "Храним порт в переменной окружения.", code: `const PORT = Number(process.env.PORT || 3000);\nconsole.log({ PORT });` },
        { title: "Шаг 2. Структура скриптов", explanation: "Минимальная структура команд npm.", code: `{\n  "scripts": {\n    "dev": "node src/app.js",\n    "start": "node src/app.js"\n  }\n}` },
        { title: "Шаг 3. Проверка команды", explanation: "Удобно быстро проверять dev-режим.", code: `// package.json\n// npm run dev` }
      ],
      3: [
        { title: "Шаг 1. CommonJS", explanation: "Классический формат модулей Node.js.", code: `// math.cjs\nmodule.exports.sum = (a, b) => a + b;` },
        { title: "Шаг 2. Использование CommonJS", explanation: "Подключаем функции через require.", code: `const { sum } = require("./math.cjs");\nconsole.log(sum(2, 3));` },
        { title: "Шаг 3. ES Modules", explanation: "Современный формат import/export.", code: `// math.mjs\nexport const sum = (a, b) => a + b;` }
      ],
      4: [
        { title: "Шаг 1. Call stack", explanation: "Показывает порядок синхронного выполнения.", code: `console.log("A");\nconsole.log("B");\nconsole.log("C");` },
        { title: "Шаг 2. Microtask", explanation: "Promise.then выполняется раньше setTimeout.", code: `setTimeout(() => console.log("timeout"), 0);\nPromise.resolve().then(() => console.log("promise"));` },
        { title: "Шаг 3. Event loop", explanation: "Собираем пример в одну картину.", code: `console.log("start");\nsetTimeout(() => console.log("timer"), 0);\nPromise.resolve().then(() => console.log("microtask"));\nconsole.log("end");` }
      ],
      5: [
        { title: "Шаг 1. Worker файл", explanation: "В воркере выполняем тяжелую задачу.", code: `// worker.js\nconst { parentPort } = require("node:worker_threads");\nparentPort.postMessage("done");` },
        { title: "Шаг 2. Запуск worker", explanation: "Главный поток не блокируется.", code: `const { Worker } = require("node:worker_threads");\nnew Worker("./worker.js").on("message", console.log);` },
        { title: "Шаг 3. Практика", explanation: "Передаем данные в worker через workerData.", code: `new Worker("./worker.js", { workerData: { limit: 1_000_000 } });` }
      ],
      6: [
        { title: "Шаг 1. Память процесса", explanation: "Смотрим базовые метрики использования памяти.", code: `const used = process.memoryUsage();\nconsole.log(used.heapUsed);` },
        { title: "Шаг 2. Тайминг кода", explanation: "Быстро измеряем время выполнения.", code: `console.time("calc");\nfor (let i = 0; i < 1e6; i++) {}\nconsole.timeEnd("calc");` },
        { title: "Шаг 3. Наблюдение", explanation: "Регулярно логируем состояние приложения.", code: `setInterval(() => console.log(process.memoryUsage().rss), 5000);` }
      ],
      7: [
        { title: "Шаг 1. package.json", explanation: "Минимальные поля проекта npm.", code: `{\n  "name": "node-course-app",\n  "version": "1.0.0",\n  "type": "module"\n}` },
        { title: "Шаг 2. Скрипты", explanation: "Описываем команды для запуска и теста.", code: `{\n  "scripts": {\n    "start": "node src/index.js",\n    "test": "node --test"\n  }\n}` },
        { title: "Шаг 3. Версии зависимостей", explanation: "Фиксируем версии для стабильной сборки.", code: `npm install express@latest\nnpm install -D eslint@latest` }
      ],
      8: [
        { title: "Шаг 1. Чтение аргументов CLI", explanation: "Пользователь передает город через флаг.", code: `const city = process.argv[2] || "Moscow";\nconsole.log({ city });` },
        { title: "Шаг 2. Запрос к API", explanation: "Получаем данные о погоде.", code: `const res = await fetch("https://api.example.com/weather");\nconst data = await res.json();` },
        { title: "Шаг 3. Вывод результата", explanation: "Показываем температуру в терминале.", code: `console.log(\`Температура: \${data.temp}°C\`);` }
      ],
      9: [
        { title: "Шаг 1. Базовый Express", explanation: "Создаем HTTP API на Express.", code: `import express from "express";\nconst app = express();` },
        { title: "Шаг 2. Роут", explanation: "Описываем endpoint для клиента.", code: `app.get("/health", (req, res) => {\n  res.json({ ok: true });\n});` },
        { title: "Шаг 3. Запуск сервера", explanation: "Поднимаем API на порту.", code: `app.listen(3000, () => console.log("API ready"));` }
      ],
      10: [
        { title: "Шаг 1. Типизация переменных", explanation: "Указываем типы явно.", code: `const port: number = 3000;\nconst name: string = "Node API";` },
        { title: "Шаг 2. Интерфейс", explanation: "Описываем форму объекта пользователя.", code: `interface User {\n  id: number;\n  email: string;\n}` },
        { title: "Шаг 3. Функция с типами", explanation: "Типы помогают избежать ошибок.", code: `function getEmail(user: User): string {\n  return user.email;\n}` }
      ],
      11: [
        { title: "Шаг 1. Класс приложения", explanation: "Собираем стартовую архитектуру.", code: `class App {\n  init() { console.log("App init"); }\n}` },
        { title: "Шаг 2. Логгер", explanation: "Выносим логирование в отдельный слой.", code: `class Logger {\n  log(message) { console.log("[LOG]", message); }\n}` },
        { title: "Шаг 3. Контроллер", explanation: "Контроллер отвечает за HTTP-логику.", code: `class UserController {\n  constructor(logger) { this.logger = logger; }\n}` }
      ],
      12: [
        { title: "Шаг 1. Контракт сервиса", explanation: "Определяем общий интерфейс зависимости.", code: `class IUserService {\n  create() { throw new Error("not implemented"); }\n}` },
        { title: "Шаг 2. Внедрение зависимости", explanation: "Передаем зависимость через конструктор.", code: `class UserController {\n  constructor(userService) { this.userService = userService; }\n}` },
        { title: "Шаг 3. IoC идея", explanation: "Контейнер создает объекты за нас.", code: `const userController = new UserController(new UserService());` }
      ],
      13: [
        { title: "Шаг 1. ESLint запуск", explanation: "Проверяем код на ошибки стиля и качества.", code: `npx eslint .` },
        { title: "Шаг 2. Nodemon", explanation: "Автоперезапуск сервера при изменениях.", code: `npx nodemon src/main.js` },
        { title: "Шаг 3. Debug лог", explanation: "Добавляем точку контроля поведения.", code: `console.debug("payload:", payload);` }
      ],
      14: [
        { title: "Шаг 1. DTO", explanation: "Отделяем входные данные от доменной модели.", code: `class CreateUserDto {\n  constructor(email, password) { this.email = email; this.password = password; }\n}` },
        { title: "Шаг 2. Entity", explanation: "Entity содержит бизнес-правила.", code: `class UserEntity {\n  setPassword(hash) { this.passwordHash = hash; }\n}` },
        { title: "Шаг 3. Middleware", explanation: "Проверяем данные до контроллера.", code: `function validate(req, res, next) {\n  if (!req.body.email) return res.status(400).end();\n  next();\n}` }
      ],
      15: [
        { title: "Шаг 1. Prisma клиент", explanation: "Инициализируем доступ к БД.", code: `import { PrismaClient } from "@prisma/client";\nconst prisma = new PrismaClient();` },
        { title: "Шаг 2. Репозиторий", explanation: "Выносим запросы в отдельный слой.", code: `async function findUserByEmail(email) {\n  return prisma.user.findUnique({ where: { email } });\n}` },
        { title: "Шаг 3. Создание записи", explanation: "Сохраняем нового пользователя.", code: `await prisma.user.create({ data: { email, passwordHash } });` }
      ],
      16: [
        { title: "Шаг 1. Подпись JWT", explanation: "Генерируем токен после логина.", code: `import jwt from "jsonwebtoken";\nconst token = jwt.sign({ userId: 1 }, "secret", { expiresIn: "1h" });` },
        { title: "Шаг 2. Проверка токена", explanation: "Проверяем подпись и срок жизни.", code: `const payload = jwt.verify(token, "secret");\nconsole.log(payload);` },
        { title: "Шаг 3. Auth middleware", explanation: "Защищаем приватные маршруты.", code: `function auth(req, res, next) {\n  if (!req.headers.authorization) return res.status(401).end();\n  next();\n}` }
      ],
      17: [
        { title: "Шаг 1. Unit тест", explanation: "Тестируем отдельную функцию.", code: `import { test } from "node:test";\nimport assert from "node:assert";\ntest("sum", () => assert.equal(2 + 2, 4));` },
        { title: "Шаг 2. e2e сценарий", explanation: "Проверяем поведение API целиком.", code: `const res = await fetch("http://localhost:3000/health");\nconsole.log(res.status);` },
        { title: "Шаг 3. Запуск тестов", explanation: "Собираем тесты в одну команду.", code: `node --test` }
      ],
      18: [
        { title: "Шаг 1. Финальная проверка", explanation: "Проверяем готовность проекта к релизу.", code: `const checklist = ["routes", "auth", "tests"];\nconsole.log(checklist);` },
        { title: "Шаг 2. Самооценка знаний", explanation: "Фиксируем, что освоено хорошо.", code: `const score = { node: 8, express: 7, ts: 6 };\nconsole.table(score);` },
        { title: "Шаг 3. План роста", explanation: "Готовим следующий учебный шаг.", code: `const nextStep = "Build production-ready API";\nconsole.log(nextStep);` }
      ],
      19: [
        { title: "Шаг 1. Scrum backlog", explanation: "Формируем список задач команды.", code: `const backlog = ["Auth", "Users API", "Tests"];\nconsole.log(backlog);` },
        { title: "Шаг 2. Статус задачи", explanation: "Отмечаем этап выполнения.", code: `const task = { id: 42, status: "in_progress" };\nconsole.log(task);` },
        { title: "Шаг 3. Код-ревью правило", explanation: "Закрепляем единый стандарт качества.", code: `function needsReview(changes) {\n  return changes.files > 0 && !changes.approved;\n}` }
      ]
    };

    return blocksByModule[mod.id] || blocksByModule[1];
  }

  function renderCodeSections(mod) {
    const sections = codeBlocks(mod);
    return sections
      .map(
        (section, index) => `
        <article class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div class="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 class="text-sm font-semibold text-cyan-200">${esc(section.title)}</h3>
              <p class="mt-1 text-sm text-slate-300">${esc(section.explanation)}</p>
            </div>
            <button
              class="copy-section-btn rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800"
              data-code-index="${index}"
            >
              Копировать блок
            </button>
          </div>
          <pre class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4"><code class="language-javascript section-code">${esc(
            section.code
          )}</code></pre>
        </article>
      `
      )
      .join("");
  }

  function practiceSteps(mod, prev) {
    const prevText = prev
      ? `Опираясь на модуль ${prev.id} "${prev.title}",`
      : "На старте курса";
    return `
      <li>${prevText} повторите ключевые термины и зафиксируйте, что уже понятно.</li>
      <li>Пройдите уроки модуля по порядку и после каждого сделайте мини-конспект из 3 пунктов.</li>
      <li>Запустите пример кода, измените минимум 2 параметра и зафиксируйте поведение.</li>
      <li>Сформулируйте 2 вопроса "почему это работает именно так" и ответьте на них через документацию.</li>
    `;
  }

  function testQuestions(mod) {
    return [
      {
        q: `Какова основная цель модуля "${mod.title}"?`,
        options: ["Освоить текущую тему и связать с прошлым модулем", "Только переписать код без понимания"],
        answer: 0
      },
      {
        q: "Почему важно идти по урокам последовательно?",
        options: ["Чтобы каждый раздел продолжал предыдущий", "Потому что так проще пропускать теорию"],
        answer: 0
      },
      {
        q: "Что делать после изучения теории?",
        options: ["Сразу переходить к следующему модулю", "Сделать практику и закрепить навыки"],
        answer: 1
      }
    ];
  }

  function renderTest(mod) {
    const questions = testQuestions(mod);
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

  async function init() {
    const modules = await window.CoursePlan.loadCoursePlan("../tasks/learn.plan.md");
    const mod = modules.find((m) => m.id === moduleId);

    if (!mod) throw new Error(`Модуль ${moduleId} не найден`);

    const prev = modules.find((m) => m.id === moduleId - 1) || null;
    const next = modules.find((m) => m.id === moduleId + 1) || null;

    const lessonsHtml = mod.lessons
      .map(
        (l) => `<li class="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
        <a href="../lessons/lesson.html?lesson=${encodeURIComponent(l.id)}" class="text-cyan-200 hover:text-cyan-100 hover:underline">
          ${esc(l.id)} ${esc(l.title)}
        </a>
        <span class="text-slate-400">${l.minutes} мин</span>
      </li>`
      )
      .join("");

    const totalMin = mod.lessons.reduce((sum, l) => sum + l.minutes, 0);
    const theoryLead = prev
      ? `Этот модуль логично продолжает модуль ${prev.id} "${prev.title}" и углубляет тему "${mod.title}".`
      : `Это отправная точка курса: в модуле формируется база для всех следующих разделов.`;

    document.getElementById("breadcrumbs").innerHTML = `
      <a href="../index.html" class="text-cyan-300 hover:text-cyan-200">Главная</a>
      <span class="text-slate-500">/</span>
      <span class="text-slate-300">Модуль ${mod.id}</span>
      <span class="text-slate-500">/</span>
      <span class="text-slate-100">${esc(mod.title)}</span>
    `;

    document.getElementById("moduleTitle").textContent = `${mod.id}. ${mod.title}`;
    document.getElementById("moduleMeta").textContent = `${mod.lessons.length} уроков • ${totalMin} минут`;
    document.getElementById("lessonsList").innerHTML = lessonsHtml;
    document.getElementById("theoryText").textContent = `${theoryLead} Фокус: ${topicMap[mod.id] || "Node.js практика"}.`;
    document.getElementById("practiceList").innerHTML = practiceSteps(mod, prev);
    document.getElementById("testForm").innerHTML = renderTest(mod);
    document.getElementById("assignmentText").textContent =
      `Соберите мини-проект по теме "${mod.title}". Используйте знания предыдущего модуля${prev ? ` (${prev.id}. ${prev.title})` : ""}, добавьте минимум 2 улучшения по качеству кода и опишите результаты в README.`;
    document.getElementById("codeSections").innerHTML = renderCodeSections(mod);

    const nav = document.getElementById("moduleNav");
    nav.innerHTML = `
      <a href="${prev ? `./module-${prev.id}.html` : "../index.html"}" class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">
        ${prev ? `← Модуль ${prev.id}` : "← К плану курса"}
      </a>
      <a href="${next ? `./module-${next.id}.html` : "../index.html"}" class="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
        ${next ? `Модуль ${next.id} →` : "Завершить курс →"}
      </a>
    `;

    if (window.hljs) window.hljs.highlightAll();
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

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
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="rounded-xl border border-rose-700 bg-rose-950/40 p-4 text-rose-200">
        Ошибка загрузки модуля: ${esc(error.message)}
      </div>
    `;
  });
})();
