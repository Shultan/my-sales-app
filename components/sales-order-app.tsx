'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Check, Menu, Trash2, Edit2 } from 'lucide-react';

interface Order {
  id: number;
  customer: string;
  amount: number;
  status: 'pending' | 'completed';
  date: string;
  notes?: string;
}

type NewOrder = {
  customer: string;
  amount: string;
  status: 'pending' | 'completed';
  date: string;
  notes: string;
};

const INITIAL_ORDERS: Order[] = [
  { 
    id: 1, 
    customer: 'Acme Corp', 
    amount: 1500, 
    status: 'pending', 
    date: new Date().toISOString().split('T')[0], 
    notes: 'Quarterly subscription' 
  },
  { 
    id: 2, 
    customer: 'TechStart', 
    amount: 2300, 
    status: 'completed', 
    date: new Date().toISOString().split('T')[0], 
    notes: 'Hardware purchase' 
  },
];

export function SalesOrderApp() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch {
        setOrders(INITIAL_ORDERS);
      }
    } else {
      setOrders(INITIAL_ORDERS);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('orders', JSON.stringify(orders));
    }
  }, [orders, mounted]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const initialNewOrder: NewOrder = {
    customer: '',
    amount: '',
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  };

  const [newOrder, setNewOrder] = useState<NewOrder>(initialNewOrder);

  const handleAddOrder = () => {
    if (newOrder.customer && newOrder.amount) {
      const orderToSave: Order = {
        id: editingOrder ? editingOrder.id : Math.max(...orders.map(o => o.id), 0) + 1,
        customer: newOrder.customer,
        amount: Number(newOrder.amount),
        status: newOrder.status,
        date: newOrder.date,
        notes: newOrder.notes
      };

      if (editingOrder) {
        const updatedOrders = orders.map(order => 
          order.id === editingOrder.id ? orderToSave : order
        );
        setOrders(updatedOrders);
        setAlert({ type: 'success', message: 'Order updated successfully!' });
      } else {
        setOrders(prevOrders => [...prevOrders, orderToSave]);
        setAlert({ type: 'success', message: 'New order added successfully!' });
      }
      
      setNewOrder(initialNewOrder);
      setEditingOrder(null);
      setShowModal(false);
      setShowMenu(false);

      setTimeout(() => setAlert(null), 3000);
    } else {
      setAlert({ type: 'error', message: 'Please fill in all required fields!' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setNewOrder({
      customer: order.customer,
      amount: order.amount.toString(),
      status: order.status,
      date: order.date,
      notes: order.notes || ''
    });
    setShowModal(true);
    setShowMenu(false);
  };

  const handleDeleteOrder = (id: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(orders.filter(order => order.id !== id));
      setAlert({ type: 'success', message: 'Order deleted successfully!' });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const toggleStatus = (id: number) => {
    setOrders(orders.map(order => 
      order.id === id 
        ? { ...order, status: order.status === 'pending' ? 'completed' : 'pending' }
        : order
    ));
  };

  let filteredOrders = orders.filter(order =>
    (order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.amount.toString().includes(searchTerm)) &&
    (statusFilter === 'all' || order.status === statusFilter)
  );

  filteredOrders = [...filteredOrders].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    if (sortBy === 'date') {
      return modifier * (new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return modifier * (a.amount - b.amount);
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">Sales Orders</h1>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alert && (
          <div className={`mb-4 p-4 rounded-lg ${
            alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {alert.message}
          </div>
        )}

        <div className={`${showMenu ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <select
                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed')}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <select
                className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [newSortBy, newDirection] = e.target.value.split('-');
                  setSortBy(newSortBy as 'date' | 'amount');
                  setSortDirection(newDirection as 'asc' | 'desc');
                }}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>

              <button
                onClick={() => {
                  setEditingOrder(null);
                  setNewOrder(initialNewOrder);
                  setShowModal(true);
                  setShowMenu(false);
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Order
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{order.customer}</h3>
                  {order.notes && (
                    <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(order.id)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.status === 'completed' ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Completed
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-1" />
                        Pending
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleEditOrder(order)}
                    className="p-1 text-gray-600 hover:text-blue-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="p-1 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  ${order.amount.toLocaleString('en-US')}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(order.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No orders found matching your criteria
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingOrder ? 'Edit Order' : 'Create New Order'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newOrder.customer}
                  onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={newOrder.amount}
                  onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full p-2 border rounded"
                  value={newOrder.status}
                  onChange={(e) => setNewOrder({...newOrder, status: e.target.value as 'pending' | 'completed'})}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  value={newOrder.date}
                  onChange={(e) => setNewOrder({...newOrder, date: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddOrder}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {editingOrder ? 'Update Order' : 'Add Order'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingOrder(null);
                    setNewOrder(initialNewOrder);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
