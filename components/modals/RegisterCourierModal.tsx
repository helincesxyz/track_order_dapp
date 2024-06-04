// components/modals/RegisterCourierModal.tsx
import { useState } from 'react';
import Modal from '../Modal';
import { useOrderContext } from '../../context/OrderContext';

interface RegisterCourierModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RegisterCourierModal: React.FC<RegisterCourierModalProps> = ({ isOpen, onClose }) => {
    const { registerCourier } = useOrderContext();
    const [orderId, setOrderId] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await registerCourier(orderId);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Register as Courier</h2>
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
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default RegisterCourierModal;
