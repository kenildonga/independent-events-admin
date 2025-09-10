import React from 'react';
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

export default function ShowSidebar({ item, isMobile }: { item: any; isMobile: boolean }) {
    return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>
            User profile details
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm max-h-[80vh]">
          {/* Profile Picture and Basic Info */}
          <div className="flex items-center gap-4">
            <img
              src={item.profilePic}
              alt={item.name}
              className="size-16 rounded-full"
            />
            <div>
              <div className="font-medium text-lg">{item.name}</div>
              <div className="text-muted-foreground">{item.email}</div>
              <div className="text-muted-foreground">{item.phone}</div>
            </div>
          </div>

          <Separator />

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
                <p className="text-sm font-medium">
                  {[item.firstName, item.middleName, item.lastName].filter(Boolean).join(' ') || item.name}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                <p className="text-sm">{item.email}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                <p className="text-sm">{item.phone}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Alternative Phone</Label>
                <p className="text-sm">{item.altPhone || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Date of Birth</Label>
                <p className="text-sm">{item.dob || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Gender</Label>
                <p className="text-sm">{item.gender || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Join Date</Label>
                <p className="text-sm">{item.joinDate}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <Badge variant="outline" className="text-muted-foreground px-1.5 mt-1">
                  {item.status === "active" ? (
                    <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 mr-1" />
                  ) : (
                    <IconLoader className="mr-1" />
                  )}
                  {item.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">User ID</Label>
                <p className="text-sm font-mono">{item.id}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Referral Code</Label>
                <p className="text-sm font-mono">{item.referralCode || 'Not available'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Last Active</Label>
                <p className="text-sm">{item.lastActive || 'Not available'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Created At</Label>
                <p className="text-sm">{item.createdAt || item.joinDate}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Sign Up Step</Label>
                <p className="text-sm">{item.signUpStep || 'Not available'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Verification Status</Label>
                <p className="text-sm">
                  <Badge variant={item.isVerified ? "default" : "secondary"}>
                    {item.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Points Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Points & Rewards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <Label className="text-xs font-medium text-muted-foreground">Balance</Label>
                <p className="text-lg font-semibold">{item.points?.balance || 0}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <Label className="text-xs font-medium text-muted-foreground">Redeemable</Label>
                <p className="text-lg font-semibold">{item.points?.redeemable || 0}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <Label className="text-xs font-medium text-muted-foreground">Total Earned</Label>
                <p className="text-lg font-semibold">{item.points?.totalEarned || 0}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Occupation</Label>
                <p className="text-sm">
                  {item.occupation?.type || item.occupation?.what || item.occupation?.which
                    ? `${item.occupation.type || ''} ${item.occupation.what || ''} ${item.occupation.which || ''}`.trim()
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Experience</Label>
                <p className="text-sm">
                  {item.experience?.type || item.experience?.about
                    ? `${item.experience.type || ''} ${item.experience.about || ''}`.trim()
                    : 'Not specified'}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Height</Label>
                <p className="text-sm">{item.height ? `${item.height} cm` : 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Location</Label>
                <p className="text-sm">
                  {item.latitude && item.longitude
                    ? `${item.latitude}, ${item.longitude}`
                    : 'Not available'}
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Address Information</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Current Address</Label>
                <div className="text-sm">
                  {item.address?.current?.address_line1 ||
                   item.address?.current?.city ||
                   item.address?.current?.state ||
                   item.address?.current?.zip ? (
                    <div>
                      {item.address.current.address_line1 && <p>{item.address.current.address_line1}</p>}
                      {item.address.current.address_line2 && <p>{item.address.current.address_line2}</p>}
                      <p>
                        {[item.address.current.city, item.address.current.state, item.address.current.zip]
                          .filter(Boolean).join(', ')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Not provided</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Home Address</Label>
                <div className="text-sm">
                  {item.address?.home?.address_line1 ||
                   item.address?.home?.city ||
                   item.address?.home?.state ||
                   item.address?.home?.zip ? (
                    <div>
                      {item.address.home.address_line1 && <p>{item.address.home.address_line1}</p>}
                      {item.address.home.address_line2 && <p>{item.address.home.address_line2}</p>}
                      <p>
                        {[item.address.home.city, item.address.home.state, item.address.home.zip]
                          .filter(Boolean).join(', ')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Emergency Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Parent Name</Label>
                <p className="text-sm">{item.emergencyContacts?.parentName || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Parent Phone</Label>
                <p className="text-sm">{item.emergencyContacts?.parentPhone || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Guardian Name</Label>
                <p className="text-sm">{item.emergencyContacts?.guardiansName || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Guardian Phone</Label>
                <p className="text-sm">{item.emergencyContacts?.guardiansPhone || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Referrals */}
          {(item.referredBy || item.yourReferrals?.length) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Referrals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Referred By</Label>
                    <p className="text-sm">{item.referredBy || 'None'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Your Referrals</Label>
                    <p className="text-sm">{item.yourReferrals?.length || 0} referrals</p>
                  </div>
                </div>
              </div>
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