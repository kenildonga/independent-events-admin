"use client"

import * as React from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { z } from "zod"

const schema = z.object({
  _id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  event_name: z.string(),
  user_name: z.string(),
  date: z.string(),
  queryOrIssue: z.string().optional(),
  type: z.string(),
  image: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

interface ShowSidebarProps {
  item: z.infer<typeof schema>
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAccept: (item: z.infer<typeof schema>) => void
  onReject: (item: z.infer<typeof schema>) => void
}

export default function ShowSidebar({
  item,
  isOpen,
  onOpenChange,
  onAccept,
  onReject,
}: ShowSidebarProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-xl font-semibold">Report Details</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Review the details of this report and take action.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Event Name</label>
              <p className="text-sm text-muted-foreground break-words">{item.event_name}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">User Name</label>
              <p className="text-sm text-muted-foreground break-words">{item.user_name}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Date</label>
              <p className="text-sm text-muted-foreground break-words">
                {item.date ? new Date(item.date).toLocaleString() : 'Not specified'}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Type</label>
              <div className="flex">
                <Badge
                  variant="outline"
                  className={`px-2 py-1 text-xs font-medium ${item.type === "entry"
                    ? "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
                    : "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700"
                    }`}
                >
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          {item.queryOrIssue && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Query/Issue</label>
              <p className="text-sm text-muted-foreground break-words leading-relaxed">{item.queryOrIssue}</p>
            </div>
          )}
          {item.image && (
            <div className="grid gap-3">
              <label className="text-sm font-medium">Uploaded Image</label>
              <div className="relative w-full max-w-md">
                <img 
                  src={item.image} 
                  alt="Report evidence" 
                  className="w-full h-48 object-cover rounded-lg border shadow-sm"
                />
              </div>
            </div>
          )}
          {item.latitude && item.longitude && (
            <div className="grid gap-3">
              <label className="text-sm font-medium">Location</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Lat: {item.latitude}, Lng: {item.longitude}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const url = `https://maps.google.com/?q=${item.latitude},${item.longitude}`
                    window.open(url, '_blank')
                  }}
                  className="w-full sm:w-auto"
                >
                  View on Map
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-4 border-t">
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={() => onReject(item)}
              className="mr-2 w-full sm:w-auto text-red-700 border-red-300 hover:bg-red-50 order-2 sm:order-1"
            >
              Reject
            </Button>
          </DialogClose>
          <Button
            onClick={() => {
              onAccept(item)
              onOpenChange(false)
            }}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 order-1 sm:order-2"
          >
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
