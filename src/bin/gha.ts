#!/usr/bin/env node

import GHAArgsParser from "@bp/service/args/gha/gha-args-parser";
import Runner from "@bp/service/runner/runner";

// create CLI arguments parser
const parser = new GHAArgsParser();

// create runner
const runner = new Runner(parser);

runner.run();