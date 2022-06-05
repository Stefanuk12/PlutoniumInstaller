// Vars
export type TGame = "t6" | "t5" | "t4" | "iw5"

//
interface IServerConfig {
    [game: string]: string
}
export const ServerConfig: IServerConfig = {
    t6: "https://github.com/xerxes-at/T6ServerConfigs/archive/master.zip",
    t5: "https://github.com/xerxes-at/T5ServerConfig/archive/refs/heads/master.zip",
    t4: "https://github.com/xerxes-at/T4ServerConfigs/archive/refs/heads/main.zip",
    iw5: "https://github.com/xerxes-at/IW5ServerConfig/archive/refs/heads/master.zip"
}