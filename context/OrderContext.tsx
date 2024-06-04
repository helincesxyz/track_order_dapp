import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import contractABIs from '../contracts/EnhancedRetailManagement.json';
import { OrderStatus, Order } from '../types';

const defaultContractAddress = "0xd742Aad8EE17E8167cCC01b1D449B644D920554c";
const contractABI = contractABIs.abi;

interface OrderContextProps {
  currentAccount: string | null;
  connectWallet: () => Promise<void>;
  logoutWallet: () => void;
  placeOrder: (
    seller: string,
    productId: number,
    productPrice: number,
    courierFee: number,
    deliveryTime: number
  ) => Promise<void>;
  registerCourier: (orderId: number) => Promise<void>;
  dispatchOrder: (orderId: number) => Promise<void>;
  verifyDelivery: (orderId: number) => Promise<void>;
  cancelOrder: (orderId: number) => Promise<void>;
  claimFunds: () => Promise<void>;
  withdrawAfterTimeout: (orderId: number) => Promise<void>;
  withdraw: () => Promise<void>;
  orders: Order[];
  error: string | null;
  setContractAddress: (address: string) => void;
  contractAddress: string;
  fetchOrders: () => Promise<void>;
  clearError: () => void;
  role: string | null;
  setRole: (role: string) => void;
  fetchUserBalance: () => Promise<void>;
  userBalance: string | null;
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [contractAddress, setContractAddressState] = useState<string>(defaultContractAddress);
  const [role, setRoleState] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem('userRole');
      if (savedRole) {
        setRoleState(savedRole);
      }
    }
  }, []);

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window as any;
      if (!ethereum) {
        console.log("Make sure you have Metamask installed!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setCurrentAccount(ethers.getAddress(accounts[0]));
        await fetchOrders();
        await fetchUserBalance();
      }
    };
    checkIfWalletIsConnected();
  }, [contractAddress]);

  const setContractAddress = (address: string) => {
    setContractAddressState(address);
    fetchOrders();
    fetchUserBalance();
  };

  const connectWallet = async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    }
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    setCurrentAccount(ethers.getAddress(accounts[0]));
    await fetchOrders();
    await fetchUserBalance();
  };

  const logoutWallet = () => {
    setCurrentAccount(null);
    setUserBalance(null);
  };

  const getProviderOrSigner = async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
      throw new Error("No Ethereum provider found");
    }
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    return signer;
  };

  const fetchOrders = async () => {
    try {
      const signer = await getProviderOrSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const orderCount = await contract.orderCount();
      const ordersArray: Order[] = [];
      for (let i = 0; i < orderCount; i++) {
        const order = await contract.orders(i);
        ordersArray.push({
          productId: order.productId,
          productPrice: order.productPrice,
          courierFee: order.courierFee,
          consumer: ethers.getAddress(order.consumer),
          seller: ethers.getAddress(order.seller),
          courier: order.courier === ethers.ZeroAddress ? '' : ethers.getAddress(order.courier),
          status: order.status,
          orderTimestamp: order.orderTimestamp,
          deliveryTime: order.deliveryTime,
          collateral: order.collateral,
          orderId: i,
        });
      }
      setOrders(ordersArray);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch orders.");
    }
  };

  const fetchUserBalance = async () => {
    try {
      if (!currentAccount) return;
      const signer = await getProviderOrSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const balance = await contract.balances(currentAccount);
      setUserBalance(balance.toString());
    } catch (error) {
      console.error(error);
      setError("Failed to fetch user balance.");
    }
  };

  const clearError = () => setError(null);

  const handleError = (error: any) => {
    if (error.code === 4001) {
      setError("Transaction rejected by user.");
    } else if (error.message) {
      setError(error.message);
    } else {
      setError("An unknown error occurred.");
    }
  };

  const placeOrder = async (
    seller: string,
    productId: number,
    productPrice: number,
    courierFee: number,
    deliveryTime: number
  ) => {
    try {
      const signer = await getProviderOrSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      await contract.placeOrder(
        productId,
        productPrice,
        courierFee,
        deliveryTime,
        seller,
        {
          value: ethers.toBigInt(productPrice + courierFee),
        }
      );
      await fetchOrders();
      await fetchUserBalance();
    } catch (error) {
      handleError(error);
      console.error(error);
    }
  };

  const registerCourier = async (orderId: number) => {
    try {
      const signer = await getProviderOrSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      await contract.assignCourier(orderId);
      await fetchOrders();
    } catch (error) {
      handleError(error);
      console.error(error);
    }
  };

  const dispatchOrder = async (orderId: number) => {
    try {
      const signer = await getProviderOrSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const order = orders.find((order) => order.orderId === orderId);
      if (!order) throw new Error("Order not found");
      await contract.dispatchOrder(orderId, {
        value: order.productPrice * BigInt(2), // Use calculated collateral
      });
      await fetchOrders();
    } catch (error) {
      handleError(error);
      console.error(error);
    }
  };

  const verifyDelivery = async (orderId: number) => {
    try {
      const signer = await getProviderOrSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      await contract.confirmDelivery(orderId);
      await fetchOrders();
    } catch (error) {
      handleError(error);
      console.error(error);
    }
  };

  const cancelOrder = async (orderId: number) => {
    try {
      const signer = await getProviderOrSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      await contract.cancelOrder(orderId);
      await fetchOrders();
    } catch (error) {
      handleError(error);
      console.error(error);
    }
  };

  const claimFunds = async () => {
    try {
      const signer = await getProviderOrSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      await contract.withdraw();
      await fetchOrders();
      await fetchUserBalance();
    } catch (error) {
      handleError(error);
      console.error(error);
    }
  };

  const withdrawAfterTimeout = async (orderId: number) => {
    try {
      const signer = await getProviderOrSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      await contract.getRefund(orderId);
      await fetchOrders();
      await fetchUserBalance();
    } catch (error) {
      handleError(error);
      console.error(error);
    }
  };

  const withdraw = async () => {
    try {
      const signer = await getProviderOrSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      await contract.withdraw();
      await fetchOrders();
      await fetchUserBalance();
    } catch (error) {
      handleError(error);
      console.error(error);
    }
  };

  const setRole = (role: string) => {
    setRoleState(role);
    if (typeof window !== "undefined") {
      localStorage.setItem('userRole', role);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        currentAccount,
        connectWallet,
        logoutWallet,
        placeOrder,
        registerCourier,
        dispatchOrder,
        verifyDelivery,
        cancelOrder,
        claimFunds,
        withdrawAfterTimeout,
        withdraw,
        orders,
        error,
        setContractAddress,
        contractAddress,
        fetchOrders,
        clearError,
        role,
        setRole,
        fetchUserBalance,
        userBalance,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
