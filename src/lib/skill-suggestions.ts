/** Linguagens / skills comuns para autocomplete de perfil. */
export const LANGUAGE_SUGGESTIONS = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "Kotlin",
  "Swift",
  "C",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "Dart",
  "Scala",
  "Elixir",
  "Haskell",
  "Lua",
  "R",
  "MATLAB",
  "Shell",
  "Bash",
  "PowerShell",
  "HTML",
  "CSS",
  "SQL",
  "GraphQL",
  "React",
  "Next.js",
  "Vue",
  "Nuxt",
  "Svelte",
  "Angular",
  "Node.js",
  "Deno",
  "Bun",
  "Django",
  "Flask",
  "FastAPI",
  "Spring",
  "Rails",
  "Laravel",
  "Express",
  "NestJS",
  "Prisma",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Terraform",
  "Ansible",
  "Linux",
  "Git",
  "CI/CD",
  "Testing",
  "DevOps",
  "Machine Learning",
  "Data Science",
  "Blockchain",
  "Solidity",
  "Zig",
  "Nim",
  "OCaml",
  "Clojure",
  "F#",
  "Objective-C",
  "Perl",
  "Groovy",
  "Assembly",
  "WebAssembly",
  "Tailwind CSS",
  "React Native",
  "Flutter",
  "Electron",
] as const;

export const INTEREST_TAG_SUGGESTIONS = [
  "docs",
  "good-first-issue",
  "help-wanted",
  "bug",
  "feature",
  "frontend",
  "backend",
  "fullstack",
  "cli",
  "api",
  "design",
  "ui",
  "ux",
  "accessibility",
  "performance",
  "security",
  "testing",
  "ci",
  "devops",
  "infra",
  "mobile",
  "ios",
  "android",
  "web",
  "desktop",
  "data",
  "ml",
  "ai",
  "blockchain",
  "open-source",
  "beginner-friendly",
  "hacktoberfest",
  "translation",
  "i18n",
  "documentation",
  "refactor",
  "dx",
] as const;

export function parseCsvSkills(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function filterSkillSuggestions(
  query: string,
  suggestions: readonly string[],
  selected: string[],
  limit = 8
) {
  const q = query.trim().toLowerCase();
  const selectedSet = new Set(selected.map((item) => item.toLowerCase()));
  const available = suggestions.filter(
    (item) => !selectedSet.has(item.toLowerCase())
  );

  if (!q) return available.slice(0, limit);

  return available
    .filter((item) => item.toLowerCase().includes(q))
    .sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts || a.localeCompare(b);
    })
    .slice(0, limit);
}
