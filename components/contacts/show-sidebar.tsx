import React from 'react';
import { Button } from "@/components/ui/button"
import { IconEye } from "@tabler/icons-react"
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
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import dayjs from "dayjs";

export default function ShowSidebar({ item, isMobile }: { item: any; isMobile: boolean }) {
  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground bg-gray-200/50 hover:bg-gray-200/70">
          <IconEye />
          <span className="sr-only">View</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.fullName} {item.lastName}</DrawerTitle>
          <DrawerDescription>
            Contact details
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm max-h-[80vh]">
          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-base">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
                <p className="text-sm font-medium">
                  {item.fullName} {item.lastName}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                <p className="text-sm">{item.email}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Subject</Label>
                <p className="text-sm">{item.subject}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Date & Time</Label>
                <p className="text-sm">{dayjs(item.createdAt).format("YYYY-MM-DD hh:mm A")}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
                <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                <p className="text-sm">{item.message}</p>
            </div>
          </div>
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
