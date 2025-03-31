/**
 * A list of the different types of user possible on the guild.
 * Different user types grant different roles based on what has been set.
 * @author Benjamin Gulliver (fatherbeno)
 */
export enum EUserType {
    CrewCoordinator = "CREW_COORDINATOR",
    Moderator = "MODERATOR",

    MaidStaff = "MAID_STAFF",
    Staff = "STAFF",
    Alumni = "ALUMNI",

    CurrentMaidCrew = "CURRENT_MAID_CREW",
    CurrentCrew = "CURRENT_CREW",
    MaidCrew = "MAID_CREW",
    Crew = "CREW",

    Error = "ERROR"
}