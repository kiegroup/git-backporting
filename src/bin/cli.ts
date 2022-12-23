#!/usr/bin/env node

import CLIArgsParser from "@bp/service/args/cli/cli-args-parser";
import Runner from "@bp/service/runner/runner";

// create CLI arguments parser
const parser = new CLIArgsParser();

// create runner
const runner = new Runner(parser);

runner.run();