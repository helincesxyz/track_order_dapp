// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EnhancedRetailManagement {
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
    mapping(address => uint256) public balances;
    uint256 public orderCount;
    bool private locked;

    event OrderPlaced(uint256 orderId, address indexed consumer, uint256 productId, uint256 productPrice, uint256 courierFee);
    event CourierAssigned(uint256 orderId, address indexed courier);
    event OrderDispatched(uint256 orderId);
    event OrderDelivered(uint256 orderId);
    event OrderCancelled(uint256 orderId);
    event Withdraw(address indexed user, uint256 amount);

    modifier onlyConsumer(uint256 orderId) {
        require(msg.sender == orders[orderId].consumer, "Not the consumer");
        _;
    }

    modifier onlySeller(uint256 orderId) {
        require(msg.sender == orders[orderId].seller, "Not the seller");
        _;
    }

    modifier onlyCourier(uint256 orderId) {
        require(msg.sender == orders[orderId].courier, "Not the courier");
        _;
    }

    modifier onlyConsumerOrSeller(uint256 orderId) {
        require(msg.sender == orders[orderId].consumer || msg.sender == orders[orderId].seller, "Not the consumer or seller");
        _;
    }

    modifier withinDeliveryTime(uint256 orderId) {
        require(block.timestamp <= orders[orderId].orderTimestamp + orders[orderId].deliveryTime, "Outside delivery time");
        _;
    }

    modifier noReentrancy() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    function placeOrder(uint256 productId, uint256 productPrice, uint256 courierFee, uint256 deliveryTime, address seller) external payable {
        require(msg.value == productPrice + courierFee, "Incorrect payment");
        require(seller != address(0), "Invalid seller address");

        orders[orderCount] = Order({
            productId: productId,
            productPrice: productPrice,
            courierFee: courierFee,
            consumer: msg.sender,
            seller: seller,
            courier: address(0),
            status: OrderStatus.Placed,
            orderTimestamp: block.timestamp,
            deliveryTime: deliveryTime, // to be added over the order timestamp
            collateral: 0
        });

        emit OrderPlaced(orderCount, msg.sender, productId, productPrice, courierFee);
        orderCount++;
    }

    function assignCourier(uint256 orderId) external withinDeliveryTime(orderId) {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Placed, "Order not placed or already assigned");
        order.courier = msg.sender;
        order.status = OrderStatus.CourierAssigned;
        emit CourierAssigned(orderId, msg.sender);
    }

    function dispatchOrder(uint256 orderId) external onlyCourier(orderId) withinDeliveryTime(orderId) payable {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.CourierAssigned, "Order not assigned to courier");
        require(msg.value == 2 * order.productPrice, "Incorrect collateral");
        order.collateral = msg.value;
        order.status = OrderStatus.Dispatched;
        emit OrderDispatched(orderId);
    }

    function confirmDelivery(uint256 orderId) external onlyConsumer(orderId) withinDeliveryTime(orderId) {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Dispatched, "Order not dispatched");

        order.status = OrderStatus.Delivered;
        balances[order.seller] += order.productPrice;
        balances[order.courier] += order.courierFee + order.collateral;
        emit OrderDelivered(orderId);
    }

    function cancelOrder(uint256 orderId) external onlyConsumer(orderId) withinDeliveryTime(orderId) {
        Order storage order = orders[orderId];
        require((order.status == OrderStatus.Placed) || (order.status == OrderStatus.CourierAssigned), "Order cannot be cancelled");
        order.status = OrderStatus.Cancelled;
        balances[order.consumer] += order.productPrice + order.courierFee;
        emit OrderCancelled(orderId);
    }

    function getRefund(uint256 orderId) external onlyConsumerOrSeller(orderId) {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Dispatched, "Order not dispatched");
        require(block.timestamp > order.orderTimestamp + order.deliveryTime, "Delivery time not reached");
        
        order.status = OrderStatus.Cancelled;
        balances[order.consumer] += order.productPrice + order.courierFee;
        balances[order.seller] += order.productPrice;
        // Burn the remaining collateral to ensure safety of delivery
        // Note: In Solidity, burning means sending Ether to an address that no one controls
        // Transfer the collateral to address(0)
        balances[address(0)] += order.collateral;
        emit OrderCancelled(orderId);
    }

    function withdraw() external noReentrancy {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit Withdraw(msg.sender, amount);
    }
}
