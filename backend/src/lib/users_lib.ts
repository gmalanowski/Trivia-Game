export interface UserProfileResponse {
  message: string; 
  user: {
    id: string;
    username: string;
    bio: string;
    avatarUrl: string;
    title: string;
  };
}