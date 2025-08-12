import React, { useState } from 'react';
import { Plus, Trash2, Settings as SettingsIcon, Check, Webhook } from 'lucide-react';
import { useWebhookContext } from '../contexts/WebhookContext';

const WebhookSetupScreen: React.FC = () => {
  const { webhooks, addWebhook, updateWebhook, deleteWebhook, testWebhook } = useWebhookContext();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'POST',
    headers: '{"Content-Type": "application/json"}',
    body: '{"message": "{{message}}", "user": "{{user}}", "timestamp": "{{timestamp}}"}',
    active: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      method: 'POST',
      headers: '{"Content-Type": "application/json"}',
      body: '{"message": "{{message}}", "user": "{{user}}", "timestamp": "{{timestamp}}"}',
      active: true
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateWebhook(editingId, formData);
    } else {
      addWebhook(formData);
    }
    resetForm();
  };

  const handleEdit = (webhook: any) => {
    setFormData({
      name: webhook.name,
      url: webhook.url,
      method: webhook.method,
      headers: webhook.headers,
      body: webhook.body,
      active: webhook.active
    });
    setEditingId(webhook.id);
    setIsAdding(true);
  };

  const handleTest = async (webhook: any) => {
    setTestResults({ ...testResults, [webhook.id]: { testing: true } });
    const result = await testWebhook(webhook);
    setTestResults({ ...testResults, [webhook.id]: result });
    
    // Clear test result after 3 seconds
    setTimeout(() => {
      setTestResults(prev => {
        const newResults = { ...prev };
        delete newResults[webhook.id];
        return newResults;
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Webhook Settings</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-600 hover:to-violet-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Webhook</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h4 className="text-white font-medium mb-4">
            {editingId ? 'Edit Webhook' : 'Add New Webhook'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                placeholder="My Webhook"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                placeholder="https://your-webhook-url.com/endpoint"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Method
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({...formData, method: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-800"
                />
                <label htmlFor="active" className="text-gray-300 text-sm">
                  Active
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Headers (JSON)
              </label>
              <textarea
                value={formData.headers}
                onChange={(e) => setFormData({...formData, headers: e.target.value})}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder='{"Authorization": "Bearer your-token"}'
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Body Template (JSON)
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({...formData, body: e.target.value})}
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              />
              <p className="text-gray-400 text-xs mt-1">
                Use {"{{message}}"} for message content, {"{{user}}"} for username, {"{{timestamp}}"} for timestamp
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-violet-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all"
              >
                {editingId ? 'Update' : 'Create'} Webhook
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Webhook List */}
      <div className="space-y-3">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="text-white font-medium">{webhook.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    webhook.active 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {webhook.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{webhook.url}</p>
                <p className="text-gray-500 text-xs">
                  {webhook.method} • Created {new Date(webhook.createdAt).toLocaleDateString()}
                </p>
                
                {testResults[webhook.id] && (
                  <div className={`mt-2 p-2 rounded text-sm ${
                    testResults[webhook.id].testing 
                      ? 'bg-yellow-900 text-yellow-300' 
                      : testResults[webhook.id].success 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                  }`}>
                    {testResults[webhook.id].testing 
                      ? 'Testing webhook...' 
                      : testResults[webhook.id].success 
                        ? `✓ Test successful (${testResults[webhook.id].status})` 
                        : `✗ Test failed: ${testResults[webhook.id].error}`
                    }
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTest(webhook)}
                  disabled={testResults[webhook.id]?.testing}
                  className="text-blue-400 hover:text-blue-300 p-1 disabled:opacity-50"
                  title="Test Webhook"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(webhook)}
                  className="text-gray-400 hover:text-gray-300 p-1"
                  title="Edit Webhook"
                >
                  <SettingsIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Delete Webhook"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {webhooks.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Webhook className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No webhooks configured yet</p>
            <p className="text-sm">Add your first webhook to get started</p>
          </div>
        )}
      </div>
    </div>
  )};