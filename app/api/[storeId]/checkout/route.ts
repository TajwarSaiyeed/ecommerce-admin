import {Stripe} from 'stripe'
import {NextRequest, NextResponse} from "next/server";
import {stripe} from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
}

export async function OPTIONS() {
    return NextResponse.json({}, {headers: corsHeaders})
}

export async function POST(req: Request, {params}: {
    params: {
        storeId: string
    }
}) {
    const {productIds} = await req.json()
    if (!productIds || productIds.length === 0) {
        return new NextResponse("Product ids are required", {status: 400})
    }

    const products = await prismadb.product.findMany({
        where: {
            id: {
                in: productIds
            }
        }
    })

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    products.forEach(product => {
        line_items.push({
            quantity: 1,
            price_data: {
                currency: "USD",
                product_data: {
                    name: product.name
                },
                unit_amount: product.price.toNumber() * 100
            }
        })
    })

    const order = await prismadb.order.create({
        data: {
            storeId: params.storeId,
            isPaid: false,
            orderItems: {
                create: productIds.map((productId: string) => ({
                    product: {
                        connect: {
                            id: productId
                        }
                    }
                }))
            }
        }
    })

    const session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        billing_address_collection: "required",
        phone_number_collection: {
            enabled: true
        },
        success_url: `${process.env.FRONTEND_STORE_URL}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=true`,
        metadata: {
            orderId: order.id
        }
    })

    return NextResponse.json({url: session.url}, {
        headers: corsHeaders
    })
}

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const sessionId = searchParams.get("sessionId") as string;

    if (!sessionId) {
        return NextResponse.json(
            {error: "Missing session id"},
            {status: 400}
        );
    }

    if (!sessionId.startsWith("cs_")) {
        throw new Error("Invalid session id");
    }

    const checkoutSession = (await stripe.checkout.sessions.retrieve(
        sessionId,
        {
            expand: ["payment_intent", 'line_items'],

        }
    )) as Stripe.Checkout.Session;

    if (checkoutSession.payment_status === 'paid') {
        const address = checkoutSession.customer_details?.address;

        const addressComponents = [
            address?.line1,
            address?.line2,
            address?.city,
            address?.state,
            address?.postal_code,
            address?.country
        ]

        const addressString = addressComponents.filter(c => c !== null).join(', ');

        const order = await prismadb.order.update({
            where: {
                id: checkoutSession.metadata?.orderId
            }, data: {
                isPaid: true,
                address: addressString,
                phone: checkoutSession?.customer_details?.phone || ''
            }, include: {
                orderItems: true
            }
        })

        const productIds = order.orderItems.map(orderItem => orderItem.productId)

        await prismadb.product.updateMany({
            where: {
                id: {
                    in: productIds
                }
            },
            data: {
                isArchived: true
            }
        })
        return NextResponse.json(null, {status: 200, headers: corsHeaders})
    }
}