import React from 'react';
import Modal from '../Modal';
import { OrderStatus } from '../../types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Tooltip from '@mui/material/Tooltip';
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
}

const truncateAddress = (address: string, length: number = 10) => {
    if (address.length <= length) return address;
    const start = address.slice(0, 6);
    const end = address.slice(-4);
    return `${start}...${end}`;
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order }) => {
    const [copied, setCopied] = React.useState<string | null>(null);

    const handleCopy = (address: string) => {
        setCopied(address);
        setTimeout(() => setCopied(null), 2000);
    };
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/OrderDetailsPage?orderId=${order.orderId}`);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 bg-white rounded-lg shadow-lg max-w-lg mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-center">Order Details</h2>
                <table className="min-w-full bg-white">
                    <tbody>
                        <tr>
                            <td className="border-t py-2 px-4 font-semibold bg-gray-50">Order ID</td>
                            <td className="border-t py-2 px-4">{order.orderId}</td>
                        </tr>
                        <tr>
                            <td className="border-t py-2 px-4 font-semibold bg-gray-50">Product ID</td>
                            <td className="border-t py-2 px-4">{order.productId}</td>
                        </tr>
                        <tr>
                            <td className="border-t py-2 px-4 font-semibold bg-gray-50">Product Price (wei)</td>
                            <td className="border-t py-2 px-4">{order.productPrice.toString()}</td>
                        </tr>
                        <tr>
                            <td className="border-t py-2 px-4 font-semibold bg-gray-50">Courier Fee (wei)</td>
                            <td className="border-t py-2 px-4">{order.courierFee.toString()}</td>
                        </tr>
                        <tr>
                            <td className="border-t py-2 px-4 font-semibold bg-gray-50">Consumer</td>
                            <td className="border-t py-2 px-4" title={order.consumer}>
                                <div className="flex items-center">
                                    {truncateAddress(order.consumer)}
                                    <CopyToClipboard text={order.consumer} onCopy={() => handleCopy(order.consumer)}>
                                        <Tooltip title={copied === order.consumer ? "Copied!" : "Copy"}>
                                            <button className="ml-2 text-gray-500 hover:text-gray-700">
                                                {copied === order.consumer ? (
                                                    <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                                ) : (
                                                    <ClipboardIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </Tooltip>
                                    </CopyToClipboard>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border-t py-2 px-4 font-semibold bg-gray-50">Seller</td>
                            <td className="border-t py-2 px-4" title={order.seller}>
                                <div className="flex items-center">
                                    {truncateAddress(order.seller)}
                                    <CopyToClipboard text={order.seller} onCopy={() => handleCopy(order.seller)}>
                                        <Tooltip title={copied === order.seller ? "Copied!" : "Copy"}>
                                            <button className="ml-2 text-gray-500 hover:text-gray-700">
                                                {copied === order.seller ? (
                                                    <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                                ) : (
                                                    <ClipboardIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </Tooltip>
                                    </CopyToClipboard>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border-t py-2 px-4 font-semibold bg-gray-50">Courier</td>
                            <td className="border-t py-2 px-4" title={order.courier}>
                                <div className="flex items-center">
                                    {truncateAddress(order.courier)}
                                    <CopyToClipboard text={order.courier} onCopy={() => handleCopy(order.courier)}>
                                        <Tooltip title={copied === order.courier ? "Copied!" : "Copy"}>
                                            <button className="ml-2 text-gray-500 hover:text-gray-700">
                                                {copied === order.courier ? (
                                                    <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                                ) : (
                                                    <ClipboardIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                        </Tooltip>
                                    </CopyToClipboard>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border-t py-2 px-4 font-semibold bg-gray-50">Status</td>
                            <td className="border-t py-2 px-4">{OrderStatus[order.status]}</td>
                        </tr>
                        <tr>
                            <td className="border-t py-2 px-4 font-semibold bg-gray-50">Order Timestamp</td>
                            <td className="border-t py-2 px-4">{new Date(Number(order.orderTimestamp) * 1000).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="border-t py-2 px-4 font-semibold bg-gray-50">Delivery Time</td>
                            <td className="border-t py-2 px-4">{order.deliveryTime.toString()} seconds</td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-4 flex justify-end">
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ml-4"
                    onClick={handleViewDetails}
                >
                    View Details Page
                </button>
                </div>
            </div>
        </Modal>
    );
};

export default OrderDetailsModal;
