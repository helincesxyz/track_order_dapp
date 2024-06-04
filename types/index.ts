// types/index.ts
export enum OrderStatus {
    Placed,
    CourierAssigned,
    Dispatched,
    Delivered,
    Cancelled
}

export interface Order {
    productId: bigint;
    productPrice: bigint;
    courierFee: bigint;
    consumer: string;
    seller: string;
    courier: string;
    status: OrderStatus;
    orderTimestamp: bigint;
    deliveryTime: bigint;
    collateral: bigint;
    orderId: number;
}
