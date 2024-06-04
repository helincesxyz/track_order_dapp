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
