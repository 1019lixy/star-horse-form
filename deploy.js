import scp from "scp2";
import ora from "ora";
import chalk from "chalk";
const defaultPort = '22'
const defaultUsername = 'root'
const defaultPassword = 'doov-2023'
const defaultPath = '/opt/html'
const servers = [
    {host: '192.168.20.164', isEnd: false}
]
const spinner = ora(chalk.blue('正在部署到服务器...'));
const debug = false;
spinner.start();
for (let i = 0; i < servers.length; i++) {
    let {host, port, username, password, path} = servers[i];
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
    scp.scp('./dist/', dest, err => {
        servers[i].isEnd = true
        if (!err) {
            console.log(chalk.green(`${host}部署完成!`))
        } else {
            console.log(chalk.red(`${host}部署失败:${err}`))
        }
        let hasNotEnd = servers.find(item => !item.isEnd)
        if (!hasNotEnd) {
            spinner.stop();
            for (let i = 0; i < servers.length; i++) {
                servers[i].isEnd = false
            }
        }
    })
}
