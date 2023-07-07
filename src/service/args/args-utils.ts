import { Args } from "@bp/service/args/args.types";
import * as fs from "fs";

/**
 * Parse the input configuation string as json object and 
 * return it as Args
 * @param configFileContent 
 * @returns {Args}
 */
export function parseArgs(configFileContent: string): Args {
  return JSON.parse(configFileContent) as Args;
}

/**
 * Read a configuration file in json format anf parse it as {Args}
 * @param pathToFile Full path name of the config file, e.g., /tmp/dir/config-file.json
 * @returns {Args}
 */
export function readConfigFile(pathToFile: string): Args {
  const asString: string = fs.readFileSync(pathToFile, "utf-8");
  return parseArgs(asString);
}

/**
 * Return the input only if it is not a blank or null string, otherwise returns undefined
 * @param key input key
 * @returns the value or undefined
 */
export function getOrUndefined(value: string): string | undefined {
  return value !== "" ? value : undefined;
}

// get rid of inner spaces too
export function getAsCleanedCommaSeparatedList(value: string): string[] | undefined {
  // trim the value
  const trimmed: string = value.trim();
  return trimmed !== "" ? trimmed.replace(/\s/g, "").split(",") : undefined; 
}

// preserve inner spaces
export function getAsCommaSeparatedList(value: string): string[] | undefined {
  // trim the value
  const trimmed: string = value.trim();
  return trimmed !== "" ? trimmed.split(",").map(v => v.trim()) : undefined; 
}

export function getAsBooleanOrDefault(value: string): boolean | undefined {
  const trimmed = value.trim();
  return trimmed !== "" ? trimmed.toLowerCase() === "true" : undefined;
}