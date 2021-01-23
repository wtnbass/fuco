import SizePluginCore from "size-plugin-core";

async function main() {
  const core = new SizePluginCore({
    compression: "gzip",
    pattern: "dist/*.js",
  });

  const size = await core.readFromDisk(process.cwd());
  const files = Object.entries(size).map(([filename, size]) => ({
    filename,
    size,
  }));
  const text = await core.printSizes(files);
  console.log(text);
}

main();
