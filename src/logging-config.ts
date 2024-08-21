import { CategoryProvider, Category } from "typescript-logging-category-style";
import { ELoggerCategory } from "./typing-helpers/enums/ELoggerCategory";
import { LogLevel } from "typescript-logging";

const provider = CategoryProvider.createProvider("BoardBasherBot", {
    level: LogLevel.Debug
});

export const getLogger = (name: ELoggerCategory): Category => {
    return provider.getCategory(name);
};