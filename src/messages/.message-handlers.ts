import * as dmHandler from "./direct-message-handler";
import * as replyHandler from "./reply-message-handler";
import * as generalHandler from "./general-message-handler"

export const messageHandlers = {
    dmHandler,
    replyHandler,
    generalHandler,
}