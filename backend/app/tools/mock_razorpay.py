"""
Mock Razorpay API for rapid development
Simulates payment order creation and verification
"""
from typing import Dict, Any
from datetime import datetime
import random
import string


class MockRazorpayService:
    """Mock Razorpay Payment API for development"""
    
    def __init__(self):
        self.orders = {}
        self.payments = {}
    
    def _generate_id(self, prefix: str) -> str:
        """Generate fake Razorpay-style IDs"""
        random_part = ''.join(random.choices(string.ascii_lowercase + string.digits, k=14))
        return f"{prefix}_{random_part}"
    
    async def create_order(
        self, 
        amount: int,  # in paise (₹1 = 100 paise)
        currency: str = "INR",
        receipt: str = None,
        notes: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """Mock order creation"""
        
        order_id = self._generate_id("order")
        
        order = {
            "id": order_id,
            "entity": "order",
            "amount": amount,
            "amount_paid": 0,
            "amount_due": amount,
            "currency": currency,
            "receipt": receipt or self._generate_id("rcpt"),
            "status": "created",
            "attempts": 0,
            "notes": notes or {},
            "created_at": int(datetime.now().timestamp())
        }
        
        self.orders[order_id] = order
        return order
    
    async def create_payment_link(
        self, 
        amount: int,
        description: str,
        customer: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """Mock payment link creation"""
        
        link_id = self._generate_id("plink")
        
        payment_link = {
            "id": link_id,
            "entity": "payment_link",
            "amount": amount,
            "currency": "INR",
            "description": description,
            "customer": customer or {},
            "status": "created",
            "short_url": f"https://rzp.io/l/{link_id[:10]}",
            "created_at": int(datetime.now().timestamp()),
            "expire_by": int((datetime.now().timestamp()) + 86400)  # 24 hours
        }
        
        return payment_link
    
    async def verify_payment(
        self, 
        payment_id: str,
        order_id: str = None,
        signature: str = None
    ) -> Dict[str, Any]:
        """Mock payment verification"""
        
        # In mock mode, all payments are successful
        payment = {
            "id": payment_id,
            "entity": "payment",
            "amount": self.orders.get(order_id, {}).get("amount", 10000),
            "currency": "INR",
            "status": "captured",
            "order_id": order_id,
            "method": "upi",
            "vpa": "user@paytm",
            "captured": True,
            "created_at": int(datetime.now().timestamp()),
            "fee": 0,  # Mock - no fees
            "tax": 0
        }
        
        self.payments[payment_id] = payment
        
        if order_id and order_id in self.orders:
            self.orders[order_id]["status"] = "paid"
            self.orders[order_id]["amount_paid"] = payment["amount"]
            self.orders[order_id]["amount_due"] = 0
        
        return {
            "verified": True,
            "payment": payment
        }
    
    async def get_order(self, order_id: str) -> Dict[str, Any]:
        """Mock get order by ID"""
        return self.orders.get(order_id, {
            "error": "Order not found",
            "status": "failed"
        })
    
    async def refund_payment(
        self, 
        payment_id: str,
        amount: int = None
    ) -> Dict[str, Any]:
        """Mock refund creation"""
        
        refund_id = self._generate_id("rfnd")
        
        payment = self.payments.get(payment_id, {})
        refund_amount = amount or payment.get("amount", 10000)
        
        refund = {
            "id": refund_id,
            "entity": "refund",
            "amount": refund_amount,
            "currency": "INR",
            "payment_id": payment_id,
            "status": "processed",
            "created_at": int(datetime.now().timestamp()),
            "speed_processed": "instant"
        }
        
        return refund


# Singleton instance
mock_razorpay = MockRazorpayService()
