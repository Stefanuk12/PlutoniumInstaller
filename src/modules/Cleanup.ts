// Dependencies
import * as fs from "fs"
import { KeepAll, KeepEnglish, RemoveFolders } from "./ServerIgnore.js"

// Removes unneccessary files for servers to reduce file size
export function CleanupInstall(GamePath: string, Verbose: boolean = false) {
    // Removing all's files
    const AllPath = `${GamePath}/zone/all`
    if (fs.existsSync(AllPath)){
        for (const file of fs.readdirSync(AllPath)) {
            // Check if we want to keep it
            if (KeepAll.includes(file)) continue
    
            // Remove the file
            const Path = `${AllPath}/${file}`
            fs.unlinkSync(Path)

            // Output
            if (Verbose)
                console.log(`Deleted: ${Path}`)
        }
    } else {
        console.error(`WARN: zone/all does not exist!`)
    }


    // Removing english's files
    const EnglishPath = `${GamePath}/zone/english`
    if (fs.existsSync(EnglishPath)){
        for (const file of fs.readdirSync(EnglishPath)) {
            // Check if we want to keep it
            if (KeepEnglish.includes(file)) continue
    
            // Remove the file
            const Path = `${EnglishPath}/${file}`
            fs.unlinkSync(Path)

            // Output
            if (Verbose)
                console.log(`Deleted: ${Path}`)
        }
    } else {
        console.error(`WARN: zone/english does not exist!`)
    }

    // Removing root folders
    for (const dir of fs.readdirSync(GamePath)) {
        // Check if matches
        if (!RemoveFolders.includes(dir)) continue

        // Remove it
        fs.rmSync(dir, { recursive: true, force: true })

        // Output
        if (Verbose)
            console.log(`Deleted: ${dir}`)
    }
}