export async function fetchGithubWithRetry(
  input: string,
  init?: RequestInit,
  options?: { retries?: number }
) {
  const retries = options?.retries ?? 2;
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    const response = await fetch(input, init);

    if (response.status !== 403 && response.status !== 429) {
      return response;
    }

    const retryAfter = Number(response.headers.get("retry-after") ?? "0");
    const waitMs = Math.max(retryAfter * 1000, 500 * 2 ** attempt);
    lastError = new Error(
      `GitHub API rate limit (${response.status}). Tentativa ${attempt + 1}.`
    );

    if (attempt === retries) {
      return response;
    }

    await new Promise((resolve) => setTimeout(resolve, waitMs));
    attempt += 1;
  }

  throw lastError ?? new Error("Falha ao chamar a API do GitHub.");
}
