Sure, let's start with the full implementation of the project. We'll follow the structure and details outlined previously. Here’s a step-by-step guide:

### 1. contracts/RetailMarketingManagement.sol
**Path:** `contracts/RetailMarketingManagement.sol`
**Overview:** This file contains the Solidity code for the `RetailMarketingManagement` smart contract, managing retail orders.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract RetailMarketingManagement {
    enum OrderStatus { Placed, CourierAssigned, Dispatched, Delivered, Cancelled }

    struct Order {
        uint256 productId;
        uint256 productPrice;
        uint256 courierFee;
        address consumer;
        address seller;
        address courier;
        OrderStatus status;
        uint256 orderTimestamp;
        uint256 deliveryTime;
        uint256 collateral;
    }

    mapping(uint256 => Order) public orders;
    uint256 public orderCount;

    event OrderPlaced(uint256 orderId, address indexed consumer, address indexed seller, uint256 productId, uint256 productPrice, uint256 courierFee, uint256 deliveryTime);
    event PaymentMade(uint256 orderId, uint256 amount);
    event CourierRegistered(uint256 orderId, address indexed courier);
    event OrderDispatched(uint256 orderId);
    event DeliveryVerified(uint256 orderId);
    event Withdrawal(address indexed user, uint256 amount);
    event OrderCancelled(uint256 orderId);

    modifier onlyConsumer(uint256 orderId) {
        require(orders[orderId].consumer == msg.sender, "Not the consumer");
        _;
    }

    modifier onlySeller(uint256 orderId) {
        require(orders[orderId].seller == msg.sender, "Not the seller");
        _;
    }

    modifier onlyCourier(uint256 orderId) {
        require(orders[orderId].courier == msg.sender, "Not the courier");
        _;
    }

    modifier inStatus(uint256 orderId, OrderStatus status) {
        require(orders[orderId].status == status, "Invalid order status");
        _;
    }

    modifier withinTime(uint256 orderId, uint256 timeLimit) {
        require(block.timestamp <= orders[orderId].orderTimestamp + timeLimit, "Time limit exceeded");
        _;
    }

    function placeOrder(address _seller, uint256 _productId, uint256 _productPrice, uint256 _courierFee, uint256 _deliveryTime) external payable {
        require(msg.value == _productPrice + _courierFee, "Incorrect payment");

        orderCount++;
        orders[orderCount] = Order({
            productId: _productId,
            productPrice: _productPrice,
            courierFee: _courierFee,
            consumer: msg.sender,
            seller: _seller,
            courier: address(0),
            status: OrderStatus.Placed,
            orderTimestamp: block.timestamp,
            deliveryTime: _deliveryTime,
            collateral: 0
        });

        emit OrderPlaced(orderCount, msg.sender, _seller, _productId, _productPrice, _courierFee, _deliveryTime);
        emit PaymentMade(orderCount, msg.value);
    }

    function registerCourier(uint256 orderId) external inStatus(orderId, OrderStatus.Placed) {
        orders[orderId].courier = msg.sender;
        orders[orderId].status = OrderStatus.CourierAssigned;

        emit CourierRegistered(orderId, msg.sender);
    }

    function cancelOrder(uint256 orderId) external onlyConsumer(orderId) inStatus(orderId, OrderStatus.Placed) withinTime(orderId, orders[orderId].deliveryTime) {
        orders[orderId].status = OrderStatus.Cancelled;

        payable(orders[orderId].consumer).transfer(orders[orderId].productPrice + orders[orderId].courierFee);

        emit OrderCancelled(orderId);
        emit Withdrawal(orders[orderId].consumer, orders[orderId].productPrice + orders[orderId].courierFee);
    }

    function dispatchOrder(uint256 orderId) external onlyCourier(orderId) inStatus(orderId, OrderStatus.CourierAssigned) withinTime(orderId, orders[orderId].deliveryTime) payable {
        require(msg.value == orders[orderId].productPrice * 2, "Incorrect collateral amount");

        orders[orderId].collateral = msg.value;
        orders[orderId].status = OrderStatus.Dispatched;

        emit OrderDispatched(orderId);
    }

    function verifyDelivery(uint256 orderId) external onlyConsumer(orderId) inStatus(orderId, OrderStatus.Dispatched) withinTime(orderId, orders[orderId].deliveryTime) {
        orders[orderId].status = OrderStatus.Delivered;

        payable(orders[orderId].seller).transfer(orders[orderId].productPrice);
        payable(orders[orderId].courier).transfer(orders[orderId].courierFee + orders[orderId].collateral);

        emit DeliveryVerified(orderId);
        emit Withdrawal(orders[orderId].seller, orders[orderId].productPrice);
        emit Withdrawal(orders[orderId].courier, orders[orderId].courierFee + orders[orderId].collateral);
    }

    function withdrawAfterTimeout(uint256 orderId) external inStatus(orderId, OrderStatus.Dispatched) {
        require(block.timestamp > orders[orderId].orderTimestamp + orders[orderId].deliveryTime, "Timeout not reached");

        payable(orders[orderId].seller).transfer(orders[orderId].productPrice);
        payable(orders[orderId].consumer).transfer(orders[orderId].productPrice + orders[orderId].courierFee);
        orders[orderId].status = OrderStatus.Cancelled;

        emit OrderCancelled(orderId);
        emit Withdrawal(orders[orderId].seller, orders[orderId].productPrice);
        emit Withdrawal(orders[orderId].consumer, orders[orderId].productPrice + orders[orderId].courierFee);

        // Burning the remaining collateral
        address burnAddress = address(0);
        payable(burnAddress).transfer(orders[orderId].collateral - orders[orderId].productPrice);
    }

    function claimFunds(uint256 orderId) external inStatus(orderId, OrderStatus.Dispatched) {
        require(block.timestamp > orders[orderId].orderTimestamp + orders[orderId].deliveryTime, "Timeout not reached");

        if (orders[orderId].courier != address(0)) {
            payable(orders[orderId].consumer).transfer(orders[orderId].productPrice + orders[orderId].courierFee);
            orders[orderId].status = OrderStatus.Cancelled;

            emit OrderCancelled(orderId);
            emit Withdrawal(orders[orderId].consumer, orders[orderId].productPrice + orders[orderId].courierFee);

            // Burning the remaining collateral
            address burnAddress = address(0);
            payable(burnAddress).transfer(orders[orderId].collateral - orders[orderId].productPrice);
        }
    }
}
```

### 2. context/OrderContext.tsx
**Path:** `context/OrderContext.tsx`
**Overview:** This file manages the global state of the dApp and provides functions to interact with the smart contract.

```typescript
// context/OrderContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import RetailMarketingManagement from '../artifacts/contracts/RetailMarketingManagement.json';
import { OrderStatus } from '../types';

// Contract address on the blockchain
const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';

// Create a context for the order data
const OrderContext = createContext<any>(null);

// Define a provider component
export const OrderContextProvider = ({ children }: { children: ReactNode }) => {
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [currentAccount, setCurrentAccount] = useState<string>('');
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const initializeProvider = async () => {
            if ((window as any).ethereum) {
                const web3Provider = new ethers.providers.Web3Provider((window as any).ethereum);
                setProvider(web3Provider);
                const signer = web3Provider.getSigner();
                const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, RetailMarketingManagement.abi, signer);
                setContract(contractInstance);
                const accounts = await web3Provider.send('eth_requestAccounts', []);
                setCurrentAccount(accounts[0]);
            }
        };
        initializeProvider();
    }, []);

    const placeOrder = async (seller: string, productId: number, productPrice: number, courierFee: number, deliveryTime: number) => {
        if (contract) {
            const totalValue = productPrice + courierFee;
            const tx = await contract.placeOrder(seller, productId, productPrice, courierFee, deliveryTime, { value: totalValue });
            await tx.wait();
        }
    };

    const registerCourier = async (orderId: number) => {
        if (contract) {
            const tx = await contract.registerCourier(orderId);
            await tx.wait();
        }
    };

    const dispatchOrder = async (orderId: number) => {
        if (contract) {
            const collateralAmount = (await contract.orders(orderId)).productPrice * 2;
            const tx = await contract.dispatchOrder(orderId, { value: collateralAmount });
            await tx.wait();
        }
    };

    const verifyDelivery = async (orderId: number) => {


        if (contract) {
            const tx = await contract.verifyDelivery(orderId);
            await tx.wait();
        }
    };

    const cancelOrder = async (orderId: number) => {
        if (contract) {
            const tx = await contract.cancelOrder(orderId);
            await tx.wait();
        }
    };

    const getOrders = async () => {
        if (contract) {
            const orderCount = await contract.orderCount();
            const ordersArray = [];
            for (let i = 1; i <= orderCount; i++) {
                const order = await contract.orders(i);
                ordersArray.push(order);
            }
            setOrders(ordersArray);
        }
    };

    useEffect(() => {
        if (contract) {
            getOrders();
        }
    }, [contract]);

    return (
        <OrderContext.Provider value={{ currentAccount, orders, placeOrder, registerCourier, dispatchOrder, verifyDelivery, cancelOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

// Custom hook to use the OrderContext
export const useOrderContext = () => useContext(OrderContext);
```

### 3. pages/_app.tsx
**Path:** `pages/_app.tsx`
**Overview:** This file is the entry point for the Next.js application, initializing the global state and importing global styles.

```typescript
// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { OrderContextProvider } from '../context/OrderContext';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <OrderContextProvider>
            <Component {...pageProps} />
        </OrderContextProvider>
    );
}

export default MyApp;
```

### 4. pages/index.tsx
**Path:** `pages/index.tsx`
**Overview:** The main page of the dApp. Renders the main components and ensures the user is connected to MetaMask.

```typescript
// pages/index.tsx
import { useEffect, useState } from 'react';
import { useOrderContext } from '../context/OrderContext';
import OrderForm from '../components/OrderForm';
import OrderTable from '../components/OrderTable';
import UserProfile from '../components/UserProfile';
import LoginButton from '../components/LoginButton';
import OrderModal from '../components/OrderModal';

export default function Home() {
    const { currentAccount } = useOrderContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<JSX.Element | null>(null);

    const openModal = (content: JSX.Element) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    useEffect(() => {
        if (!currentAccount) {
            // Redirect to login or show a message to connect wallet
        }
    }, [currentAccount]);

    return (
        <div className="container mx-auto p-4">
            {!currentAccount ? (
                <LoginButton />
            ) : (
                <>
                    <UserProfile />
                    <OrderForm openModal={openModal} />
                    <OrderTable openModal={openModal} />
                    {isModalOpen && <OrderModal content={modalContent} closeModal={closeModal} />}
                </>
            )}
        </div>
    );
}
```

### 5. components/OrderForm.tsx
**Path:** `components/OrderForm.tsx`
**Overview:** Component for placing new orders. It contains form fields for product details, price, courier fee, and delivery time.

```typescript
// components/OrderForm.tsx
import { useState } from 'react';
import { useOrderContext } from '../context/OrderContext';

interface OrderFormProps {
    openModal: (content: JSX.Element) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ openModal }) => {
    const { placeOrder } = useOrderContext();
    const [seller, setSeller] = useState('');
    const [productId, setProductId] = useState(0);
    const [productPrice, setProductPrice] = useState(0);
    const [courierFee, setCourierFee] = useState(0);
    const [deliveryTime, setDeliveryTime] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await placeOrder(seller, productId, productPrice, courierFee, deliveryTime);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="seller" className="block text-sm font-medium text-gray-700">
                    Seller Address
                </label>
                <input
                    type="text"
                    id="seller"
                    value={seller}
                    onChange={(e) => setSeller(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            <div>
                <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
                    Product ID
                </label>
                <input
                    type="number"
                    id="productId"
                    value={productId}
                    onChange={(e) => setProductId(Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            <div>
                <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">
                    Product Price (ETH)
                </label>
                <input
                    type="number"
                    id="productPrice"
                    value={productPrice}
                    onChange={(e) => setProductPrice(Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            <div>
                <label htmlFor="courierFee" className="block text-sm font-medium text-gray-700">
                    Courier Fee (ETH)
                </label>
                <input
                    type="number"
                    id="courierFee"
                    value={courierFee}
                    onChange={(e) => setCourierFee(Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">
                    Delivery Time (seconds)
                </label>
                <input
                    type="number"
                    id="deliveryTime"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>
            <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
                Place Order
            </button>
        </form>
    );
};

export default OrderForm;
```

### 6. components/OrderTable.tsx
**Path:** `components/OrderTable.tsx`
**Overview:** Displays a list of all orders. Fetches order data from `OrderContext` and displays it in a table format.

```typescript
// components/OrderTable.tsx
import { useOrderContext } from '../context/OrderContext';
import OrderDetails from './OrderDetails';

interface OrderTableProps {
    openModal: (content: JSX.Element) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ openModal }) => {
    const { orders } = useOrderContext();

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.productId.toString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.consumer}</td>
                            <td className="px

-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.seller}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{OrderStatus[order.status]}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <button
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                    onClick={() => openModal(<OrderDetails order={order} />)}
                                >
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;
```

### 7. components/OrderDetails.tsx
**Path:** `components/OrderDetails.tsx`
**Overview:** Displays detailed information about a specific order. Used inside modals for a detailed view.

```typescript
// components/OrderDetails.tsx
import { useOrderContext } from '../context/OrderContext';
import { OrderStatus } from '../types';

interface OrderDetailsProps {
    order: any;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
    const { registerCourier, dispatchOrder, verifyDelivery, cancelOrder } = useOrderContext();

    const handleRegisterCourier = async () => {
        await registerCourier(order.orderId);
    };

    const handleDispatchOrder = async () => {
        await dispatchOrder(order.orderId);
    };

    const handleVerifyDelivery = async () => {
        await verifyDelivery(order.orderId);
    };

    const handleCancelOrder = async () => {
        await cancelOrder(order.orderId);
    };

    return (
        <div className="space-y-4">
            <p><strong>Order ID:</strong> {order.orderId.toString()}</p>
            <p><strong>Product ID:</strong> {order.productId.toString()}</p>
            <p><strong>Consumer:</strong> {order.consumer}</p>
            <p><strong>Seller:</strong> {order.seller}</p>
            <p><strong>Courier:</strong> {order.courier}</p>
            <p><strong>Status:</strong> {OrderStatus[order.status]}</p>
            <p><strong>Order Timestamp:</strong> {new Date(order.orderTimestamp * 1000).toLocaleString()}</p>
            <p><strong>Delivery Time:</strong> {order.deliveryTime.toString()} seconds</p>
            <div className="space-y-2">
                {order.status === OrderStatus.Placed && (
                    <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleRegisterCourier}
                    >
                        Register as Courier
                    </button>
                )}
                {order.status === OrderStatus.CourierAssigned && (
                    <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleDispatchOrder}
                    >
                        Dispatch Order
                    </button>
                )}
                {order.status === OrderStatus.Dispatched && (
                    <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleVerifyDelivery}
                    >
                        Verify Delivery
                    </button>
                )}
                {order.status === OrderStatus.Placed && (
                    <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                        onClick={handleCancelOrder}
                    >
                        Cancel Order
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;
```

### 8. components/UserProfile.tsx
**Path:** `components/UserProfile.tsx`
**Overview:** Displays the user's profile information, including their Ethereum address and total number of orders.

```typescript
// components/UserProfile.tsx
import { useOrderContext } from '../context/OrderContext';

const UserProfile: React.FC = () => {
    const { currentAccount, orders } = useOrderContext();

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">User Profile</h2>
            <p><strong>Account:</strong> {currentAccount}</p>
            <p><strong>Total Orders:</strong> {orders.length}</p>
        </div>
    );
};

export default UserProfile;
```

### 9. components/LoginButton.tsx
**Path:** `components/LoginButton.tsx`
**Overview:** Renders a button for users to connect their MetaMask wallet.

```typescript
// components/LoginButton.tsx
import { useOrderContext } from '../context/OrderContext';

const LoginButton: React.FC = () => {
    const { currentAccount } = useOrderContext();

    const connectWallet = async () => {
        if ((window as any).ethereum) {
            const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Connected:', accounts[0]);
        } else {
            console.log('Please install MetaMask!');
        }
    };

    return (
        <button
            onClick={connectWallet}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
            {currentAccount ? 'Connected' : 'Connect Wallet'}
        </button>
    );
};

export default LoginButton;
```

### 10. components/OrderModal.tsx
**Path:** `components/OrderModal.tsx`
**Overview:** A reusable modal component to display detailed order information.

```typescript
// components/OrderModal.tsx
interface OrderModalProps {
    content: JSX.Element;
    closeModal: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ content, closeModal }) => {
    return (
        <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        {content}
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={closeModal}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderModal;
```

### 11. types/index.ts
**Path:** `types/index.ts`
**Overview:** Defines TypeScript types and interfaces for the project.

```typescript
// types/index.ts
export enum OrderStatus {
    Placed,
    CourierAssigned,
    Dispatched,
    Delivered,
    Cancelled
}

export interface Order {
    productId: number;
    productPrice: number;
    courierFee: number;
    consumer: string;
    seller: string;
    courier: string;
    status: OrderStatus;
    orderTimestamp: number;
    deliveryTime: number;
    collateral: number;
}
```

### 12. styles/globals.css
**Path:** `styles/globals.css`
**Overview:** Global styles for the project, including Tailwind CSS imports.

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
body {
    @apply bg-gray-100 text-gray-900;
}
```

### Summary
This project consists of a smart contract for managing retail orders and a frontend dApp using Next.js, TypeScript, and Tailwind CSS. The frontend interacts with the smart contract through context and React hooks, providing functionalities like placing orders, registering couriers, dispatching orders, verifying deliveries, and canceling orders. Each component is designed to handle specific tasks, ensuring a modular and maintainable codebase.