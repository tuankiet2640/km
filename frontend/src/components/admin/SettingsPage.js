import React, { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  
  // Mock settings data
  const settings = {
    general: {
      siteName: 'Mai AI Platform',
      siteDescription: 'An AI platform for creating and deploying intelligent agents',
      logo: '/logo.png',
      favicon: '/favicon.ico',
      primaryColor: '#e11d48',
      language: 'en-US',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY'
    },
    tokens: {
      defaultUserTokens: 5000,
      tokenPricing: [
        { amount: 10000, price: 10 },
        { amount: 50000, price: 45 },
        { amount: 100000, price: 80 }
      ],
      freeTrialTokens: 1000,
      reserveTokens: 10000000
    },
    security: {
      passwordMinLength: 8,
      passwordRequireSpecialChar: true,
      passwordRequireNumber: true,
      passwordRequireUppercase: true,
      twoFactorAuthDefault: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      lockoutDuration: 15
    },
    integrations: {
      openai: { enabled: true, apiKey: '••••••••••••••••••••••••••••••' },
      anthropic: { enabled: true, apiKey: '••••••••••••••••••••••••••••••' },
      google: { enabled: false, apiKey: '' },
      huggingface: { enabled: true, apiKey: '••••••••••••••••••••••••••••••' }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Platform Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure global settings for your AI platform.
        </p>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {['general', 'tokens', 'security', 'integrations'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Site Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  defaultValue={settings.general.siteName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Site Description
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  defaultValue={settings.general.siteDescription}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Primary Color
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="color"
                    className="h-8 w-8 rounded cursor-pointer"
                    defaultValue={settings.general.primaryColor}
                  />
                  <input
                    type="text"
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                    defaultValue={settings.general.primaryColor}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Language
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  defaultValue={settings.general.language}
                >
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="ja-JP">Japanese</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Timezone
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  defaultValue={settings.general.timezone}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date Format
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  defaultValue={settings.general.dateFormat}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Token Settings */}
        {/* {activeTab === 'tokens' && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Default User Tokens
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  defaultValue={settings.tokens.defaultUserTokens}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Amount of tokens to allocate to new users
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Free Trial Tokens
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  defaultValue={settings.tokens.freeTrialTokens}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Tokens provided during free trial period
                </p>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Token Pricing Tiers
                </label>
                <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Price (USD)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {settings.tokens.tokenPricing.map((tier, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {tier.amount.toLocaleString()} tokens
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            ${tier.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300 mr-3">
                              Edit
                            </button>
                            <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">
                  Add Pricing Tier
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password Minimum Length
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  defaultValue={settings.security.passwordMinLength}
                  min="6"
                  max="32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  defaultValue={settings.security.sessionTimeout}
                  min="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  defaultValue={settings.security.maxLoginAttempts}
                  min="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Account Lockout Duration (minutes)
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  defaultValue={settings.security.lockoutDuration}
                  min="5"
                />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireSpecial"
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded dark:border-gray-600"
                    defaultChecked={settings.security.passwordRequireSpecialChar}
                  />
                  <label htmlFor="requireSpecial" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Require special character in passwords
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireNumber"
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded dark:border-gray-600"
                    defaultChecked={settings.security.passwordRequireNumber}
                  />
                  <label htmlFor="requireNumber" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Require number in passwords
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireUppercase"
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded dark:border-gray-600"
                    defaultChecked={settings.security.passwordRequireUppercase}
                  />
                  <label htmlFor="requireUppercase" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Require uppercase letter in passwords
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorDefault"
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded dark:border-gray-600"
                    defaultChecked={settings.security.twoFactorAuthDefault}
                  />
                  <label htmlFor="twoFactorDefault" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Enable two-factor authentication by default for new users
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integrations Settings */}
        {activeTab === 'integrations' && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(settings.integrations).map(([provider, config]) => (
                <div key={provider} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                      {provider} Integration
                    </h3>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id={`toggle-${provider}`}
                        className="sr-only"
                        defaultChecked={config.enabled}
                      />
                      <label
                        htmlFor={`toggle-${provider}`}
                        className={`block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer ${
                          config.enabled ? 'bg-rose-500 dark:bg-rose-500' : ''
                        }`}
                      >
                        <span
                          className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                            config.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        ></span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        API Key
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="password"
                          className="flex-grow block w-full rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-rose-500 focus:ring-rose-500"
                          defaultValue={config.apiKey}
                          placeholder="Enter API key"
                        />
                        <button className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                          Show
                        </button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 text-sm">
                        Test Connection
                      </button>
                      <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                        Documentation
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none">
                Add New Integration
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 flex justify-end">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}