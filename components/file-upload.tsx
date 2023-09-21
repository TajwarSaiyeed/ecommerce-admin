"use client";

import {UploadDropzone} from "@/lib/uploadthing";
import Image from "next/image";
import {Trash, X} from "lucide-react";

import "@uploadthing/react/styles.css";
import {Button} from "@/components/ui/button";

interface FileUploadProps {
    disabled?: boolean;
    endpoint: "imageUrl" | "productImages";
    onChange?: (url?: string) => void
    value?: string;
    productImages?: string[];
    onProductImagesChange?: (url: string[]) => void
}

export const FileUpload = ({onChange, value, endpoint, productImages, onProductImagesChange}: FileUploadProps) => {
    if (value && endpoint === "imageUrl") {
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
                        onClick={() => onChange ? onChange("") : null}
                        type={"button"}
                    >
                        <Trash className={"h-4 w-4"}/>
                    </Button>
                </div>
            </div>
        );
    }


    if (productImages && endpoint === 'productImages') {
        return productImages.map((image, index) => (
            <div key={index} className={"relative h-[300px] w-[300px] bg-zinc-400 rounded-md overflow-hidden"}>
                <Image
                    fill
                    src={image}
                    alt={"upload"}
                    className={"rounded-md object-cover"}
                />
                <div
                    className='absolute top-2 right-2 cursor-pointer z-10'
                >
                    <Button
                        variant={'destructive'} size={'icon'}
                        onClick={() => onProductImagesChange && onProductImagesChange(productImages.filter((image, i) => i !== index))}
                        type={"button"}
                    >
                        <Trash className={"h-4 w-4"}/>
                    </Button>
                </div>
            </div>
        ))
    }


    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                if (endpoint === 'imageUrl') {
                    const imageUrl = res?.[0]?.url;
                    if (onChange) {
                        onChange(imageUrl);
                    }
                } else if (endpoint === "productImages" && onProductImagesChange) {
                    const imageUrls = res?.map((image) => image.url) || [];
                    onProductImagesChange(imageUrls);
                }
            }}

            onUploadError={(err: any) => {
                console.error(err);
            }}
        />
    );
}