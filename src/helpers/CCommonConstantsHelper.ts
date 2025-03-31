/**
 * Common constants class to hold values.
 */
class CCommonConstantsHelper {
    // random
    public static StaffDomain = "smash.org.au";
    public static EveryoneRole = "@everyone";

    // set user type roles
    public static AddRole = "ADD_ROLE";
    public static RemoveRole = "REMOVE_ROLE";
    public static ViewRoles = "VIEW_ROLES";

    // timers
    public static OneSecond = 1000;
    public static OneMinute = CCommonConstantsHelper.OneSecond*60;
    public static OneHour = CCommonConstantsHelper.OneMinute*60;
    public static OneDay = CCommonConstantsHelper.OneHour*24;

    // command properties
    public static ReplyMessage = "ReplyMessage";
    public static ErrorMessage = "ErrorMessage";
    public static ExtraMessage = "ExtraMessage";
    public static Ephemeral = "Ephemeral";
}

export { CCommonConstantsHelper as CommonConstants }