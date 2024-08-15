"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { APP_ID, DISCORD_TOKEN, PUBLIC_KEY } = process.env;
if (!APP_ID || !DISCORD_TOKEN || !PUBLIC_KEY) {
    throw new Error("Missing environment variables");
}
exports.config = {
    APP_ID,
    DISCORD_TOKEN,
    PUBLIC_KEY,
};
