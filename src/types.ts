export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type UserStatus = "active" | "banned" | "pending_verification";
export type UserRole = "user" | "admin";
export type RequestUrgency = "low" | "medium" | "high" | "emergency";
export type RequestStatus = "open" | "matched" | "completed" | "cancelled" | "paid";
export type DonationStatus = "pending" | "completed" | "disputed";
export type ComplaintStatus = "pending" | "investigating" | "resolved";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  bloodType: BloodType;
  lastDonationDate?: string;
  lastCheckupDate?: string;
  status: UserStatus;
  role: UserRole;
  rating?: number;
  gender?: "male" | "female";
  whatsappNumber?: string;
  evcNumber?: string;
  points?: number;
  profilePicture?: string;
  coverPicture?: string;
  location?: string; // City or location
}

export interface BloodRequest {
  id: string;
  recipientUid: string;
  bloodType: BloodType;
  hospitalName: string;
  location: string;
  urgency: RequestUrgency;
  status: RequestStatus;
  createdAt: string;
  donorUid?: string;
  paymentPhone?: string;
  senderPhone?: string;
  contactWhatsApp?: string;
  contactPhone?: string;
}

export interface DonationRecord {
  id: string;
  requestId: string;
  donorUid: string;
  recipientUid: string;
  donationDate: string;
  recipientConfirmed?: boolean;
  donorConfirmed?: boolean;
  status: DonationStatus;
}

export interface Complaint {
  id: string;
  reporterUid: string;
  targetUid: string;
  donationId: string;
  reason: string;
  status: ComplaintStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  receiverUid: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: { [uid: string]: number };
}
