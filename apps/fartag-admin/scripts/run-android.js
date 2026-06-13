const { existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const env = { ...process.env };
const nodeDir = path.dirname(process.execPath);

env.NODE_BINARY = process.execPath;
env.PATH = [nodeDir, env.PATH].filter(Boolean).join(path.delimiter);

if (process.platform === "win32") {
  const javaHome =
    env.JAVA_HOME ||
    path.join(env.ProgramFiles || "C:\\Program Files", "Android", "Android Studio", "jbr");
  const androidHome =
    env.ANDROID_HOME ||
    env.ANDROID_SDK_ROOT ||
    path.join(env.LOCALAPPDATA, "Android", "Sdk");

  if (!existsSync(path.join(javaHome, "bin", "java.exe"))) {
    console.error(`Java was not found at ${javaHome}. Install Android Studio or set JAVA_HOME.`);
    process.exit(1);
  }

  env.JAVA_HOME = javaHome;
  env.ANDROID_HOME = androidHome;
  env.PATH = [
    path.join(javaHome, "bin"),
    path.join(androidHome, "platform-tools"),
    env.PATH,
  ].join(path.delimiter);
}

const expoCli = require.resolve("expo/bin/cli");
const result = spawnSync(process.execPath, [expoCli, "run:android", ...process.argv.slice(2)], {
  env,
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
}
process.exit(result.status ?? 1);
