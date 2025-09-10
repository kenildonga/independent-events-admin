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

export default function ShowSidebar({ item, isMobile }: { item: any; isMobile: boolean }) {
  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.title}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.title}</DrawerTitle>
          <DrawerDescription>
            Event details and requirements
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm max-h-[80vh]">
          {/* Event Image and Basic Info */}
          {item.imageUrl && (
            <div className="flex justify-center">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full max-w-sm rounded-lg object-cover"
              />
            </div>
          )}

          {/* Event Description */}
          {item.description && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Description</Label>
              <p className="text-sm mt-1">{item.description}</p>
            </div>
          )}

          <Separator />

          {/* Event Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Event Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <Badge variant="outline" className={`px-1.5 mt-1 ${item.isActive
                    ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
                    : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
                  }`}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Payment</Label>
                <p className="text-sm font-semibold">${item.payment}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Filter</Label>
                <p className="text-sm">{item.filterName || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Created At</Label>
                <p className="text-sm">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Not available'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Updated At</Label>
                <p className="text-sm">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Not available'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Location</h3>
            <div className="space-y-3">
              {Array.isArray(item.location) && item.location.length > 0 ? (
                item.location.map((loc: any, index: number) => (
                  <div key={index} className="bg-muted/50 p-4 rounded-lg border">
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Venue Name</Label>
                        <p className="text-sm font-medium">{loc.name}</p>
                      </div>
                      {loc.link && typeof loc.link === 'string' && loc.link.trim() !== '' && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Location Link</Label>
                          <a href={loc.link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:underline">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            View on Map
                          </a>
                        </div>
                      )}
                      {loc.note && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Location Note</Label>
                          <p className="text-sm">{loc.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No locations specified</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Event Dates */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Event Dates</h3>
            <div className="space-y-3">
              {item.dates?.map((dateInfo: any, index: number) => (
                <div key={index} className="bg-muted/50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Date</Label>
                      <p className="text-sm font-medium">
                        {dateInfo.date ? new Date(dateInfo.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Invalid date'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Start Time</Label>
                      <p className="text-sm">{dateInfo.startTime}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">End Time</Label>
                      <p className="text-sm">{dateInfo.endTime}</p>
                    </div>
                  </div>
                </div>
              )) || (item.start_date && item.end_date) && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">Start Date</Label>
                      <p className="text-sm font-medium">
                        {item.start_date ? new Date(item.start_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not available'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">End Date</Label>
                      <p className="text-sm font-medium">
                        {item.end_date ? new Date(item.end_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not available'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Staff Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <Label className="text-xs font-medium text-muted-foreground">Boys</Label>
                <p className="text-lg font-semibold">{item.required?.boys || 0}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <Label className="text-xs font-medium text-muted-foreground">Girls</Label>
                <p className="text-lg font-semibold">{item.required?.girls || 0}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <Label className="text-xs font-medium text-muted-foreground">Any</Label>
                <p className="text-lg font-semibold">{item.required?.any || 0}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Work Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">Work Details</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                <p className="text-sm">{item.workDetails || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Dress Code</Label>
                <p className="text-sm">{item.dressCode || 'Not specified'}</p>
              </div>
              {item.note && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Additional Notes</Label>
                  <p className="text-sm">{item.note}</p>
                </div>
              )}
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