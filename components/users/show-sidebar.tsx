"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { IconCircleCheckFilled, IconLoader } from "@tabler/icons-react";
import axios from "@/utils/axios";
import dayjs from "dayjs";

type ShowSidebarProps = {
  userId: string;
  isMobile: boolean;
  fallbackName?: string;
};

type AddressDetails = {
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
};

type User = {
  _id?: string;
  name?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  altPhone?: string | null;
  dob?: string | null;
  gender?: string | null;
  status?: string | null;
  profilePic?: string | null;
  referralCode?: string | null;
  referredBy?: string | null;
  yourReferrals?: Array<unknown>;
  signUpStep?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  lastActive?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  height?: string | number | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  points?: {
    balance?: number;
    redeemable?: number;
    totalEarned?: number;
  };
  occupation?: {
    type?: string;
    what?: string;
    which?: string;
  };
  experience?: {
    type?: string;
    about?: string;
  };
  address?: {
    current?: AddressDetails;
    home?: AddressDetails;
    is_home_same_as_current?: boolean;
  };
  emergencyContacts?: {
    parentName?: string;
    parentPhone?: string;
    guardiansName?: string;
    guardiansPhone?: string;
  };
};

type UserResponse = {
  code?: number;
  message?: string;
  data?: User;
};

const formatName = (user?: User | null) => {
  if (!user) {
    return "";
  }

  if (user.name?.trim()) {
    return user.name;
  }

  return [user.firstName, user.lastName].filter(Boolean).join(" ");
};

export default function ShowSidebar({ userId, isMobile, fallbackName }: ShowSidebarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    let isMounted = true;

    const fetchUserDetails = async () => {
      if (!userId) {
        setError("Missing user identifier.");
        setUser(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.post<UserResponse>("/user/get-details", { userId });

        if (!isMounted) {
          return;
        }

        if (response.data?.code === 1 && response.data?.data) {
          setUser(response.data.data);
        } else {
          setUser(null);
          setError(response.data?.message || "Unable to load user details.");
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error).message ||
          "Unable to load user details.";

        setError(message);
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserDetails();

    return () => {
      isMounted = false;
    };
  }, [userId, isDrawerOpen]);

  const fallbackDisplayName = fallbackName?.trim() || "User details";
  const displayName = formatName(user) || fallbackDisplayName;
  const triggerLabel = displayName || "View User Details";
  const isActive = user?.status === "active" || user?.isActive === true;
  const statusLabel =
    user?.status ??
    (user?.isActive === true
      ? "active"
      : user?.isActive === false
        ? "inactive"
        : "unknown");
  const isHomeSameAsCurrent = user?.address?.is_home_same_as_current === true;
  const currentAddressLabel = isHomeSameAsCurrent ? "Home & Current Address" : "Current Address";

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={isDrawerOpen}
      onOpenChange={(openState) => {
        setIsDrawerOpen(openState);
        if (openState) {
          setError(null);
        } else {
          setIsLoading(false);
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left"
          disabled={isLoading && !user}
        >
          {triggerLabel}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{displayName}</DrawerTitle>
          <DrawerDescription>
            {user
              ? "User profile details"
              : isLoading
                ? "Loading user profile details"
                : error || "User profile unavailable"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm max-h-[80vh]">
          {isLoading && (
            <p className="py-8 text-center text-muted-foreground">Loading user details...</p>
          )}

          {!isLoading && !user && (
            <p className="py-8 text-center text-muted-foreground">
              {error || "No user data available."}
            </p>
          )}

          {!isLoading && user && (
            <>
              <div className="flex items-center gap-4">
                <img
                  src={user.profilePic || ""}
                  alt={displayName}
                  className="size-16 rounded-full"
                />
                <div>
                  <div className="font-medium text-lg">{displayName}</div>
                  <div className="text-muted-foreground">{user._id || "Not provided"}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-base">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">First Name</Label>
                    <p className="text-sm font-medium">{user.firstName || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Last Name</Label>
                    <p className="text-sm font-medium">{user.lastName || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Middle Name</Label>
                    <p className="text-sm font-medium">{user.middleName || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{user.email || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm">{user.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Alternative Phone</Label>
                    <p className="text-sm">{user.altPhone || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Date of Birth</Label>
                    <p className="text-sm">{user.dob || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Gender</Label>
                    <p className="text-sm">{user.gender || "Not specified"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                    <Badge variant="outline" className="text-muted-foreground px-1.5 mt-1">
                      {isActive ? (
                        <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 mr-1" />
                      ) : (
                        <IconLoader className="mr-1" />
                      )}
                      {statusLabel}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-base">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Referral Code</Label>
                    <p className="text-sm font-mono">{user.referralCode || "Not available"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Last Active</Label>
                    <p className="text-sm">{user.lastActive ? dayjs(user.lastActive).format("YYYY-MM-DD hh:mm A") : "Not available"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Created At</Label>
                    <p className="text-sm">{user.createdAt ? dayjs(user.createdAt).format("YYYY-MM-DD hh:mm A") : "Not available"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Sign Up Step</Label>
                    <p className="text-sm">{user.signUpStep || "Not available"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Verification Status</Label>
                    <p className="text-sm">
                      <Badge variant={user.isVerified ? "default" : "secondary"}>
                        {user.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-base">Points & Rewards</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <Label className="text-xs font-medium text-muted-foreground">Balance</Label>
                    <p className="text-lg font-semibold">{user.points?.balance ?? 0}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <Label className="text-xs font-medium text-muted-foreground">Redeemable</Label>
                    <p className="text-lg font-semibold">{user.points?.redeemable ?? 0}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <Label className="text-xs font-medium text-muted-foreground">Total Earned</Label>
                    <p className="text-lg font-semibold">{user.points?.totalEarned ?? 0}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-base">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Occupation</Label>
                    <p className="text-sm">
                      {user.occupation?.type || user.occupation?.what || user.occupation?.which
                        ? `${user.occupation.type || ""} ${user.occupation.what || ""} ${user.occupation.which || ""}`.trim()
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Experience</Label>
                    <p className="text-sm">
                      {user.experience?.type || user.experience?.about
                        ? `${user.experience.type || ""} ${user.experience.about || ""}`.trim()
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Height</Label>
                    <p className="text-sm">{user.height ? `${user.height} cm` : "Not specified"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Location</Label>
                    <p className="text-sm">
                      {user.latitude && user.longitude ? `${user.latitude}, ${user.longitude}` : "Not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-base">Address Information</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">{currentAddressLabel}</Label>
                    <div className="text-sm">
                      {user.address?.current?.address_line1 ||
                        user.address?.current?.city ||
                        user.address?.current?.state ||
                        user.address?.current?.zip ? (
                        <div>
                          {user.address?.current?.address_line1 && <p>{user.address?.current?.address_line1}</p>}
                          {user.address?.current?.address_line2 && <p>{user.address?.current?.address_line2}</p>}
                          <p>
                            {[user.address?.current?.city, user.address?.current?.state, user.address?.current?.zip]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Not provided</p>
                      )}
                    </div>
                  </div>
                  {!isHomeSameAsCurrent && (
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Home Address</Label>
                      <div className="text-sm">
                        {user.address?.home?.address_line1 ||
                          user.address?.home?.city ||
                          user.address?.home?.state ||
                          user.address?.home?.zip ? (
                          <div>
                            {user.address?.home?.address_line1 && <p>{user.address?.home?.address_line1}</p>}
                            {user.address?.home?.address_line2 && <p>{user.address?.home?.address_line2}</p>}
                            <p>
                              {[user.address?.home?.city, user.address?.home?.state, user.address?.home?.zip]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Not provided</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-base">Emergency Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Parent Name</Label>
                    <p className="text-sm">{user.emergencyContacts?.parentName || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Parent Phone</Label>
                    <p className="text-sm">{user.emergencyContacts?.parentPhone || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Guardian Name</Label>
                    <p className="text-sm">{user.emergencyContacts?.guardiansName || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Guardian Phone</Label>
                    <p className="text-sm">{user.emergencyContacts?.guardiansPhone || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {(user.referredBy || user.yourReferrals?.length) ? (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold text-base">Referrals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Referred By</Label>
                        <p className="text-sm">{user.referredBy || "None"}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Your Referrals</Label>
                        <p className="text-sm">{user.yourReferrals?.length || 0} referrals</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}