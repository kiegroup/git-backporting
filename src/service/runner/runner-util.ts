import { MESSAGE_ERROR_PLACEHOLDER, MESSAGE_TARGET_BRANCH_PLACEHOLDER } from "@bp/service/configs/configs.types";

/**
 * Inject the error message in the provided `message`.
 * This is injected in place of the MESSAGE_ERROR_PLACEHOLDER placeholder
 * @param message string that needs to be updated
 * @param errMsg the error message that needs to be injected
 */
export const injectError = (message: string, errMsg: string): string => {
    return message.replace(MESSAGE_ERROR_PLACEHOLDER, errMsg);
};

/**
 * Inject the target branch into the provided `message`.
 * This is injected in place of the MESSAGE_TARGET_BRANCH_PLACEHOLDER placeholder
 * @param message string that needs to be updated
 * @param targetBranch the target branch to inject
 * @returns 
 */
export const injectTargetBranch = (message: string, targetBranch: string): string => {
    return message.replace(MESSAGE_TARGET_BRANCH_PLACEHOLDER, targetBranch);
};