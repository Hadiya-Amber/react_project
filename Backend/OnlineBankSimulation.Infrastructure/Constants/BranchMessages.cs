namespace OnlineBank.Core.Constants
{
    public static class BranchMessages
    {
        public const string BranchCreated = "Branch created successfully.";
        public const string BranchUpdated = "Branch details updated successfully.";
        public const string BranchNotFound = "Branch not found.";
        public const string BranchActivated = "Branch has been activated successfully.";
        public const string BranchDeactivated = "Branch has been deactivated successfully.";
        public const string BranchCodeExists = "Branch code already exists.";
        public const string InvalidBranchCode = "Invalid branch code format.";
        public const string BranchHasActiveAccounts = "Cannot deactivate branch with active accounts.";
        public const string EmployeeAssigned = "Employee assigned to branch successfully.";
        public const string EmployeeUnassigned = "Employee unassigned from branch successfully.";
        public const string UnauthorizedBranchAccess = "You don't have access to this branch.";
    }
}