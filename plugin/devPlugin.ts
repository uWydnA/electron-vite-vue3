//plugins\devPlugin.ts
import { ViteDevServer } from "vite";
import esbuild from "esbuild";
import path from "path";
import { spawn } from "child_process";
import electron from "electron";

export const devPlugin = () => {
  /**
   * 该vite插件是为了监听vite启动/插件配置更新时候去触发electron启动mainEntry
   * 并且传入mainEntry.ts中监听的从vite传入的启动地址
   */
  const mainEntryOutputPath = path.resolve(__dirname, "../dist/mainEntry.js");
  const mainEntryInputPath = path.resolve(
    __dirname,
    "../src/main/mainEntry.ts"
  );
  return {
    name: "dev-plugin",
    configureServer(server: ViteDevServer) {
      let electronProcess;
      /**
       * electron的内置模块都是通过CJS Module的形式导出的，这里之所以可以用ES Module
       * 完全是因为使用esbuild进行了转换
       */
      esbuild.buildSync({
        entryPoints: [mainEntryInputPath], //转换文件
        bundle: true,
        platform: "node", //平台
        outfile: mainEntryOutputPath, //转换后输出文件
        external: ["electron"], //排除electron依赖，原样输出
      });
      /**
       * 开始监听vite的启动，如果vite启动了，则触发callback
       */
      server.httpServer.once("listening", () => {
        let addressInfo = server.httpServer.address();
        let httpAddress = `http://${addressInfo.address}:${addressInfo.port}`;
        /**
         * spawn是为了启动一个子进程去执行命令，类似于通过node脚本执行命令
         * spawn的第一个参数是要运行的命令的地址，第二个参数是命令的字符串参数列表，第三个参数是配置项
         */
        electronProcess = spawn(
          electron.toString(),
          [mainEntryOutputPath, httpAddress],
          {
            cwd: process.cwd(), //当前项目的根目录
            stdio: "inherit", //让子进程继承主进程的stdin,stdout,stderr
          }
        );
        /**
         * 当electron子进程退出的时候，我们需要关闭Vite的http服务，并且控制父进程退出
         */
        electronProcess?.on("close", () => {
          server.close();
          process.exit();
        });
      });

      server.httpServer.once("close", () => {
        /**
         * Ctrl+C结束进程时，同时退出electron应用和当前进程
         */
        electronProcess?.kill();
        process.exit();
      });
    },
  };
};

// plugins\devPlugin.ts
export const getReplacer = () => {
  let externalModels = [
    "os",
    "fs",
    "path",
    "events",
    "child_process",
    "crypto",
    "http",
    "buffer",
    "url",
    "better-sqlite3",
    "knex",
  ];
  let result = {};
  for (let item of externalModels) {
    result[item] = () => ({
      find: new RegExp(`^${item}$`),
      code: `const ${item} = require('${item}');export { ${item} as default }`,
    });
  }
  result["electron"] = () => {
    let electronModules = [
      "clipboard",
      "ipcRenderer",
      "nativeImage",
      "shell",
      "webFrame",
    ].join(",");
    return {
      find: new RegExp(`^electron$`),
      code: `const {${electronModules}} = require('electron');export {${electronModules}}`,
    };
  };
  return result;
};
