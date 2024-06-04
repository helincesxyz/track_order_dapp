import { useRouter } from 'next/router';
import { useOrderContext } from '../context/OrderContext';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { OrderStatus, Order } from '../types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Tooltip from '@mui/material/Tooltip';
import { ClipboardIcon } from '@heroicons/react/24/outline';

const OrderDetailsPage: React.FC = () => {
    const { orders, role, registerCourier, dispatchOrder, verifyDelivery, cancelOrder, claimFunds, withdrawAfterTimeout } = useOrderContext();
    const router = useRouter();
    const { orderId } = router.query;

    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (orderId && Array.isArray(orders)) {
            const foundOrder = orders.find(o => o.orderId === parseInt(orderId as string));
            setOrder(foundOrder || null);
        }
    }, [orderId, orders]);

    useEffect(() => {
        // This useEffect will trigger a re-render when the role changes
    }, [role]);

    if (!order) {
        return <div>Loading...</div>;
    }

    const handleAction = async (action: () => Promise<void>) => {
        await action();
        // Optionally, you can refetch the orders or handle state updates here
    };

    const handleBackToHome = () => {
        switch (role) {
            case 'admin':
                router.push('/');
                break;
            case 'consumer':
                router.push('/consumer');
                break;
            case 'courier':
                router.push('/courier');
                break;
            case 'seller':
                router.push('/seller');
                break;
            default:
                router.push('/');
                break;
        }
    };

    return (
        <div>
            <Navbar />
            <main className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="max-w-6xl w-full mx-auto bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">Order Details</h1>
                    <table className="min-w-full bg-white mb-4">
                        <tbody>
                            <tr>
                                <td className="py-2 px-4 border-b font-bold">Order ID</td>
                                <td className="py-2 px-4 border-b">{order.orderId.toString()}</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 border-b font-bold">Product ID</td>
                                <td className="py-2 px-4 border-b">{order.productId.toString()}</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 border-b font-bold">Product Price (wei)</td>
                                <td className="py-2 px-4 border-b">{order.productPrice.toString()}</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 border-b font-bold">Courier Fee (wei)</td>
                                <td className="py-2 px-4 border-b">{order.courierFee.toString()}</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 border-b font-bold">Consumer</td>
                                <td className="py-2 px-4 border-b flex items-center">
                                    {order.consumer}
                                    <CopyToClipboard text={order.consumer}>
                                        <Tooltip title="Copy">
                                            <button className="ml-2 text-gray-400 hover:text-gray-300">
                                                <ClipboardIcon className="h-5 w-5" />
                                            </button>
                                        </Tooltip>
                                    </CopyToClipboard>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 border-b font-bold">Seller</td>
                                <td className="py-2 px-4 border-b flex items-center">
                                    {order.seller}
                                    <CopyToClipboard text={order.seller}>
                                        <Tooltip title="Copy">
                                            <button className="ml-2 text-gray-400 hover:text-gray-300">
                                                <ClipboardIcon className="h-5 w-5" />
                                            </button>
                                        </Tooltip>
                                    </CopyToClipboard>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 border-b font-bold">Courier</td>
                                <td className="py-2 px-4 border-b flex items-center">
                                    {order.courier ? order.courier : 'N/A'}
                                    {order.courier && (
                                        <CopyToClipboard text={order.courier}>
                                            <Tooltip title="Copy">
                                                <button className="ml-2 text-gray-400 hover:text-gray-300">
                                                    <ClipboardIcon className="h-5 w-5" />
                                                </button>
                                            </Tooltip>
                                        </CopyToClipboard>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 border-b font-bold">Status</td>
                                <td className="py-2 px-4 border-b">{OrderStatus[order.status]}</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 border-b font-bold">Order Timestamp</td>
                                <td className="py-2 px-4 border-b">{new Date(Number(order.orderTimestamp) * 1000).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 border-b font-bold">Delivery Time</td>
                                <td className="py-2 px-4 border-b">{order.deliveryTime.toString()} seconds</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-4 border-b font-bold">Collateral</td>
                                <td className="py-2 px-4 border-b">{order.collateral.toString()}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="flex space-x-4">
                        {role === 'admin' && (
                            <>
                                <button 
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                    onClick={() => handleAction(() => registerCourier(order.orderId))}
                                >
                                    Register Courier
                                </button>
                                <button 
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                                    onClick={() => handleAction(() => dispatchOrder(order.orderId))}
                                >
                                    Dispatch Order
                                </button>
                                <button 
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                    onClick={() => handleAction(() => verifyDelivery(order.orderId))}
                                >
                                    Verify Delivery
                                </button>
                                <button 
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                    onClick={() => handleAction(() => cancelOrder(order.orderId))}
                                >
                                    Cancel Order
                                </button>
                                <button 
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                    onClick={() => handleAction(claimFunds)}
                                >
                                    Claim Funds
                                </button>
                                <button 
                                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                                    onClick={() => handleAction(() => withdrawAfterTimeout(order.orderId))}
                                >
                                    Withdraw After Timeout
                                </button>
                            </>
                        )}
                        {role === 'courier' && (
                            <>
                                <button 
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                    onClick={() => handleAction(() => registerCourier(order.orderId))}
                                >
                                    Register Courier
                                </button>
                                <button 
                                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                                    onClick={() => handleAction(() => dispatchOrder(order.orderId))}
                                >
                                    Dispatch Order
                                </button>
                            </>
                        )}
                        {role === 'consumer' && (
                            <>
                                <button 
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                    onClick={() => handleAction(() => verifyDelivery(order.orderId))}
                                >
                                    Verify Delivery
                                </button>
                                <button 
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                    onClick={() => handleAction(() => cancelOrder(order.orderId))}
                                >
                                    Cancel Order
                                </button>
                            </>
                        )}
                        {role === 'seller' && (
                            <>
                                <button 
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                    onClick={() => handleAction(claimFunds)}
                                >
                                    Claim Funds
                                </button>
                            </>
                        )}
                    </div>
                    <button
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        onClick={handleBackToHome}
                    >
                        Back to Home
                    </button>
                </div>
            </main>
        </div>
    );
};

export default OrderDetailsPage;
