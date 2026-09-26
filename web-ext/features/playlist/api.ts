const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8787/api"
    : "https://toppings.enry.ch/api";

export function fetchPlaylist(playlistId: string): Promise<Response> {
  return fetch(`${API_BASE}/v1/playlist/${playlistId}`, {
    headers: { Accept: "application/json" },
  });
}
