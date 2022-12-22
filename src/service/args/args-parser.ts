import { Args } from "@bp/service/args/args.types";

/**
 * Abstract arguments parser interface in charge to parse inputs and 
 * produce a common Args object
 */
export default interface ArgsParser {

  parse(): Args;
}