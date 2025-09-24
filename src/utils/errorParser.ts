// Error message parser for better user-friendly descriptions
export function parseErrorMessage(error: unknown): { title: string; description: string } {
  let message = "";
  
  // Handle Axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    // Extract the actual error message from the backend response
    if (axiosError.response?.data?.detail) {
      message = axiosError.response.data.detail;
    } else if (axiosError.response?.data?.message) {
      message = axiosError.response.data.message;
    } else {
      message = axiosError.message || "Request failed";
    }
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error);
  }
  
  // Permission-related errors (403)
  if (message.includes("does not have permission to promote members")) {
    return {
      title: "Permission Denied",
      description: "You do not have permission to promote team members. Only team executives can promote members."
    };
  }
  
  if (message.includes("does not have permission to kick members")) {
    return {
      title: "Permission Denied", 
      description: "You do not have permission to remove team members. Only team executives can remove members."
    };
  }
  
  if (message.includes("does not have permission to delete project")) {
    return {
      title: "Permission Denied",
      description: "You do not have permission to delete projects. Only team executives can delete projects."
    };
  }
  
  if (message.includes("does not have permission to delete event")) {
    return {
      title: "Permission Denied",
      description: "You do not have permission to delete events. Only team executives can delete events."
    };
  }
  
  if (message.includes("Not enough permissions to perform operation on project")) {
    return {
      title: "Permission Denied",
      description: "You do not have permission to perform this action on this project. You must be a team member to access project features."
    };
  }
  
  // Executive-specific restrictions
  if (message.includes("Member is an executive and cannot be kicked")) {
    return {
      title: "Cannot Remove Executive",
      description: "You cannot remove team executives. Only regular members can be removed from the team."
    };
  }
  
  if (message.includes("last executive member and cannot leave")) {
    return {
      title: "Cannot Leave Team",
      description: "You cannot leave the team because you are the last executive member. Promote another member to executive first, or transfer ownership."
    };
  }
  
  // Team membership errors
  if (message.includes("Member is not in the team")) {
    return {
      title: "Member Not Found",
      description: "This member is not part of the team, so they cannot be promoted or removed."
    };
  }
  
  if (message.includes("User is not a member of the team")) {
    return {
      title: "Not a Team Member",
      description: "You are not a member of this team, so you cannot leave it."
    };
  }
  
  // Team/Project existence errors (404)
  if (message.includes("Team does not exist")) {
    return {
      title: "Team Not Found",
      description: "The team you're trying to access no longer exists or has been deleted."
    };
  }
  
  if (message.includes("Project does not exist")) {
    return {
      title: "Project Not Found", 
      description: "The project you're trying to access no longer exists or has been deleted."
    };
  }
  
  if (message.includes("Event does not exist")) {
    return {
      title: "Event Not Found",
      description: "The event you're trying to access no longer exists or has been deleted."
    };
  }
  
  // Budget-related errors
  if (message.includes("Insufficient budget")) {
    return {
      title: "Insufficient Budget",
      description: "The project does not have enough budget to complete this transaction."
    };
  }
  
  // Generic fallback
  return {
    title: "Error",
    description: message || "An unexpected error occurred. Please try again."
  };
}
