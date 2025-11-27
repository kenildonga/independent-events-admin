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
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Swal from "sweetalert2"
import axios from "@/utils/axios"

const taskSchema = z.object({
    taskName: z.string().min(1, "Task name is required"),
    point: z.number().min(1, "Points must be at least 1"),
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required"),
    optionA: z.string().min(1, "Option A is required"),
    optionB: z.string().min(1, "Option B is required"),
    optionC: z.string().min(1, "Option C is required"),
    optionD: z.string().min(1, "Option D is required"),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface Task {
    _id?: string
    taskName: string
    point: number
    question: string
    answer: string
    options: Record<string, string>
}

interface ApiResponse {
  code: number
  message: string
  data: any
}

interface TaskFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task?: Task | null
    onSuccess: () => void
}

export function TaskFormDialog({
    open,
    onOpenChange,
    task,
    onSuccess,
}: TaskFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const isEditMode = !!task?._id

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            taskName: "",
            point: 0,
            question: "",
            answer: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
        },
    })

    // Update form when task prop changes
    React.useEffect(() => {
        if (task) {
            reset({
                taskName: task.taskName || "",
                point: task.point || 0,
                question: task.question || "",
                answer: task.answer || "",
                optionA: task.options?.A || "",
                optionB: task.options?.B || "",
                optionC: task.options?.C || "",
                optionD: task.options?.D || "",
            })
        } else {
            reset({
                taskName: "",
                point: 0,
                question: "",
                answer: "",
                optionA: "",
                optionB: "",
                optionC: "",
                optionD: "",
            })
        }
    }, [task, reset])

    const onSubmit = async (data: TaskFormValues) => {
        setIsSubmitting(true)

        try {
            const requestBody = {
                ...(isEditMode && task?._id ? { taskId: task._id } : {}),
                action: isEditMode ? "edit" : "add",
                value: {
                    taskName: data.taskName,
                    point: data.point,
                    question: data.question,
                    answer: data.answer,
                    options: {
                        A: data.optionA,
                        B: data.optionB,
                        C: data.optionC,
                        D: data.optionD,
                    }
                },
            }

            const response = await axios.post<ApiResponse>("/earn/action-daily-tasks", requestBody)

            if (response.data.code === 1) {
                onSuccess()
                onOpenChange(false)
                reset()
            } else {
                throw new Error(response.data.message || "Operation failed")
            }
        } catch (error: any) {
            console.error("Error submitting task:", error?.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Edit Task" : "Add New Task"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? "Update the task details below."
                            : "Fill in the details to create a new task."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="taskName">Task Name *</Label>
                            <Input
                                id="taskName"
                                placeholder="Enter task name"
                                {...register("taskName")}
                                disabled={isSubmitting}
                            />
                            {errors.taskName && (
                                <p className="text-sm text-red-500">{errors.taskName.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="point">Points *</Label>
                            <Input
                                id="point"
                                type="number"
                                placeholder="Enter points"
                                {...register("point", { valueAsNumber: true })}
                                disabled={isSubmitting}
                            />
                            {errors.point && (
                                <p className="text-sm text-red-500">{errors.point.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="question">Question *</Label>
                            <Textarea
                                id="question"
                                placeholder="Enter question"
                                rows={3}
                                {...register("question")}
                                disabled={isSubmitting}
                            />
                            {errors.question && (
                                <p className="text-sm text-red-500">{errors.question.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="optionA">Option A *</Label>
                                <Input
                                    id="optionA"
                                    placeholder="Enter option A"
                                    {...register("optionA")}
                                    disabled={isSubmitting}
                                />
                                {errors.optionA && (
                                    <p className="text-sm text-red-500">{errors.optionA.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="optionB">Option B *</Label>
                                <Input
                                    id="optionB"
                                    placeholder="Enter option B"
                                    {...register("optionB")}
                                    disabled={isSubmitting}
                                />
                                {errors.optionB && (
                                    <p className="text-sm text-red-500">{errors.optionB.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="optionC">Option C *</Label>
                                <Input
                                    id="optionC"
                                    placeholder="Enter option C"
                                    {...register("optionC")}
                                    disabled={isSubmitting}
                                />
                                {errors.optionC && (
                                    <p className="text-sm text-red-500">{errors.optionC.message}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="optionD">Option D *</Label>
                                <Input
                                    id="optionD"
                                    placeholder="Enter option D"
                                    {...register("optionD")}
                                    disabled={isSubmitting}
                                />
                                {errors.optionD && (
                                    <p className="text-sm text-red-500">{errors.optionD.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="answer">Correct Answer*</Label>
                            <Input
                                id="answer"
                                placeholder="Enter full correct answer"
                                {...register("answer")}
                                disabled={isSubmitting}
                            />
                            {errors.answer && (
                                <p className="text-sm text-red-500">{errors.answer.message}</p>
                            )}
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
                                    ? "Update Task"
                                    : "Add Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
