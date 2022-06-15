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
    return new Promise<void>((resolve, reject) => {
        // Force
        if (fs.existsSync(Path) && fs.readdirSync(Path).length != 0){
            if (Verbose) console.warn("WARN: install path is not empty")

            if (!Force){
                if (Verbose) console.error("ERROR: stopping install")
                return reject(new Error("install path is not empty, stopping install"))
            }

            if (Verbose) console.warn("WARN: Forcing...")
        }

        // Vars
        const TorrentURL = `https://plutonium.pw/pluto_${Game}_full_game.torrent`
        const TorrentClient = new WebTorrent()

        // Start the download
        return TorrentClient.add(TorrentURL, {
            path: Path
        }, function (torrent) {
            // Output
            if (Verbose) console.log("Got torrent metadata!")

            // Error tracker
            torrent.on('error', function (err) {
                console.error('ERROR:', err)
            })

            // Progress tracker
            let LastLog = new Date().getTime()
            torrent.on('download', function (bytes) {
                // Only log every second
                let CurrentTime = new Date().getTime()
                if (Verbose && CurrentTime - LastLog >= 1000){
                    console.log(`${(torrent.progress * 100).toPrecision(2)}% | ${(torrent.downloadSpeed / 1e6).toPrecision(4)}Mbps`)
                    LastLog = CurrentTime
                }
            })

            // See whenever it is done
            torrent.on("done", function() {
                // Done
                if (Verbose) console.log("Torrent finished!")

                // Installing server config
                if (Verbose) console.log("Installing Server Config...")
                InstallServerConfig(Game, Path).then(() => {
                    console.log("Installed Server Config!")

                    // Installing the plutonium launcher
                    if (Verbose) console.log("Installing plutonium launcher...")
                    InstallPlutoniumLauncher(Path).then(() => {
                        if (Verbose) console.log("Installed plutonium launcher!")
                        return resolve()
                    })
                })

                // Destroy the torrent
                torrent.pause()
                torrent.destroy()
            })

            // Make sure is server - for ignoring
            if (Server == false) return

            // Warning
            if (Verbose) console.log("WARN: torrent deselect is not fully working, you may have to cleanup after!")

            // Deselect everything
            torrent.files.forEach(file => file.deselect())
            torrent.deselect(0, torrent.pieces.length - 1, <any>false)

            // Selecting files
            const Ignored = []
            const Selected = []
            for (const file of torrent.files) {
                // Check path
                const ParentPath = path.basename(path.dirname(file.path))

                // Removing files
                const EnglishFileCheck = ParentPath == "english" && KeepEnglish.includes(file.name) == false
                const AllFileCheck = ParentPath == "all" && KeepAll.includes(file.name) == false
                const FolderCheck = RemoveFolders.includes(ParentPath)
                if (AllFileCheck || EnglishFileCheck || FolderCheck) {
                    file.deselect()
                    Ignored.push(file.path)
                    continue
                }

                // File is wanted, add to selections
                file.select()
                Selected.push(file.path)
            }

            // Output Ignored and Selected
            if (Verbose){
                fs.writeFileSync(`${Path}/ignored.txt`, Ignored.join("\n"))
                fs.writeFileSync(`${Path}/selected.txt`, Selected.join("\n"))
            }
        })
    })
}

//
export async function InstallIW4MAdmin(Path: string){
    // Getting latest release
    const Response: any = await got("https://api.github.com/repos/RaidMax/IW4M-Admin/releases/latest").json()
    const LatestURL = Response.assets[0].browser_download_url

    // Downloading the file
    const File = (await got(LatestURL)).rawBody
    const FileName = "IW4MAdmin.zip"
    fs.writeFileSync(FileName, File)

    // Unzipping it from the main folder
    const zip = new StreamZip.async({ file: FileName })
    await zip.extract(null, Path)
    await zip.close()

    // Removing zip file
    fs.unlinkSync(FileName)
}