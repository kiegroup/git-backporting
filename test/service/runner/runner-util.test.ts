import { injectError, injectTargetBranch } from "@bp/service/runner/runner-util";

describe("check runner utilities", () => {
    test("properly inject error message", () => {
        expect(injectError("Original message: {{error}}", "to inject")).toStrictEqual("Original message: to inject");
    });

    test("missing error placeholder in the original message", () => {
        expect(injectError("Original message: {{wrong}}", "to inject")).toStrictEqual("Original message: {{wrong}}");
    });

    test("properly inject target branch into message", () => {
        expect(injectTargetBranch("Original message: {{target-branch}}", "to inject")).toStrictEqual("Original message: to inject");
    });

    test("missing target branch placeholder in the original message", () => {
        expect(injectTargetBranch("Original message: {{wrong}}", "to inject")).toStrictEqual("Original message: {{wrong}}");
    });
});