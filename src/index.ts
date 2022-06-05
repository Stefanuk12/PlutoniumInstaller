#!/usr/bin/env node

// Dependencies
import * as fs from "fs"
import { program } from "commander"
import { InstallGame, InstallPlutoniumLauncher, InstallServerConfig, TGameKeys } from "./modules/Installer.js";
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
    const InstallGameCommand = program.command("install-game").description("Install a plutonium game")

    // Arguments
    InstallGameCommand.argument("<game>", "the game you want to install. e.g. t6")

    // Options
    InstallGameCommand.option("-v, --verbose", "Enables verbose mode", false)
    InstallGameCommand.option("-s, --server", "Removes files for server use", false)

    // Main functionality
    InstallGameCommand.action((Game, Options) => {
        // Make sure a valid game is entered
        if (TGameKeys.includes(Game) == false){
            return console.error(`Invalid game. Must be: ${TGameKeys.join(" | ")}`)
        }

        //
        console.log("Installing...")
        InstallGame(Game, "./", Options.verbose, Options.server)
    })
}

// Install the launcher
{
    const InstallLauncher = program.command("install-launcher").description("Install the plutonium launcher")

    // Main functionaity
    InstallLauncher.action(async () => {
        console.log("Installing...")
        await InstallPlutoniumLauncher("./")
        console.log("Installed!")
    })
}

// Install server config
{
    const InstallConfig = program.command("install-server-config").description("Install the server config for a plutonium game")

    // Arguments
    InstallConfig.argument("<game>", "the game you want to install. e.g. t6")

    // Main functionaity
    InstallConfig.action(async (Game) => {
        // Make sure a valid game is entered
        if (TGameKeys.includes(Game) == false){
            return console.error(`Invalid game. Must be: ${TGameKeys.join(" | ")}`)
        }

        // Install
        console.log("Installing...")
        await InstallServerConfig(Game, "./")
        console.log("Installed!")
    })
}

// Cleanup
{
    const Cleanup = program.command("cleanup").description("Cleanup a plutonium install for serveruse")

    // Options
    Cleanup.option("-v, --verbose", "Enable verbose mode", false)

    // Main functionality
    Cleanup.action((Options) => {
        console.log("Cleaning...")
        CleanupInstall("./", Options.verbose)
        console.log("Cleaned!")
    })
}

// Parse it all
program.parse(process.argv)