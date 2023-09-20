
import {format} from 'date-fns'

import prismadb from "@/lib/prismadb";
import {BillboardClient} from "./components/billboard-client";
import {BillboardColumn} from "@/app/(dashboard)/[storeId]/(routes)/billboards/components/columns";

const BillBoardsPage = async ({params} : {
    params: {
        storeId: string
    }
}) => {
    const billboards = await prismadb.billboard.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const formatted: BillboardColumn[] = billboards.map((item) => ({
        id: item.id,
        label: item.label,
        createdAt: format(item.createdAt, 'MMMM do, yyyy')
    }))

    return <div className={'flex flex-col'}>
        <div className={'flex-1 space-y-4 p-8 pt-6'}>
            <BillboardClient data={formatted} />
        </div>
    </div>
}

export default BillBoardsPage