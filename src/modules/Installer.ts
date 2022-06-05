// Dependencies
import StreamZip from 'node-stream-zip';
import * as path from "path"
import * as fs from "fs"
import WebTorrent from "webtorrent"
import { KeepAll, KeepEnglish, RemoveFolders } from "./ServerIgnore.js"
import { ServerConfig } from "./ServerConfig.js"
import got from "got"

//
export async function InstallServerConfig(Game: TGame, Path: string) {
    // Downloading the file
    const DownloadURL = ServerConfig[Game]
    const File = (await got(DownloadURL)).rawBody
    fs.writeFileSync("serverconfig.zip", File)

    // Unzipping it from the main folder
    const zip = new StreamZip.async({ file: "serverconfig.zip" })
    const Entries = Object.keys(await zip.entries())
    const Root = Entries[0]
    for (let i = 1; i < Entries.length; i++){
        const Entry = Entries[i]
        await zip.extract(Entry, `${Path}/${Entry.substring(Root.length)}`)
    }
    await zip.close()

    // Removing zip file
    fs.unlinkSync("serverconfig.zip")
}

//
export async function InstallPlutoniumLauncher(Path: string) {
    const File = Buffer.from((await got.get("https://cdn.plutonium.pw/updater/plutonium.exe")).body)
    fs.writeFileSync("plutonium.exe", Path)
}

//
export const TGameKeys = ["t6", "t5", "t4", "iw5"] as const
export type TGame = typeof TGameKeys[number]
export function InstallGame(Game: TGame, Path: string, Verbose: boolean = false, Server: boolean = false, Force: boolean = false) {
    // Vars
    const TorrentURL = `https://plutonium.pw/pluto_${Game}_full_game.torrent`
    const TorrentClient = new WebTorrent()

    // Start the download
    const torrent = TorrentClient.add(TorrentURL, {
        path: Path,
    }, function (torrent_) {
        // Force
        if (fs.readdirSync(Path).length != 0){
            console.log("WARN: install path is not empty")

            if (Force)
                console.log("WARN: Forcing...")
            else {
                console.log("ERROR: stopping install")
                torrent_.destroy()
                process.exit(1)
            }
        }
    
        // Make sure is server - for ignoring
        if (Server == false) return

        // Warning
        console.log("WARN: torrent deselect is not fully working!")

        // Deselect everything
        torrent_.files.forEach(file => file.deselect())
        torrent_.deselect(0, torrent_.pieces.length - 1, <any>false)

        //
        for (const file of torrent_.files) {
            // Check path
            const ParentPath = path.basename(path.dirname(file.path))

            // Removing files
            const EnglishFileCheck = ParentPath == "english" && KeepEnglish.includes(file.name) == false
            const AllFileCheck = ParentPath == "all" && KeepAll.includes(file.name) == false
            const FolderCheck = RemoveFolders.includes(ParentPath)
            if (AllFileCheck || EnglishFileCheck || FolderCheck) {
                file.deselect()
                continue
            }

            // File is wanted, add to selections
            file.select()
        }
    })

    // Progress tracker
    torrent.on('download', function (bytes) {
        if (Verbose)
            console.log(`${torrent.progress}% | ${torrent.downloadSpeed / 1e6}Mbps`)
    })

    // See whenever it is done
    torrent.on("done", () => {
        // Done
        console.log("Torrent finished!")

        // Installing server confi  g
        console.log("Installing Server Config...")
        InstallServerConfig(Game, Path).then(() => {
            console.log("Installed Server Config!")

            // Installing the plutonium launcher
            console.log("Installing plutonium launcher...")
            InstallPlutoniumLauncher(Path).then(() => {
                console.log("Installed plutonium launcher!")
            })
        })
    })
}