import { useState } from 'react';
import Modal from '../Modal';
import { useOrderContext } from '../../context/OrderContext';

interface SetContractAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SetContractAddressModal: React.FC<SetContractAddressModalProps> = ({ isOpen, onClose }) => {
    const { setContractAddress } = useOrderContext();
    const [address, setAddress] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setContractAddress(address);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Set Contract Address</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Contract Address</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
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
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default SetContractAddressModal;
