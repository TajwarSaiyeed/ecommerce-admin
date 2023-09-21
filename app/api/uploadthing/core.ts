import {auth} from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = () => {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthenticated");
    return { userId: userId };
};


// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    imageUrl:  f({ image: { maxFileSize: "4MB" } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => {}),
    productImages: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;