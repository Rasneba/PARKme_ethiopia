export type ArkRideUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  walletBalanceEtb: number;
};

export type ArkRideSpot = {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  description: string;
  latitude: number;
  longitude: number;
  walkMinutes: number;
  walk: string;
  price: number;
  rating: string;
  reviewCount: number;
  capacity: number;
  availableSpaces: number;
  spaces: string;
  covered: boolean;
  evCharging: boolean;
  gateCode: string;
  level: string;
  spaceLabel: string;
  tone: "sage" | "sand" | "rose" | "blue" | "purple";
  label: string;
};

export type ArkRideBooking = {
  id: string;
  spotId: string;
  spotName: string;
  spotAddress: string;
  startsAt: string;
  endsAt: string;
  durationHours: number;
  pricePerHourEtb: number;
  discountEtb: number;
  totalEtb: number;
  status: "active" | "reserved" | "completed" | "cancelled";
  paymentMethod: "wallet" | "telebirr";
  gateCode: string;
  level: string;
  spaceLabel: string;
  qrToken: string;
  createdAt: string;
};

export type WalletTransactionView = {
  id: string;
  type: "deposit" | "booking_payment" | "booking_refund" | "host_payout";
  amountEtb: number;
  note: string;
  bookingId: string | null;
  createdAt: string;
};

export type OwnerSpace = ArkRideSpot & {
  revenueEtb: number;
  bookingCount: number;
};

export type OwnerBlockedDate = {
  spotId: string;
  date: string;
  reason: string;
  priceMultiplier: number;
};

export type OwnerDashboard = {
  hostId: string;
  metrics: {
    totalEarningsEtb: number;
    bookings: number;
    occupancyRate: number;
    rating: string;
    reviewCount: number;
    earningsDelta: number;
    bookingsDelta: number;
    occupancyDelta: number;
  };
  chart: Array<{ day: string; amountEtb: number }>;
  spaces: OwnerSpace[];
  blockedDates: OwnerBlockedDate[];
  payout: {
    amountEtb: number;
    status: string;
    scheduledFor: string;
    bankLabel: string;
    maskedAccount: string;
  };
};

export type ArkRideBootstrap = {
  user: ArkRideUser;
  spots: ArkRideSpot[];
  bookings: ArkRideBooking[];
  activeBooking: ArkRideBooking | null;
  walletTransactions: WalletTransactionView[];
  ownerDashboard: OwnerDashboard;
  generatedAt: string;
};
