#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SERVER_DIR = join(ROOT, "server");
const WEB_DIR = join(ROOT, "apps", "web");
const DESKTOP_DIR = join(ROOT, "apps", "desktop");
const IS_WIN = process.platform === "win32";
const BIN_EXT = IS_WIN ? ".exe" : "";
const MIN_DEV_VERSION = "v0.2.20";
let activeEnvFile = process.env.MULTICA_ENV_FILE
  ? join(ROOT, process.env.MULTICA_ENV_FILE)
  : join(ROOT, ".env");

function bin(name) {
  return join(SERVER_DIR, "bin", `${name}${BIN_EXT}`);
}

function exe(name) {
  return IS_WIN ? `${name}.cmd` : name;
}

function run(command, args = [], options = {}) {
  let actualCommand = command;
  let actualArgs = args;
  if (IS_WIN && /\.(cmd|bat)$/i.test(command)) {
    actualCommand = process.env.ComSpec || "cmd.exe";
    actualArgs = ["/d", "/s", "/c", command, ...args];
  }
  const result = spawnSync(actualCommand, actualArgs, {
    cwd: options.cwd ?? ROOT,
    env: options.env ?? process.env,
    stdio: options.stdio ?? "inherit",
    shell: false,
    encoding: "utf8",
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0 && !options.allowFailure) {
    process.exit(result.status ?? 1);
  }
  return result.stdout ?? "";
}

function capture(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? ROOT,
    env: options.env ?? process.env,
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
    encoding: "utf8",
  });
  if (result.error || result.status !== 0) {
    return "";
  }
  return (result.stdout ?? "").trim();
}

function envFromFile(path = activeEnvFile) {
  const env = {};
  if (!existsSync(path)) {
    return env;
  }
  const text = readFileSync(path, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function appEnv(extra = {}) {
  return { ...process.env, ...envFromFile(), ...extra };
}

function databaseInfo(env) {
  const url = env.DATABASE_URL ?? "";
  let host = "localhost";
  let port = env.POSTGRES_PORT || "5432";
  let db = env.POSTGRES_DB || "multica";

  if (url) {
    try {
      const parsed = new URL(url);
      host = parsed.hostname || host;
      port = parsed.port || port;
      db = parsed.pathname.replace(/^\//, "") || db;
    } catch {
      // Keep env defaults on malformed URLs; migrate will surface the real error.
    }
  }

  return {
    host,
    port,
    db,
    user: env.POSTGRES_USER || "multica",
    password: env.POSTGRES_PASSWORD || "multica",
    url,
  };
}

function isLocalDatabase(info) {
  return !info.url || ["localhost", "127.0.0.1", "::1", "[::1]"].includes(info.host);
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDb() {
  const info = databaseInfo(envFromFile());
  if (!isLocalDatabase(info)) {
    console.log(`Remote database configured (${info.host}:${info.port}); skipping local Docker preflight.`);
    return;
  }

  run("docker", ["compose", "up", "-d", "postgres"]);

  process.stdout.write("Waiting for PostgreSQL");
  for (;;) {
    const ready = spawnSync(
      "docker",
      ["compose", "exec", "-T", "postgres", "pg_isready", "-U", info.user, "-d", "postgres"],
      { cwd: ROOT, stdio: "ignore" },
    );
    if (ready.status === 0) break;
    process.stdout.write(".");
    await sleep(1000);
  }
  process.stdout.write("\n");

  const exists = capture("docker", [
    "compose",
    "exec",
    "-T",
    "postgres",
    "psql",
    "-U",
    info.user,
    "-d",
    "postgres",
    "-Atqc",
    `SELECT 1 FROM pg_database WHERE datname = '${info.db.replaceAll("'", "''")}'`,
  ]);

  if (exists.trim() !== "1") {
    run("docker", [
      "compose",
      "exec",
      "-T",
      "postgres",
      "psql",
      "-U",
      info.user,
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      `CREATE DATABASE "${info.db.replaceAll('"', '""')}"`,
    ]);
  }

  console.log(`PostgreSQL ready. Database: ${info.db}`);
}

function gitVersion() {
  const raw = capture("git", ["describe", "--tags", "--always", "--dirty"]);
  const commit = capture("git", ["rev-parse", "--short", "HEAD"]) || "unknown";
  const dirty = capture("git", ["status", "--porcelain"]) ? "-dirty" : "";
  const version = /^v?\d+\.\d+\.\d+/.test(raw)
    ? raw
    : `${MIN_DEV_VERSION}-0-g${commit}${dirty}`;
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  return { version, commit, date };
}

function build() {
  const { version, commit, date } = gitVersion();
  run("go", [
    "build",
    "-ldflags",
    `-X main.version=${version} -X main.commit=${commit}`,
    "-o",
    bin("server"),
    "./cmd/server",
  ], { cwd: SERVER_DIR });
  run("go", [
    "build",
    "-ldflags",
    `-X main.version=${version} -X main.commit=${commit} -X main.date=${date}`,
    "-o",
    bin("multica"),
    "./cmd/multica",
  ], { cwd: SERVER_DIR });
  run("go", ["build", "-o", bin("migrate"), "./cmd/migrate"], { cwd: SERVER_DIR });
}

function runMigrate(direction) {
  run("go", ["run", "./cmd/migrate", direction], { cwd: SERVER_DIR, env: appEnv() });
}

function runSqlc() {
  const found = capture(IS_WIN ? "where" : "which", ["sqlc"]);
  if (found) {
    run("sqlc", ["generate"], { cwd: SERVER_DIR });
    return;
  }
  run("go", ["run", "github.com/sqlc-dev/sqlc/cmd/sqlc@v1.31.1", "generate"], {
    cwd: SERVER_DIR,
  });
}

function goTestEnv() {
  if (!IS_WIN) return appEnv();
  const tmp = "C:\\tmp\\multica-go";
  mkdirSync(tmp, { recursive: true });
  return appEnv({ TEMP: tmp, TMP: tmp });
}

function spawnManaged(command, args = [], options = {}) {
  let actualCommand = command;
  let actualArgs = args;
  if (IS_WIN && /\.(cmd|bat)$/i.test(command)) {
    actualCommand = process.env.ComSpec || "cmd.exe";
    actualArgs = ["/d", "/s", "/c", command, ...args];
  }
  const child = spawn(actualCommand, actualArgs, {
    cwd: options.cwd ?? ROOT,
    env: options.env ?? process.env,
    stdio: "inherit",
    shell: false,
  });
  child.on("error", (error) => {
    console.error(error.message);
    process.exit(1);
  });
  return child;
}

async function runServer() {
  await ensureDb();
  const child = spawnManaged("go", ["run", "./cmd/server"], { cwd: SERVER_DIR, env: appEnv() });
  return waitForChild(child);
}

async function runStart() {
  await ensureDb();
  const children = [
    spawnManaged("go", ["run", "./cmd/server"], { cwd: SERVER_DIR, env: appEnv() }),
    spawnWebDev(),
  ];

  const stopAll = () => {
    for (const child of children) {
      if (!child.killed) child.kill();
    }
  };
  process.on("SIGINT", () => {
    stopAll();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    stopAll();
    process.exit(143);
  });

  await new Promise((resolve) => {
    for (const child of children) {
      child.on("exit", (code) => {
        stopAll();
        process.exitCode = code ?? 0;
        resolve();
      });
    }
  });
}

function stopPort(port) {
  if (!port) return;
  if (IS_WIN) {
    run("powershell.exe", [
      "-NoLogo",
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      `$ErrorActionPreference = 'SilentlyContinue'; Get-NetTCPConnection -LocalPort ${Number(port)} | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }`,
    ], { allowFailure: true });
    return;
  }
  run("sh", ["-c", `lsof -ti:${port} | xargs kill -9 2>/dev/null || true`], { allowFailure: true });
}

function stop() {
  const env = envFromFile();
  stopPort(env.PORT || "8080");
  stopPort(env.FRONTEND_PORT || "3000");
  console.log("App processes stopped. PostgreSQL was not stopped.");
}

function spawnWebDev() {
  const env = envFromFile();
  const port = env.FRONTEND_PORT || process.env.FRONTEND_PORT || "3000";
  const nextBin = join(WEB_DIR, "node_modules", ".bin", `next${IS_WIN ? ".cmd" : ""}`);
  return spawnManaged(nextBin, ["dev", "--port", port], {
    cwd: WEB_DIR,
    env: { ...process.env, ...env },
  });
}

function spawnDesktopDev() {
  return spawnManaged(exe("pnpm"), ["run", "dev"], { cwd: DESKTOP_DIR });
}

function waitForChild(child) {
  return new Promise((resolve) => {
    child.on("exit", (code) => {
      process.exitCode = code ?? 0;
      resolve();
    });
  });
}

async function setup() {
  run(exe("pnpm"), ["install"]);
  await ensureDb();
  runMigrate("up");
}

function envPath(name) {
  return join(ROOT, name);
}

function useEnvFile(name) {
  activeEnvFile = envPath(name);
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "multica";
}

function checksum(value) {
  let a = 1;
  let b = 0;
  const bytes = Buffer.from(value, "utf8");
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function initWorktreeEnv(outputName = ".env.worktree") {
  const outputPath = envPath(outputName);
  if (existsSync(outputPath) && process.env.FORCE !== "1") {
    console.error(`Refusing to overwrite existing ${outputName}. Re-run with FORCE=1 if you want to regenerate it.`);
    process.exit(1);
  }

  const worktreeName = process.env.WORKTREE_NAME || basename(ROOT);
  const slug = slugify(worktreeName);
  const offset = checksum(ROOT) % 1000;
  const postgresDb = `multica_${slug}_${offset}`;
  const postgresPort = "5432";
  const backendPort = String(18080 + offset);
  const frontendPort = String(13000 + offset);
  const frontendOrigin = `http://localhost:${frontendPort}`;

  const text = `POSTGRES_DB=${postgresDb}
POSTGRES_USER=multica
POSTGRES_PASSWORD=multica
POSTGRES_PORT=${postgresPort}
DATABASE_URL=postgres://multica:multica@localhost:${postgresPort}/${postgresDb}?sslmode=disable

PORT=${backendPort}
JWT_SECRET=change-me-in-production
MULTICA_DEV_VERIFICATION_CODE=888888
MULTICA_SERVER_URL=ws://localhost:${backendPort}/ws
MULTICA_APP_URL=${frontendOrigin}

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=${frontendOrigin}/auth/callback

FRONTEND_PORT=${frontendPort}
FRONTEND_ORIGIN=${frontendOrigin}
NEXT_PUBLIC_API_URL=http://localhost:${backendPort}
NEXT_PUBLIC_WS_URL=ws://localhost:${backendPort}/ws
`;

  writeFileSync(outputPath, text);
  console.log(`Generated ${outputName} for worktree '${worktreeName}'`);
  console.log(`  Shared Postgres: localhost:${postgresPort}`);
  console.log(`  Database: ${postgresDb}`);
  console.log(`  Backend:  http://localhost:${backendPort}`);
  console.log(`  Frontend: ${frontendOrigin}`);
  console.log("");
  console.log("Next steps:");
  console.log("  just setup-worktree");
  console.log("  just start-worktree");
}

async function setupWorktree() {
  useEnvFile(".env.worktree");
  if (!existsSync(activeEnvFile)) {
    initWorktreeEnv();
  }
  await setup();
}

async function startWorktree() {
  useEnvFile(".env.worktree");
  if (!existsSync(activeEnvFile)) {
    console.error("Missing .env.worktree. Run `just init-worktree-env` first.");
    process.exit(1);
  }
  await runStart();
}

function stopWorktree() {
  useEnvFile(".env.worktree");
  if (!existsSync(activeEnvFile)) {
    console.error("Missing .env.worktree. Run `just init-worktree-env` first.");
    process.exit(1);
  }
  stop();
}

async function testGo() {
  await ensureDb();
  runMigrate("up");
  run("go", ["test", "./..."], { cwd: SERVER_DIR, env: goTestEnv() });
}

async function dbReset() {
  const info = databaseInfo(envFromFile());
  if (!isLocalDatabase(info)) {
    console.error("Refusing to reset: DATABASE_URL points at a remote host.");
    process.exit(1);
  }
  await ensureDb();
  run("docker", [
    "compose",
    "exec",
    "-T",
    "postgres",
    "psql",
    "-U",
    info.user,
    "-d",
    "postgres",
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    `DROP DATABASE IF EXISTS "${info.db.replaceAll('"', '""')}" WITH (FORCE);`,
    "-c",
    `CREATE DATABASE "${info.db.replaceAll('"', '""')}";`,
  ]);
  runMigrate("up");
}

async function check() {
  await ensureDb();
  run(exe("pnpm"), ["typecheck"]);
  run(exe("pnpm"), ["test"]);
  runMigrate("up");
  run("go", ["test", "./..."], { cwd: SERVER_DIR, env: goTestEnv() });

  const env = envFromFile();
  const apiPort = env.PORT || "8080";
  const webPort = env.FRONTEND_PORT || "3000";
  const started = [];
  try {
    if (!(await httpOk(`http://localhost:${apiPort}/health`))) {
      started.push(spawnManaged("go", ["run", "./cmd/server"], { cwd: SERVER_DIR, env: appEnv() }));
      await waitForHttp(`http://localhost:${apiPort}/health`, "backend", 90_000);
    }
    if (!(await httpOk(`http://localhost:${webPort}`))) {
      started.push(spawnWebDev());
      await waitForHttp(`http://localhost:${webPort}`, "frontend", 120_000);
    }
    run(exe("pnpm"), ["exec", "playwright", "test"], {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${webPort}`,
      },
    });
  } finally {
    for (const child of started) {
      if (!child.killed) child.kill();
    }
  }
}

async function httpOk(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return response.status >= 200 && response.status < 500;
  } catch {
    return false;
  }
}

async function waitForHttp(url, name, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await httpOk(url)) return;
    await sleep(1000);
  }
  throw new Error(`${name} did not become ready at ${url}`);
}

function cli(args) {
  run(bin("multica"), args);
}

function cliSetup() {
  run(bin("multica"), [
    "setup",
    "self-host",
    "--profile",
    "local",
    "--server-url",
    "http://localhost:8080",
    "--app-url",
    "http://localhost:3000",
  ]);
}

function daemon(args) {
  build();
  run(bin("multica"), ["daemon", ...args]);
}

function clean() {
  rmSync(join(SERVER_DIR, "bin"), { recursive: true, force: true });
  rmSync(join(SERVER_DIR, "tmp"), { recursive: true, force: true });
}

function ensureSelfhostEnv() {
  const envPath = join(ROOT, ".env");
  if (existsSync(envPath)) return;

  let text = readFileSync(join(ROOT, ".env.example"), "utf8");
  const secret = randomBytes(32).toString("hex");
  if (/^JWT_SECRET=.*/m.test(text)) {
    text = text.replace(/^JWT_SECRET=.*/m, `JWT_SECRET=${secret}`);
  } else {
    text += `\nJWT_SECRET=${secret}\n`;
  }
  writeFileSync(envPath, text);
  console.log("Created .env from .env.example and generated JWT_SECRET.");
}

async function waitForBackend() {
  const env = envFromFile();
  const port = env.PORT || "8080";
  for (let i = 0; i < 30; i += 1) {
    if (await httpOk(`http://localhost:${port}/health`)) return true;
    await sleep(2000);
  }
  return false;
}

async function selfhost({ build = false } = {}) {
  ensureSelfhostEnv();
  if (build) {
    run("docker", [
      "compose",
      "-f",
      "docker-compose.selfhost.yml",
      "-f",
      "docker-compose.selfhost.build.yml",
      "up",
      "-d",
      "--build",
    ]);
  } else {
    const pulled = spawnSync("docker", ["compose", "-f", "docker-compose.selfhost.yml", "pull"], {
      cwd: ROOT,
      stdio: "inherit",
      shell: false,
    });
    if (pulled.error) throw pulled.error;
    if (pulled.status !== 0) {
      console.error("Official images are not available for the selected tag. Run `just selfhost-build` to build from this checkout.");
      process.exit(pulled.status ?? 1);
    }
    run("docker", ["compose", "-f", "docker-compose.selfhost.yml", "up", "-d"]);
  }

  if (await waitForBackend()) {
    const env = envFromFile();
    console.log(`Multica is running: frontend http://localhost:${env.FRONTEND_PORT || "3000"}, backend http://localhost:${env.PORT || "8080"}`);
  } else {
    console.log("Services are still starting. Check logs with `docker compose -f docker-compose.selfhost.yml logs`.");
  }
}

function selfhostStop() {
  run("docker", ["compose", "-f", "docker-compose.selfhost.yml", "down"]);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  switch (command) {
    case "build":
      build();
      break;
    case "check":
      await check();
      break;
    case "clean":
      clean();
      break;
    case "cli":
      cli(args);
      break;
    case "cli-setup":
      cliSetup();
      break;
    case "daemon":
      daemon(args);
      break;
    case "db-up":
      run("docker", ["compose", "up", "-d", "postgres"]);
      break;
    case "db-down":
      run("docker", ["compose", "down"]);
      break;
    case "db-reset":
      await dbReset();
      break;
    case "dev":
      await setup();
      await runStart();
      break;
    case "desktop":
      await waitForChild(spawnDesktopDev());
      break;
    case "ensure-db":
      await ensureDb();
      break;
    case "init-worktree-env":
      initWorktreeEnv(args[0] || ".env.worktree");
      break;
    case "migrate-down":
      await ensureDb();
      runMigrate("down");
      break;
    case "migrate-up":
      await ensureDb();
      runMigrate("up");
      break;
    case "server":
      await runServer();
      break;
    case "selfhost":
      await selfhost();
      break;
    case "selfhost-build":
      await selfhost({ build: true });
      break;
    case "selfhost-stop":
      selfhostStop();
      break;
    case "setup":
      await setup();
      break;
    case "setup-worktree":
      await setupWorktree();
      break;
    case "sqlc":
      runSqlc();
      break;
    case "start":
      await runStart();
      break;
    case "start-worktree":
      await startWorktree();
      break;
    case "stop":
      stop();
      break;
    case "stop-worktree":
      stopWorktree();
      break;
    case "test-go":
      await testGo();
      break;
    case "test-ts":
      run(exe("pnpm"), ["test"]);
      break;
    case "typecheck":
      run(exe("pnpm"), ["typecheck"]);
      break;
    case "web":
      await waitForChild(spawnWebDev());
      break;
    default:
      console.error(`Unknown just helper command: ${command ?? ""}`);
      process.exit(2);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
