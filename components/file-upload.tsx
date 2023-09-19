"use client";

import {UploadDropzone} from "@/lib/uploadthing";
import Image from "next/image";
import {Trash, X} from "lucide-react";

import "@uploadthing/react/styles.css";
import {Button} from "@/components/ui/button";

interface FileUploadProps {
    disabled?: boolean;
    endpoint: "imageUrl";
    onChange: (url?: string) => void;
    value: string
}

export const FileUpload = ({onChange, value, endpoint}: FileUploadProps) => {
    if (value) {
        return (
            <div className={"relative h-[300px] w-[300px] rounded-md overflow-hidden"}>
                <Image
                    fill
                    src={value}
                    alt={"upload"}
                    className={"rounded-md object-cover"}
                />
                <div
                    className='absolute top-2 right-2 cursor-pointer z-10'
                >
                    <Button
                        variant={'destructive'} size={'icon'}
                        onClick={() => onChange("")}
                        type={"button"}
                    >
                        <Trash className={"h-4 w-4"}/>
                    </Button>
                </div>
            </div>
        );
    }


    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                const imageUrl = res?.[0]?.url;
                onChange(imageUrl);
            }}
            onUploadError={(err: any) => {
                console.error(err);
            }}
        />
    );
}