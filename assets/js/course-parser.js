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

  async function loadCoursePlan(pathToMd) {
    const res = await fetch(pathToMd);
    if (!res.ok) throw new Error(`Не удалось загрузить план: ${res.status}`);
    const markdown = await res.text();
    return parseCoursePlan(markdown);
  }

  window.CoursePlan = { parseCoursePlan, loadCoursePlan };
})();
