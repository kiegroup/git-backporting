import { injectError } from "@bp/service/runner/runner-util";

describe("check runner utilities", () => {
    test("properly inject error message", () => {
        expect(injectError("Original message: {{error}}", "to inject")).toStrictEqual("Original message: to inject");
    });

    test("missing placeholder in the original message", () => {
        expect(injectError("Original message: {{wrong}}", "to inject")).toStrictEqual("Original message: {{wrong}}");
    });
});