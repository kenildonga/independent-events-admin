import apiClient from "./axios"

type UploadFileResponse = {
    code: number
    message: string
    data: {
        publicUrl: string
        fileKey: string
        contentType: string
        size: number
        filename: string
        filetype: string
    }
}

export type UploadedFile = {
    publicUrl: string
    fileKey: string
    filename: string
}

const UPLOAD_ENDPOINT = process.env.NEXT_PUBLIC_UPLOAD_URL ?? "/other/upload-file"

/**
 * Upload file directly to the backend
 */
export async function uploadChatMedia(file: File): Promise<UploadedFile> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "chat-media")

    const response = await apiClient.post<UploadFileResponse>(UPLOAD_ENDPOINT, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    if (response.data?.code !== 1 || !response.data?.data?.publicUrl) {
        throw new Error(response.data?.message ?? "Failed to upload file")
    }

    const { publicUrl, fileKey, filename } = response.data.data

    return {
        publicUrl,
        fileKey,
        filename
    }
}
