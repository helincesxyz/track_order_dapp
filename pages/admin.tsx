import Head from 'next/head';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import OrderTable from '../components/OrderTable';
import PlaceOrderModal from '../components/modals/PlaceOrderModal';
import RegisterCourierModal from '../components/modals/RegisterCourierModal';
import DispatchOrderModal from '../components/modals/DispatchOrderModal';
import VerifyDeliveryModal from '../components/modals/VerifyDeliveryModal';
import CancelOrderModal from '../components/modals/CancelOrderModal';
import ClaimFundsModal from '../components/modals/ClaimFundsModal';
import WithdrawAfterTimeoutModal from '../components/modals/WithdrawAfterTimeoutModal';

export default function Admin() {
    const [isPlaceOrderModalOpen, setIsPlaceOrderModalOpen] = useState(false);
    const [isRegisterCourierModalOpen, setIsRegisterCourierModalOpen] = useState(false);
    const [isDispatchOrderModalOpen, setIsDispatchOrderModalOpen] = useState(false);
    const [isVerifyDeliveryModalOpen, setIsVerifyDeliveryModalOpen] = useState(false);
    const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);
    const [isClaimFundsModalOpen, setIsClaimFundsModalOpen] = useState(false);
    const [isWithdrawAfterTimeoutModalOpen, setIsWithdrawAfterTimeoutModalOpen] = useState(false);

    return (
        <div>
            <Head>
                <title>Admin - Retail Marketing Management</title>
                <meta name="description" content="Manage your retail marketing operations" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar />
            <main className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="max-w-6xl w-full mx-auto bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">Retail Marketing Management</h1>
                    <div className="mt-6">
                        <OrderTable role="admin" />
                    </div>
                    <div className="mt-6 space-x-4">
                        <button 
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            onClick={() => setIsPlaceOrderModalOpen(true)}
                        >
                            Place Order
                        </button>
                        <button 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            onClick={() => setIsRegisterCourierModalOpen(true)}
                        >
                            Register Courier
                        </button>
                        <button 
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                            onClick={() => setIsDispatchOrderModalOpen(true)}
                        >
                            Dispatch Order
                        </button>
                        <button 
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            onClick={() => setIsVerifyDeliveryModalOpen(true)}
                        >
                            Verify Delivery
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
            <RegisterCourierModal isOpen={isRegisterCourierModalOpen} onClose={() => setIsRegisterCourierModalOpen(false)} />
            <DispatchOrderModal isOpen={isDispatchOrderModalOpen} onClose={() => setIsDispatchOrderModalOpen(false)} />
            <VerifyDeliveryModal isOpen={isVerifyDeliveryModalOpen} onClose={() => setIsVerifyDeliveryModalOpen(false)} />
            <CancelOrderModal isOpen={isCancelOrderModalOpen} onClose={() => setIsCancelOrderModalOpen(false)} />
            <ClaimFundsModal isOpen={isClaimFundsModalOpen} onClose={() => setIsClaimFundsModalOpen(false)} />
            <WithdrawAfterTimeoutModal isOpen={isWithdrawAfterTimeoutModalOpen} onClose={() => setIsWithdrawAfterTimeoutModalOpen(false)} />
        </div>
    );
}
