import {format} from 'date-fns'

import prismadb from "@/lib/prismadb";
import {ProductClient} from "./components/product-client";
import {formattor} from "@/lib/utils";
import {ProductColumn} from "./components/columns";

const ProductsPage = async ({params}: {
    params: {
        storeId: string
    }
}) => {
    const products = await prismadb.product.findMany({
        where: {
            storeId: params.storeId
        },
        include: {
            category: true,
            size: true,
            color: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    const formatted: ProductColumn[] = products.map((item) => ({
        id: item.id,
        name: item.name,
        isFeatured: item.isFeatured,
        isArchived:item.isArchived,
        price: formattor.format(item.price.toNumber()),
        category: item.category.name,
        size: item.size.name,
        color: item.color.value,
        createdAt: format(item.createdAt, 'MMMM do, yyyy')
    }))

    return <div className={'flex flex-col'}>
        <div className={'flex-1 space-y-4 p-8 pt-6'}>
            <ProductClient data={formatted}/>
        </div>
    </div>
}

export default ProductsPage