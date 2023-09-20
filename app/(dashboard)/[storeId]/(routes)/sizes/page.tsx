
import {format} from 'date-fns'

import prismadb from "@/lib/prismadb";
import {SizeColumn} from "./components/columns";
import {SizesClient} from "./components/sizes-client";

const SizesPage = async ({params} : {
    params: {
        storeId: string
    }
}) => {
    const sizes = await prismadb.size.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const formatted: SizeColumn[] = sizes.map((item) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        createdAt: format(item.createdAt, 'MMMM do, yyyy')
    }))

    return <div className={'flex flex-col'}>
        <div className={'flex-1 space-y-4 p-8 pt-6'}>
            <SizesClient data={formatted} />
        </div>
    </div>
}

export default SizesPage