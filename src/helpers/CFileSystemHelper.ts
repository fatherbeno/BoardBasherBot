import { existsSync, promises } from "fs";
import { EFileTypeCategory } from "../types/enums/EFileTypeCategory";
import { IFileInfo } from "../types/interfaces/IFileInfo";
import { IFilePayload } from "../types/interfaces/IFilePayload";
import { getLogger } from "../logging-config";
import { ELoggerCategory } from "../types/enums/ELoggerCategory";

/**
 * Helper class that handles loading data from files and saving data to files.
 * @author Benjamin Gulliver (fatherbeno)
 */
class CFileSystemHelper {

    /* -------------------- CLASS STUFF -------------------- */

    /**
     * Loads all required information into a map to facilitate any systems that require file assistance.
     */
    constructor() {
        this._filesMap = new Map<EFileTypeCategory, IFileInfo>([
            [EFileTypeCategory.GeneratedFiles, {
                fileFolder: this._generatedFilesFolder,
                fileName: "",
                fileBase: ""
            }],
            [EFileTypeCategory.CommandProperties, {
                fileFolder: this._filesFolder,
                fileName: this._commandPropertiesFileName,
                fileBase: "{}"
            }],
            [EFileTypeCategory.GlobalProperties, {
                fileFolder: this._filesFolder,
                fileName: this._globalPropertiesFileName,
                fileBase: "{}"
            }],
            [EFileTypeCategory.VerifyRoles, {
                fileFolder: this._filesFolder,
                fileName: this._verifyRolesFileName,
                fileBase: "[]"
            }]
        ]);
    }

    /**
     * A handy map containing all required information about each system that requires file assistance.
     * @private
     */
    private readonly _filesMap: Map<EFileTypeCategory, IFileInfo>;

    private readonly _filesFolder: string = "./src/files"
    private readonly _generatedFilesFolder: string = `./src/files/generated-files`;
    private readonly _commandPropertiesFileName: string = "command-properties.json"
    private readonly _globalPropertiesFileName: string = "global-properties.json"
    private readonly _verifyRolesFileName: string = "verify-roles.json"

    /* -------------------- LOGGING STUFF -------------------- */

    private readonly fileLogger = getLogger(ELoggerCategory.FilesSystem);

    /* -------------------- HELPER SPECIFIC STUFF -------------------- */

    /**
     * Will throw an error if inputted filePath is invalid. Call before needing to use a filePath.
     * @param filePath Filepath that needs to be validated.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private validateFilePath(filePath: string): string {
        if (!filePath) {
            // old and probably won't trigger
            throw new Error("filePath is undefined, please call 'createFile' before any other file related functions.");
        }

        const thirdLastLetterIndex = filePath.length - 4;
        const fourthLastLetterIndex = filePath.length - 5;
        if (filePath[thirdLastLetterIndex] !== '.' && filePath[fourthLastLetterIndex] !== '.') {
            throw new Error("fileName did not include a valid file extension, please give fileName a valid file extension.");
        }

        return filePath;
    }

    /**
     * Checks if a folder exists to create the new file; if it doesn't, it creates the folder.
     * @param fileFolder Path of file folder to validate.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private async validateFileFolder(fileFolder: string) {
        if (!existsSync(fileFolder)) {
            await promises.mkdir(fileFolder);
        }

        return fileFolder;
    }

    /**
     * Checks if a file exists to import new data into; if it doesn't, it creates the file.
     * @param filePath Path of file to validate
     * @param fileBase If file is not present, this is the initial data the file will be created with.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private async validateFileExists(filePath: string, fileBase: string) {
        if (!existsSync(filePath)) {
            await promises.writeFile(filePath, fileBase);
        }

        return filePath;
    }

    /**
     * A culmination of every validation method, validates 100% whether a file can be written to or read.
     * @param fileType Type of file to be validated.
     * @param inFileName Optional name of file when creating generated files.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private async validateFile(fileType: EFileTypeCategory, inFileName?: string): Promise<string> {
        const fileInfo = this.getFileInformation(fileType);
        const filePath = this.validateFilePath(this.getFilePath(fileInfo, inFileName));
        await this.validateFileFolder(fileInfo.fileFolder);
        if (fileType !== EFileTypeCategory.GeneratedFiles) await this.validateFileExists(filePath, fileInfo.fileBase);

        return filePath;
    }

    /**
     * Combines inputted file information and returns a validated filePath string.
     * @param fileInfo Necessary file information used to create the file path.
     * @param inFileName Optional file name used when creating generated files.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private getFilePath(fileInfo: IFileInfo, inFileName?: string): string {
        const fileName = inFileName ? inFileName : fileInfo.fileName;
        return this.validateFilePath(`${fileInfo.fileFolder}/${fileName}`);
    }

    /**
     * Fetches a valid file info object and returns its data.
     * @param fileType Type of file information to be fetched.
     * @author Benjamin Gulliver (fatherbeno)
     * @private
     */
    private getFileInformation(fileType: EFileTypeCategory): IFileInfo {
        const inFileInformation = this._filesMap.get(fileType);
        return inFileInformation ? inFileInformation : {fileFolder: "", fileName: "", fileBase: ""};
    }

    /**
     * Attempts to create a file in the generated-files folder. **ONLY FOR COMMANDS THAT GENERATE NEW FILES**
     * @param fileName Name that will be used when generating file (must include file extension).
     * @param dataToWrite Data that will be written to file when generating.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async createFile(fileName: string, dataToWrite: string): Promise<string> {
        try {
            this.fileLogger.debug("Attempting to create file.");

            const filePath = await this.validateFile(EFileTypeCategory.GeneratedFiles, fileName);
            await promises.writeFile(filePath, dataToWrite);

            this.fileLogger.debug("Successfully created file.");

            return filePath;
        } catch (error) {
            this.fileLogger.error("Failed to create file.", error);
            return "";
        }
    }

    /**
     * Attempts to send a file to the specified channel or member.
     * @param payload IFilePayload to use to send file.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async sendFile(payload: IFilePayload) {
        try {
            this.fileLogger.debug("Attempting to send file to recipient.");

            let filePath = payload.filePath;
            filePath = this.validateFilePath(filePath);
            filePath = await this.validateFileExists(filePath, "")

            payload.recipient.send({content: payload.message, files: [filePath]});
            await promises.rm(filePath);

            this.fileLogger.debug("Successfully sent file to channel.");
        } catch (error) {
            this.fileLogger.error("Failed to send file to channel.", error);
        }
    }

    /**
     * Attempts to read data from a specific file based on the inputted type. Returns read json data.
     * @param fileType Type of file to read from.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async readFile(fileType: EFileTypeCategory) {
        try {
            const filePath = await this.validateFile(fileType);
            const file = await promises.readFile(filePath, "utf-8");

            return JSON.parse(file);
        } catch (error) {
            this.fileLogger.error(`Failed to read the ${fileType.toLowerCase()} file.`);
            throw new Error(error as string);
        }
    }

    /**
     * Attempts to write data to a specific file based on the inputted type.
     * @param fileType Type of file to be written.
     * @param inData Data to write to specific file.
     * @author Benjamin Gulliver (fatherbeno)
     */
    public async writeFile(fileType: EFileTypeCategory, inData: any) {
        try {
            this.fileLogger.debug(`Attempting to write to the ${fileType.toLowerCase()} file.`);

            const filePath = await this.validateFile(fileType);
            const data = JSON.stringify(inData, null, 2);
            await promises.writeFile(filePath, data);

            this.fileLogger.debug(`Successfully wrote to the ${fileType.toLowerCase()} file.`);
        } catch (error) {
            this.fileLogger.error(`Failed to write to the ${fileType.toLowerCase()} file.`);
            throw new Error(error as string);
        }
    }
}

/**
 * Copy of loaded file system.
 */
export const FileSystem = new CFileSystemHelper();