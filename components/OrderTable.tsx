import { useState, useEffect } from 'react';
import { useOrderContext } from '../context/OrderContext';
import { OrderStatus, Order } from '../types';
import OrderDetailsModal from './modals/OrderDetailsModal';
import { useRouter } from 'next/router';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Tooltip from '@mui/material/Tooltip';
import { ClipboardIcon, ClipboardDocumentCheckIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const truncateAddress = (address: string, length: number = 10) => {
    if (address.length <= length) return address;
    const start = address.slice(0, 6);
    const end = address.slice(-4);
    return `${start}...${end}`;
};

const OrderTable: React.FC<{ role: string }> = ({ role }) => {
    const { orders, fetchOrders, currentAccount } = useOrderContext();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const router = useRouter();

    useEffect(() => {
        // Fetch orders immediately when the component mounts
        fetchOrders();

        // Set up an interval to fetch orders every 12 seconds
        const interval = setInterval(() => {
            fetchOrders();
        }, 12000);

        // Clean up the interval on component unmount
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleDetailsClick = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailsModalOpen(true);
    };

    const handleViewDetailsPage = (orderId: number) => {
        router.push(`/OrderDetailsPage?orderId=${orderId}`);
    };

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedOrders = [...orders].sort((a, b) => {
        if (!sortKey) return 0;
        const aValue = a[sortKey as keyof Order];
        const bValue = b[sortKey as keyof Order];
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredOrders = sortedOrders.filter(order => {
        if (role === 'admin') {
            return true;
        } else if (role === 'seller') {
            return order.seller === currentAccount;
        } else if (role === 'courier') {
            return order.courier === '' || order.courier === currentAccount;
        } else if (role === 'consumer') {
            return order.consumer === currentAccount;
        }
        return false;
    });

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        {['orderId', 'productId', 'productPrice(wei)', 'courierFee(wei)', 'consumer', 'seller', 'courier', 'status', 'orderTimestamp', 'deliveryTime', 'collateral'].map((key) => (
                            <th key={key} className="py-2 px-4 border-b cursor-pointer" onClick={() => handleSort(key)}>
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                {sortKey === key && (
                                    sortDirection === 'asc' ? 
                                    <ChevronUpIcon className="inline-block w-4 h-4 ml-2" /> : 
                                    <ChevronDownIcon className="inline-block w-4 h-4 ml-2" />
                                )}
                            </th>
                        ))}
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.map((order, index) => (
                        <tr key={index}>
                            <td className="py-2 px-4 border-b">{order.orderId.toString()}</td>
                            <td className="py-2 px-4 border-b">{order.productId.toString()}</td>
                            <td className="py-2 px-4 border-b">{order.productPrice.toString()}</td>
                            <td className="py-2 px-4 border-b">{order.courierFee.toString()}</td>
                            <td className="py-2 px-4 border-b">
                                <div className="flex items-center">
                                    <span>{truncateAddress(order.consumer)}</span>
                                    <CopyToClipboard text={order.consumer}>
                                        <Tooltip title="Copy">
                                            <button className="ml-2 text-gray-400 hover:text-gray-300">
                                                <ClipboardIcon className="h-5 w-5" />
                                            </button>
                                        </Tooltip>
                                    </CopyToClipboard>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-b">
                                <div className="flex items-center">
                                    <span>{truncateAddress(order.seller)}</span>
                                    <CopyToClipboard text={order.seller}>
                                        <Tooltip title="Copy">
                                            <button className="ml-2 text-gray-400 hover:text-gray-300">
                                                <ClipboardIcon className="h-5 w-5" />
                                            </button>
                                        </Tooltip>
                                    </CopyToClipboard>
                                </div>
                            </td>
                            <td className="py-2 px-4 border-b">
                                <div className="flex items-center">
                                    <span>{order.courier ? truncateAddress(order.courier) : 'N/A'}</span>
                                    {order.courier && (
                                        <CopyToClipboard text={order.courier}>
                                            <Tooltip title="Copy">
                                                <button className="ml-2 text-gray-400 hover:text-gray-300">
                                                    <ClipboardIcon className="h-5 w-5" />
                                                </button>
                                            </Tooltip>
                                        </CopyToClipboard>
                                    )}
                                </div>
                            </td>
                            <td className="py-2 px-4 border-b">{OrderStatus[order.status]}</td>
                            <td className="py-2 px-4 border-b">{new Date(Number(order.orderTimestamp) * 1000).toLocaleString()}</td>
                            <td className="py-2 px-4 border-b">{order.deliveryTime.toString()} seconds</td>
                            <td className="py-2 px-4 border-b">{order.collateral.toString()}</td>
                            <td className="py-2 px-4 border-b">
                                <div className="flex space-x-2">
                                    <button
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        onClick={() => handleDetailsClick(order)}
                                    >
                                        Popup Details
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                        onClick={() => handleViewDetailsPage(order.orderId)}
                                    >
                                        Page Details
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedOrder && (
                <OrderDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    order={selectedOrder}
                />
            )}
        </div>
    );
};

export default OrderTable;
