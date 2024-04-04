import { MESSAGE_ERROR_PLACEHOLDER } from "@bp/service/configs/configs.types";

/**
 * Inject the error message in the provided `message`.
 * This is inject in place of the MESSAGE_ERROR_PLACEHOLDER placeholder
 * @param message string that needs to be updated
 * @param errMsg the error message that needs to be injected
 */
export const injectError = (message: string, errMsg: string): string => {
    return message.replace(MESSAGE_ERROR_PLACEHOLDER, errMsg);
};