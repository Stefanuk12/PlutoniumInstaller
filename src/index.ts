#!/usr/bin/env node

// Dependencies
import * as fs from "fs"
import { program } from "commander"
import { InstallGame, InstallIW4MAdmin, InstallPlutoniumLauncher, InstallServerConfig, TGameKeys } from "./modules/Installer.js";
import { CleanupInstall } from "./modules/Cleanup.js";

// Vars
const PackageData = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf-8"))

// Program Data
program
    .name(PackageData.name)
    .description(PackageData.description)
    .version(PackageData.version);

// Install a game
{
    const Command = program.command("install-game").description("Install a plutonium game")

    // Arguments
    Command.argument("<game>", "the game you want to install. e.g. t6")

    // Options
    Command.option("-p, --path <string>", "Installation path", "./")
    Command.option("-v, --verbose", "Enables verbose mode", false)
    Command.option("-s, --server", "Removes files for server use", false)
    Command.option("-f, --force", "Forces the install, if install detected", false)

    // Main functionality
    Command.action(async (Game, Options) => {
        // Make sure a valid game is entered
        if (TGameKeys.includes(Game) == false){
            return console.error(`Invalid game. Must be: ${TGameKeys.join(" | ")}`)
        }

        //
        console.log("Installing...")
        await InstallGame(Game, Options.path, Options.verbose, Options.server, Options.force)
        console.log("Installed!")
        process.exit(0)
    })
}

// Install the launcher
{
    const Command = program.command("install-launcher").description("Install the plutonium launcher")

    // Options
    Command.option("-p, --path <string>", "Installation path", "./")

    // Main functionaity
    Command.action(async (Options) => {
        console.log("Installing...")
        await InstallPlutoniumLauncher(Options.path)
        console.log("Installed!") 
    })
}

// Install server config
{
    const Command = program.command("install-server-config").description("Install the server config for a plutonium game")

    // Arguments
    Command.argument("<game>", "the game you want to install. e.g. t6")

    // Options
    Command.option("-p, --path <string>", "Installation path", "./")

    // Main functionaity
    Command.action(async (Game, Options) => {
        // Make sure a valid game is entered
        if (TGameKeys.includes(Game) == false){
            return console.error(`Invalid game. Must be: ${TGameKeys.join(" | ")}`)
        }

        // Install
        console.log("Installing...")
        await InstallServerConfig(Game, Options.path)
        console.log("Installed!")
    })
}

// Install IW4M Admin
{
    const Command = program.command("install-iw4m-admin").description("Install IW4M Admin")

    // Options
    Command.option("-p, --path <string>", "Installation path", "./")

    // Main functionaity
    Command.action(async (Options) => {
        // Install
        console.log("Installing...")
        await InstallIW4MAdmin(Options.path)
        console.log("Installed!")
    })
}

// Cleanup
{
    const Command = program.command("cleanup").description("Cleanup a plutonium install for serveruse")

    // Options
    Command.option("-p, --path <string>", "Installation path", "./")
    Command.option("-v, --verbose", "Enable verbose mode", false)

    // Main functionality
    Command.action((Options) => {
        console.log("Cleaning...")
        CleanupInstall(Options.path, Options.verbose)
        console.log("Cleaned!")
    })
}

// Parse it all
program.parse(process.argv)