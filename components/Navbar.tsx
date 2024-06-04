import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useOrderContext } from '../context/OrderContext';
import { ethers } from 'ethers';
import SetContractAddressModal from './modals/SetContractAddressModal';
import ErrorMessage from './ErrorMessage';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Tooltip from '@mui/material/Tooltip';
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const truncateAddress = (address: string, length: number = 10) => {
    if (address.length <= length) return address;
    const start = address.slice(0, 6);
    const end = address.slice(-4);
    return `${start}...${end}`;
};

const roles = ["admin", "consumer", "courier", "seller"];

const Navbar: React.FC = () => {
    const router = useRouter();
    const { currentAccount, connectWallet, logoutWallet, contractAddress, error, clearError, setRole, role } = useOrderContext();
    const [balance, setBalance] = useState<string | null>(null);
    const [isSetContractAddressModalOpen, setIsSetContractAddressModalOpen] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            if (currentAccount) {
                const provider = new ethers.BrowserProvider((window as any).ethereum);
                const balance = await provider.getBalance(currentAccount);
                setBalance(ethers.formatEther(balance));
            }
        };

        fetchBalance();
    }, [currentAccount]);

    const handleCopy = (address: string) => {
        setCopied(address);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleRoleChange = (newRole: string) => {
        setRole(newRole);
        if (router.pathname !== '/OrderDetailsPage') {
            switch (newRole) {
                case 'admin':
                    router.push('/');
                    break;
                case 'consumer':
                    router.push('/consumer');
                    break;
                case 'courier':
                    router.push('/courier');
                    break;
                case 'seller':
                    router.push('/seller');
                    break;
                default:
                    router.push('/');
                    break;
            }
        }
    };


    return (
        <nav className="bg-gray-800 p-4 flex justify-between items-center">
            <div className="text-white text-xl">Retail Marketing Management</div>
            <div className="text-white flex items-center space-x-4">
                <div className="flex items-center">
                    <span>Contract: {truncateAddress(contractAddress)}</span>
                    <CopyToClipboard text={contractAddress} onCopy={() => handleCopy(contractAddress)}>
                        <Tooltip title={copied === contractAddress ? "Copied!" : "Copy"}>
                            <button className="ml-2 text-gray-400 hover:text-gray-300">
                                {copied === contractAddress ? (
                                    <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                ) : (
                                    <ClipboardIcon className="h-5 w-5" />
                                )}
                            </button>
                        </Tooltip>
                    </CopyToClipboard>
                </div>
                {currentAccount ? (
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <span>Connected: {truncateAddress(currentAccount)}</span>
                            <CopyToClipboard text={currentAccount} onCopy={() => handleCopy(currentAccount)}>
                                <Tooltip title={copied === currentAccount ? "Copied!" : "Copy"}>
                                    <button className="ml-2 text-gray-400 hover:text-gray-300">
                                        {copied === currentAccount ? (
                                            <ClipboardDocumentCheckIcon className="h-5 w-5" />
                                        ) : (
                                            <ClipboardIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </Tooltip>
                            </CopyToClipboard>
                        </div>
                        <span>Balance: {balance} ETH</span>
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            onClick={logoutWallet}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        onClick={connectWallet}
                    >
                        Connect Wallet
                    </button>
                )}
                <div className="relative">
                    <Menu>
                        <Menu.Button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                            {role ? role.charAt(0).toUpperCase() + role.slice(1) : "Select Role"}
                        </Menu.Button>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-300 divide-y divide-gray-100 rounded-md shadow-lg outline-none">
                                {roles.map((role) => (
                                    <Menu.Item key={role}>
                                        {({ active }) => (
                                            <button
                                                className={`${
                                                    active ? 'bg-gray-200' : 'text-gray-900'
                                                } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                                                onClick={() => handleRoleChange(role)}
                                            >
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </button>
                                        )}
                                    </Menu.Item>
                                ))}
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
                <button
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    onClick={() => setIsSetContractAddressModalOpen(true)}
                >
                    Set Contract Address
                </button>
            </div>
            <SetContractAddressModal isOpen={isSetContractAddressModalOpen} onClose={() => setIsSetContractAddressModalOpen(false)} />
            <ErrorMessage message={error} onClose={clearError} />
        </nav>
    );
};

export default Navbar;

