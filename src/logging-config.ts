import { CategoryProvider, Category } from "typescript-logging-category-style";
import { ELoggerCategory } from "./typing-helpers/enums/ELoggerCategory";

const provider = CategoryProvider.createProvider("BoardBasherBot");

export const getLogger = (name: ELoggerCategory): Category => {
    return provider.getCategory(name);
};