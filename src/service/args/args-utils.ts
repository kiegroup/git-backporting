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