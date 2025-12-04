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
          <DrawerTitle>{item.jobTitle}</DrawerTitle>
          <DrawerDescription>
            {item.companyName}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm max-h-[80vh]">
          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-base">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Job Title</Label>
                <p className="text-sm font-medium">
                  {item.jobTitle}
                </p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Company</Label>
                <p className="text-sm">{item.companyName}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Location</Label>
                <p className="text-sm">{item.location}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Job Type</Label>
                <p className="text-sm">{item.jobType}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Salary Range</Label>
                <p className="text-sm">${item.salaryStart?.toLocaleString()} - ${item.salaryEnd?.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Created At</Label>
                <p className="text-sm">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <p className="text-sm">{item.isActive ? "Active" : "Inactive"}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Application Link</Label>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline"
                >
                  Apply Here
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base">Description</h3>
            <div>
                <p className="text-sm">{item.description}</p>
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
