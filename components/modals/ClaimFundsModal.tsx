import Modal from '../Modal';
import { useOrderContext } from '../../context/OrderContext';
import ErrorMessage from '../ErrorMessage';

interface ClaimFundsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ClaimFundsModal: React.FC<ClaimFundsModalProps> = ({ isOpen, onClose }) => {
    const { claimFunds, error, clearError, userBalance } = useOrderContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await claimFunds();
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Claim Funds</h2>
                <p className="mb-4">Available to withdraw: {userBalance ? `${userBalance} wei` : 'Loading...'}</p>
                <form onSubmit={handleSubmit}>
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
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Claim
                        </button>
                    </div>
                </form>
                <ErrorMessage message={error} onClose={clearError} />
            </div>
        </Modal>
    );
}

export default ClaimFundsModal;
