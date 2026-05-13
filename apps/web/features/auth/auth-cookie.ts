const COOKIE_NAME = "multica_logged_in";

export function hasLoggedInCookie(): boolean {
  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));
}

export function setLoggedInCookie() {
  document.cookie = `${COOKIE_NAME}=1; path=/; max-age=31536000; samesite=lax`;
}

export function clearLoggedInCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
