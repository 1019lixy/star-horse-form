import scp from "scp2";
import ora from "ora";
import chalk from "chalk";
import { i18n } from "@/lang";

const defaultPort = "22";
const defaultUsername = "root";
const defaultPassword = "doov-2024";
const defaultPath = "/opt/lowcode/html";
const servers = [{ host: "192.168.20.204", isEnd: false }];
const spinner = ora(chalk.blue(i18n("deploy.deploying")));
const debug = false;
spinner.start();
for (let i = 0; i < servers.length; i++) {
  let { host, port, username, password, path } = servers[i];
  if (!host) {
    continue;
  }
  let dest = {
    host,
    port: port || defaultPort,
    username: username || defaultUsername,
    password: password || defaultPassword,
    path: path || defaultPath
  };
  if (debug) {
    dest["debug"] = console.log;
  }
  scp.scp("./dist/", dest, (err) => {
    servers[i].isEnd = true;
    if (!err) {
      console.log(chalk.green(i18n("deploy.success", { host })));
    } else {
      console.log(chalk.red(i18n("deploy.failure", { host, err })));
    }
    let hasNotEnd = servers.find((item) => !item.isEnd);
    if (!hasNotEnd) {
      spinner.stop();
      for (let i = 0; i < servers.length; i++) {
        servers[i].isEnd = false;
      }
    }
  });
}