//plugins\buildPlugin.ts
import fs from "fs-extra";
import path from "path";
class BuildObj {
  //编译主进程代码
  buildMain() {
    require("esbuild").buildSync({
      entryPoints: ["./src/main/mainEntry.ts"],
      bundle: true,
      platform: "node",
      minify: true,
      outfile: "./dist/mainEntry.js",
      external: ["electron"],
    });
  }
  //为生产环境准备package.json
  preparePackageJson() {
    let pkgJsonPath = path.join(process.cwd(), "package.json");
    let localPkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
    let electronConfig = localPkgJson.devDependencies.electron.replace("^", "");
    localPkgJson.main = "mainEntry.js";
    delete localPkgJson.scripts;
    delete localPkgJson.devDependencies;
    localPkgJson.devDependencies = { electron: electronConfig };
    //版本号是否正确无关紧要
    localPkgJson.dependencies["better-sqlite3"] = "*";
    localPkgJson.dependencies["bindings"] = "*";
    localPkgJson.dependencies["knex"] = "*";
    let tarJsonPath = path.join(process.cwd(), "dist", "package.json");
    fs.writeFileSync(tarJsonPath, JSON.stringify(localPkgJson));
    fs.mkdirSync(path.join(process.cwd(), "dist/node_modules"));
  }
  //使用electron-builder制成安装包
  buildInstaller() {
    let options = {
      config: {
        directories: {
          output: path.join(process.cwd(), "release"),
          app: path.join(process.cwd(), "dist"),
        },
        files: ["**"],
        extends: null,
        productName: "electron-vite-vue3",
        appId: "com.electron-vite-vue3.desktop",
        asar: false,
        nsis: {
          oneClick: true,
          perMachine: true,
          allowToChangeInstallationDirectory: false,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          shortcutName: "electron-vite-vue3",
        },
        publish: [{ provider: "generic", url: "http://localhost:5500/" }],
      },
      project: process.cwd(),
    };
    return require("electron-builder").build(options);
  }
  async prepareSqlite() {
    //拷贝better-sqlite3
    let srcDir = path.join(process.cwd(), `node_modules/better-sqlite3`);
    let destDir = path.join(process.cwd(), `dist/node_modules/better-sqlite3`);
    fs.ensureDirSync(destDir);
    fs.copySync(srcDir, destDir, {
      filter: (src, dest) => {
        if (
          src.endsWith("better-sqlite3") ||
          src.endsWith("build") ||
          src.endsWith("Release") ||
          src.endsWith("better_sqlite3.node")
        )
          return true;
        else if (src.includes("node_modules\\better-sqlite3\\lib")) return true;
        else return false;
      },
    });

    let pkgJson = `{"name": "better-sqlite3","main": "lib/index.js"}`;
    let pkgJsonPath = path.join(
      process.cwd(),
      `dist/node_modules/better-sqlite3/package.json`
    );
    fs.writeFileSync(pkgJsonPath, pkgJson);
    //制作bindings模块
    let bindingPath = path.join(
      process.cwd(),
      `dist/node_modules/bindings/index.js`
    );
    fs.ensureFileSync(bindingPath);
    let bindingsContent = `module.exports = () => {
let addonPath = require("path").join(__dirname, '../better-sqlite3/build/Release/better_sqlite3.node');
return require(addonPath);
};`;
    fs.writeFileSync(bindingPath, bindingsContent);

    pkgJson = `{"name": "bindings","main": "index.js"}`;
    pkgJsonPath = path.join(
      process.cwd(),
      `dist/node_modules/bindings/package.json`
    );
    fs.writeFileSync(pkgJsonPath, pkgJson);
  }
  prepareKnexjs() {
    let pkgJsonPath = path.join(process.cwd(), `dist/node_modules/knex`);
    fs.ensureDirSync(pkgJsonPath);
    require("esbuild").buildSync({
      entryPoints: ["./node_modules/knex/knex.js"],
      bundle: true,
      platform: "node",
      format: "cjs",
      minify: true,
      outfile: "./dist/node_modules/knex/index.js",
      external: [
        "oracledb",
        "pg-query-stream",
        "pg",
        "sqlite3",
        "tedious",
        "mysql",
        "mysql2",
        "better-sqlite3",
      ],
    });
    let pkgJson = `{"name": "bindings","main": "index.js"}`;
    pkgJsonPath = path.join(
      process.cwd(),
      `dist/node_modules/knex/package.json`
    );
    fs.writeFileSync(pkgJsonPath, pkgJson);
  }
}

export let buildPlugin = () => {
  return {
    name: "build-plugin",
    closeBundle: () => {
      let buildObj = new BuildObj();
      buildObj.buildMain();
      buildObj.preparePackageJson();
      buildObj.prepareSqlite();
      buildObj.prepareKnexjs();
      buildObj.buildInstaller();
    },
  };
};
