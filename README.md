Contributors:

@helincesxyz @ahmetmelihafsar @utkuozgenc @utkucaglar

Our UI works a little bit strange. Let us clarify our point, every step of the process works
(Placing the order, Registering a courier, Dispatching the order, Verifying the delivery) perfectly
fine until any of the users (**Seller, Consumer, Courier**) tries to claim their funds from using the
button from the website. Before using that button, regardless of the user type, the user should
re-enter the contract address using the **Set Contract Address** button on the top right. Then, the
correct amount of **weis** will be shown and the necessary tasks will be performed without any
error when any user type uses the Claim Funds button.

his project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

**Workflow for the Smart Contract**

**Parties Involved**

*Sellers (Retailers):* They determine the price for a product and transfer the goods to the couriers
upon necessary payments being made.

*Couriers (Logistics Providers):* Responsible for the physical delivery of goods from one party to
another.

*Consumers:* The end recipients of the goods, whose interactions may be tracked if return or
warranty processes are involved.

**Smart Contract Events**

**Order Placement:**

*Trigger:* A consumer places an order, specifying the seller, the product, the price of the product,
and a space for a courier record along with the courier’s fee (decided by the consumer) by
creating a smart contract.*Action:* The smart contract records the order details, including product IDs, quantities, and the
identities of the involved parties.

**Consumer Payment:**

*Trigger:* Confirmation of order placement.*Action:* The consumer pays “the product price + the courier’s fee” into the smart contract.
Payments are securely held in escrow by the smart contract until delivery confirmation is
received.

**Courier Registration:**

*Trigger:* The courier calls a method in the contract to sign up for the delivery.*Action:* If the courier does not meet with the seller in a specified time or the seller does not
supply the goods to the courier in time, the money the consumer put into the contract will be
made withdrawable to them.

**Order Fulfillment:**

*Trigger:* Both the seller and the courier confirm the goods are dispatched at the same time when
they see each other. The courier calls the relevant function and pays twice the amount of the
product to the smart contract as collateral.*Action:* The courier is now permanently set, and the courier address in the contract will not be
able to be modified anymore. If this function is not called within a specified amount of time, the
price the consumer paid will be able to withdrawable to them and the contract terminates after
their withdrawal.

**Delivery Verification:**

*Trigger:* Goods reach their destination. The consumer approves the shipment has arrived and
calls the relevant method.*Action:* If the consumer confirms that they have received the goods, the amount of the product
price will be set as withdrawable for the seller. Similarly, the courier will now be able to
withdraw both their fee and the initial collateral deposit they have put into the contract.

If the consumer does not confirm within the specified time, the product price becomes
withdrawable to the seller, and “the product price + courier’s fee” becomes withdrawable to the
consumer,while the remaining value stays locked in the contract. This is possible since the
contract already collected double the product price from the courier and the “product price +
courier’s fee” from the consumer earlier. This is implemented to discourage the courier from
stealing the packages. The reason behind not paying any extra compensation to the seller and the
consumer out of the courier’s pocket is to discourage them from getting together against the
courier, so the smart contract locks the surplus funds.

**Return or Warranty Claims:**

*Trigger:* Consumer initiates a return or warranty claim.*Action:* Another smart contract is created with similar details from scratch, but the roles of the
seller and the consumer are reversed.

![image](https://github.com/helincesxyz/track_order_dapp/assets/99142857/9d2e1447-f7f3-4c03-9512-c0b450bbe5f7)
