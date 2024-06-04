// components/modals/PlaceOrderModal.tsx
import { useState } from 'react';
import Modal from '../Modal';
import { useOrderContext } from '../../context/OrderContext';

interface PlaceOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PlaceOrderModal: React.FC<PlaceOrderModalProps> = ({ isOpen, onClose }) => {
    const { placeOrder } = useOrderContext();
    const [seller, setSeller] = useState('');
    const [productId, setProductId] = useState(0);
    const [productPrice, setProductPrice] = useState(0);
    const [courierFee, setCourierFee] = useState(0);
    const [deliveryTime, setDeliveryTime] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await placeOrder(seller, productId, productPrice, courierFee, deliveryTime);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Place Order</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Seller Address</label>
                        <input
                            type="text"
                            value={seller}
                            onChange={(e) => setSeller(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Product ID</label>
                        <input
                            type="number"
                            value={productId}
                            onChange={(e) => setProductId(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Product Price (wei)</label>
                        <input
                            type="number"
                            value={productPrice}
                            onChange={(e) => setProductPrice(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Courier Fee (wei)</label>
                        <input
                            type="number"
                            value={courierFee}
                            onChange={(e) => setCourierFee(parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Delivery Time (seconds)</label>
                        <input
                            type="number"
                            value={deliveryTime}
                            onChange={(e) => setDeliveryTime(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Place Order
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default PlaceOrderModal;
