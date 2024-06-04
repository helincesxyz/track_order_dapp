import { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useOrderContext } from '../../context/OrderContext';

interface DispatchOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DispatchOrderModal: React.FC<DispatchOrderModalProps> = ({ isOpen, onClose }) => {
    const { dispatchOrder, orders } = useOrderContext();
    const [orderId, setOrderId] = useState(0);
    const [collateral, setCollateral] = useState<string | null>(null);

    useEffect(() => {
        if (orderId) {
            const order = orders.find((order) => order.orderId === orderId);
            if (order) {
                setCollateral((order.productPrice * BigInt(2)).toString());
            }
        }
    }, [orderId, orders]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatchOrder(orderId);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Dispatch Order</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Order ID</label>
                        <input
                            type="number"
                            value={orderId}
                            onChange={(e) => setOrderId(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    {collateral && (
                        <div className="mb-4">
                            <label className="block text-gray-700">Collateral Amount (wei)</label>
                            <p className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                {collateral}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2 hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                        >
                            Dispatch
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default DispatchOrderModal;
