export interface Delivery {
    deliveryId: string;
    assignedTo: string;
    status: string;
    route: string;
    productDetails: {
        productId: string;
        name: string;
        description: string;
        quantity: number;
    };
    pickupLocation: string;
    deliveryLocation: string;
    scheduledTime: Date;
    deliveredAt: Date;
    createdAt: Date;
    updatedAt: Date;
}