(() => {
  const moduleHeading = /^###\s+(\d+)\.\s+(.+)$/;
  const lessonLine = /^-\s+(\d+\.\d+)\s+(.+?)\s+—\s+(\d+)\s+мин$/;

  function parseCoursePlan(markdown) {
    const lines = markdown.split(/\r?\n/);
    const modules = [];
    let current = null;

    for (const line of lines) {
      const heading = line.match(moduleHeading);
      if (heading) {
        if (current) modules.push(current);
        current = {
          id: Number(heading[1]),
          title: heading[2].trim(),
          lessons: []
        };
        continue;
      }

      const lesson = line.match(lessonLine);
      if (lesson && current) {
        current.lessons.push({
          id: lesson[1],
          title: lesson[2].trim(),
          minutes: Number(lesson[3])
        });
      }
    }

    if (current) modules.push(current);
    return modules;
  }

  function buildFallbackUrls(pathToMd) {
    const urls = [pathToMd];
    const normalized = pathToMd.replace(/^\.\//, "");
    urls.push(`./${normalized}`);
    urls.push(`/${normalized}`);

    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const repoName = pathParts.length > 0 ? pathParts[0] : "";
    if (repoName) {
      urls.push(`/${repoName}/${normalized}`);
    }

    const host = window.location.hostname;
    if (host.endsWith(".github.io") && repoName) {
      const userName = host.replace(".github.io", "");
      urls.push(`https://raw.githubusercontent.com/${userName}/${repoName}/main/${normalized}`);
      urls.push(`https://raw.githubusercontent.com/${userName}/${repoName}/master/${normalized}`);
    }

    return Array.from(new Set(urls));
  }

  async function loadCoursePlan(pathToMd) {
    const candidates = buildFallbackUrls(pathToMd);
    let lastError = "Не удалось загрузить план курса";

    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          lastError = `Не удалось загрузить план: ${res.status} (${url})`;
          continue;
        }
        const markdown = await res.text();
        const modules = parseCoursePlan(markdown);
        if (modules.length > 0) return modules;
        lastError = `План загружен, но пустой (${url})`;
      } catch (error) {
        lastError = `Ошибка загрузки из ${url}: ${error.message}`;
      }
    }

    throw new Error(lastError);
  }

  window.CoursePlan = { parseCoursePlan, loadCoursePlan };
})();
