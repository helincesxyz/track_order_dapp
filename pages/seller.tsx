import Head from 'next/head';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import OrderTable from '../components/OrderTable';
import PlaceOrderModal from '../components/modals/PlaceOrderModal';
import CancelOrderModal from '../components/modals/CancelOrderModal';
import ClaimFundsModal from '../components/modals/ClaimFundsModal';
import WithdrawAfterTimeoutModal from '../components/modals/WithdrawAfterTimeoutModal';

export default function Seller() {
    const [isPlaceOrderModalOpen, setIsPlaceOrderModalOpen] = useState(false);
    const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);
    const [isClaimFundsModalOpen, setIsClaimFundsModalOpen] = useState(false);
    const [isWithdrawAfterTimeoutModalOpen, setIsWithdrawAfterTimeoutModalOpen] = useState(false);

    return (
        <div>
            <Head>
                <title>Seller - Retail Marketing Management</title>
                <meta name="description" content="Manage your retail marketing operations" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar />
            <main className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="max-w-6xl w-full mx-auto bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">Retail Marketing Management</h1>
                    <div className="mt-6">
                        <OrderTable role="seller" />
                    </div>
                    <div className="mt-6 space-x-4">
                        <button 
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            onClick={() => setIsPlaceOrderModalOpen(true)}
                        >
                            Place Order
                        </button>
                        <button 
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            onClick={() => setIsCancelOrderModalOpen(true)}
                        >
                            Cancel Order
                        </button>
                        <button 
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            onClick={() => setIsClaimFundsModalOpen(true)}
                        >
                            Claim Funds
                        </button>
                        <button 
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                            onClick={() => setIsWithdrawAfterTimeoutModalOpen(true)}
                        >
                            Withdraw After Timeout
                        </button>
                    </div>
                </div>
            </main>
            <PlaceOrderModal isOpen={isPlaceOrderModalOpen} onClose={() => setIsPlaceOrderModalOpen(false)} />
            <CancelOrderModal isOpen={isCancelOrderModalOpen} onClose={() => setIsCancelOrderModalOpen(false)} />
            <ClaimFundsModal isOpen={isClaimFundsModalOpen} onClose={() => setIsClaimFundsModalOpen(false)} />
            <WithdrawAfterTimeoutModal isOpen={isWithdrawAfterTimeoutModalOpen} onClose={() => setIsWithdrawAfterTimeoutModalOpen(false)} />
            
            
        </div>
    );
}
