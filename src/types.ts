export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  photoURLs: string[];
  bio: string;
  gender: 'male' | 'female' | 'other';
  birthday: string;
  occupation: string;
  interests: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  isPremium: boolean;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Match {
  id: string;
  users: string[];
  createdAt: number;
  lastMessage?: string;
  lastMessageAt?: number;
  otherUser?: UserProfile;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  createdAt: number;
  read: boolean;
}

export interface Swipe {
  id: string;
  fromUid: string;
  toUid: string;
  type: 'like' | 'nope' | 'superlike';
  createdAt: number;
}
