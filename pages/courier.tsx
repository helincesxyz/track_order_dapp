import Head from 'next/head';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import OrderTable from '../components/OrderTable';
import RegisterCourierModal from '../components/modals/RegisterCourierModal';
import DispatchOrderModal from '../components/modals/DispatchOrderModal';
import ClaimFundsModal from '../components/modals/ClaimFundsModal';

export default function Courier() {
    const [isRegisterCourierModalOpen, setIsRegisterCourierModalOpen] = useState(false);
    const [isDispatchOrderModalOpen, setIsDispatchOrderModalOpen] = useState(false);
    const [isClaimFundsModalOpen, setIsClaimFundsModalOpen] = useState(false);

    return (
        <div>
            <Head>
                <title>Courier - Retail Marketing Management</title>
                <meta name="description" content="Manage your retail marketing operations" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar />
            <main className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="max-w-6xl w-full mx-auto bg-white shadow-lg rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">Retail Marketing Management</h1>
                    <div className="mt-6">
                        <OrderTable role='courier' />
                    </div>
                    <div className="mt-6 space-x-4">
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
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            onClick={() => setIsClaimFundsModalOpen(true)}
                        >
                            Claim Funds
                        </button>
                    </div>
                </div>
            </main>
            <RegisterCourierModal isOpen={isRegisterCourierModalOpen} onClose={() => setIsRegisterCourierModalOpen(false)} />
            <DispatchOrderModal isOpen={isDispatchOrderModalOpen} onClose={() => setIsDispatchOrderModalOpen(false)} />
            <ClaimFundsModal isOpen={isClaimFundsModalOpen} onClose={() => setIsClaimFundsModalOpen(false)} />
        </div>
    );
}
