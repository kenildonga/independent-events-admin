"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Swal from "sweetalert2"
import axios from "@/utils/axios"

const jobFormSchema = z.object({
    jobTitle: z.string().min(1, "Job title is required"),
    companyName: z.string().min(1, "Company name is required"),
    location: z.string().min(1, "Location is required"),
    jobType: z.string().min(1, "Job type is required"),
    description: z.string().min(1, "Description is required"),
    salaryStart: z.number().min(0, "Starting salary must be at least 0"),
    salaryEnd: z.number().min(0, "Ending salary must be at least 0"),
    link: z.string().url("Must be a valid URL"),
    isActive: z.boolean(),
})

type JobFormValues = z.infer<typeof jobFormSchema>

interface JobForm {
    _id?: string
    jobTitle: string
    companyName: string
    location: string
    jobType: string
    description: string
    salaryStart: number
    salaryEnd: number
    link: string
    isActive: boolean
}

interface ApiResponse {
  code: number
  message: string
  data: any
}

interface JobFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    jobForm?: JobForm | null
    onSuccess: () => void
}

export function JobFormDialog({
    open,
    onOpenChange,
    jobForm,
    onSuccess,
}: JobFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const isEditMode = !!jobForm?._id

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<JobFormValues>({
        resolver: zodResolver(jobFormSchema),
        defaultValues: {
            jobTitle: "",
            companyName: "",
            location: "",
            jobType: "Full-time",
            description: "",
            salaryStart: 0,
            salaryEnd: 0,
            link: "",
            isActive: true,
        },
    })

    // Update form when jobForm prop changes
    React.useEffect(() => {
        if (jobForm) {
            reset({
                jobTitle: jobForm.jobTitle || "",
                companyName: jobForm.companyName || "",
                location: jobForm.location || "",
                jobType: jobForm.jobType || "Full-time",
                description: jobForm.description || "",
                salaryStart: jobForm.salaryStart || 0,
                salaryEnd: jobForm.salaryEnd || 0,
                link: jobForm.link || "",
                isActive: jobForm.isActive ?? true,
            })
        } else {
            reset({
                jobTitle: "",
                companyName: "",
                location: "",
                jobType: "Full-time",
                description: "",
                salaryStart: 0,
                salaryEnd: 0,
                link: "",
                isActive: true,
            })
        }
    }, [jobForm, reset])

    const onSubmit = async (data: JobFormValues) => {
        setIsSubmitting(true)

        try {
            const requestBody = {
                ...(isEditMode && jobForm?._id ? { formId: jobForm._id } : {}),
                action: isEditMode ? "edit" : "add",
                value: {
                    jobTitle: data.jobTitle,
                    companyName: data.companyName,
                    location: data.location,
                    jobType: data.jobType,
                    description: data.description,
                    salaryStart: data.salaryStart,
                    salaryEnd: data.salaryEnd,
                    link: data.link,
                    isActive: data.isActive,
                },
            }

            const response = await axios.post<ApiResponse>("/other/job-form", requestBody)

            if (response.data.code === 1) {
                onSuccess()
                onOpenChange(false)
                reset()
            } else {
                throw new Error(response.data.message || "Operation failed")
            }
        } catch (error: any) {
            onOpenChange(false)
            await Swal.fire({
                title: "Error!",
                text:
                    error?.response?.data?.message ||
                    error?.message ||
                    `Failed to ${isEditMode ? "update" : "add"} job form. Please try again.`,
                icon: "error",
                confirmButtonColor: "#d33",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Edit Job Form" : "Add New Job Form"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update the job form details below."
                            : "Fill in the details to create a new job form."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="jobTitle">Job Title *</Label>
                            <Input
                                id="jobTitle"
                                placeholder="Enter job title"
                                {...register("jobTitle")}
                                disabled={isSubmitting}
                            />
                            {errors.jobTitle && (
                                <p className="text-sm text-red-500">{errors.jobTitle.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="companyName">Company Name *</Label>
                            <Input
                                id="companyName"
                                placeholder="Enter company name"
                                {...register("companyName")}
                                disabled={isSubmitting}
                            />
                            {errors.companyName && (
                                <p className="text-sm text-red-500">{errors.companyName.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    placeholder="Enter location"
                                    {...register("location")}
                                    disabled={isSubmitting}
                                />
                                {errors.location && (
                                    <p className="text-sm text-red-500">{errors.location.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="jobType">Job Type *</Label>
                                <Controller
                                    name="jobType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger id="jobType">
                                                <SelectValue placeholder="Select job type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Full-time">Full-time</SelectItem>
                                                <SelectItem value="Part-time">Part-time</SelectItem>
                                                <SelectItem value="Contract">Contract</SelectItem>
                                                <SelectItem value="Internship">Internship</SelectItem>
                                                <SelectItem value="Freelance">Freelance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.jobType && (
                                    <p className="text-sm text-red-500">{errors.jobType.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Enter job description"
                                rows={4}
                                {...register("description")}
                                disabled={isSubmitting}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="salaryStart">Salary Start *</Label>
                                <Input
                                    id="salaryStart"
                                    type="number"
                                    placeholder="Enter starting salary"
                                    {...register("salaryStart", { valueAsNumber: true })}
                                    disabled={isSubmitting}
                                />
                                {errors.salaryStart && (
                                    <p className="text-sm text-red-500">{errors.salaryStart.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="salaryEnd">Salary End *</Label>
                                <Input
                                    id="salaryEnd"
                                    type="number"
                                    placeholder="Enter ending salary"
                                    {...register("salaryEnd", { valueAsNumber: true })}
                                    disabled={isSubmitting}
                                />
                                {errors.salaryEnd && (
                                    <p className="text-sm text-red-500">{errors.salaryEnd.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="link">Application Link *</Label>
                            <Input
                                id="link"
                                type="url"
                                placeholder="https://example.com/apply"
                                {...register("link")}
                                disabled={isSubmitting}
                            />
                            {errors.link && (
                                <p className="text-sm text-red-500">{errors.link.message}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                {...register("isActive")}
                                disabled={isSubmitting}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="isActive" className="cursor-pointer">
                                Active
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Saving..."
                                : isEditMode
                                    ? "Update Job Form"
                                    : "Add Job Form"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
