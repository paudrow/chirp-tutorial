import { User } from "@clerk/clerk-sdk-node";

export const filterUserFromClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.profileImageUrl,
  }
}
